package util

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/md5"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"hash/fnv"
	"io"
	mrand "math/rand"
	"net/url"
	"reflect"
	"sort"
	"strings"

	"golang.org/x/crypto/pbkdf2"
)

const EncryptSHA256 = "SHA256"
const EncryptMD5 = "MD5"

// Encrypt AES-256-GCM
func Encrypt(text string, masterkey []byte) (string, error) {
	// randomSalt 64 byte
	salt, err := generateRandomBytes(64)
	if err != nil {
		return "", err
	}
	// 32 byte keylen used to choose AES 256
	key := pbkdf2.Key(masterkey, salt, 100, 32, sha256.New)
	// AES 256 GCM mode
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}
	// GCM
	aesgcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	// 2.
	nonce := make([]byte, aesgcm.NonceSize())
	_, err = io.ReadFull(rand.Reader, nonce)
	if err != nil {
		return "", err
	}
	//
	cipherTextWithNonce := aesgcm.Seal(nonce, nonce, []byte(text), nil)
	encrypted := append(salt, cipherTextWithNonce...)
	encryptStr := base64.StdEncoding.EncodeToString(encrypted)
	return encryptStr, nil
}

// Decrypt AES-256-GCM
func Decrypt(encryptstr string, masterkey []byte) ([]byte, error) {
	bData, err := base64.StdEncoding.DecodeString(encryptstr)
	if err != nil {
		return nil, err
	}
	salt := bData[0:64]
	cipherText := bData[64:]
	var key = pbkdf2.Key(masterkey, salt, 100, 32, sha256.New)
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}
	// if len(cipherText) < gcm.NonceSize()
	originText, err := gcm.Open(nil, cipherText[:gcm.NonceSize()], cipherText[gcm.NonceSize():], nil)
	if err != nil {
		return nil, err
	}
	return originText, nil
}

// GenerateRandomBytes
func generateRandomBytes(n int) ([]byte, error) {
	bytes := make([]byte, n)
	_, err := rand.Read(bytes)
	if err != nil {
		return nil, err
	}
	return bytes, nil
}

// GenerateSigningKey
func GenerateSigningKey() ([]byte, error) {
	randomPassword, err := generateRandomBytes(64)
	if err != nil {
		return nil, err
	}
	randomSalt, err := generateRandomBytes(64)
	if err != nil {
		return nil, err
	}
	key := pbkdf2.Key(randomPassword, randomSalt, 100, 32, sha256.New)
	return key, nil
}

// CreateSHAHash
func CreateSHAHash(strToHash string) string {
	h := sha256.New()
	h.Write([]byte(strToHash))
	hashRes := hex.EncodeToString(h.Sum(nil))
	return hashRes
}

// GetRandomSalt
func GetRandomSalt(size int) []byte {
	const allowedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	salt := make([]byte, size)
	l := len(allowedChars)
	for i := range salt {
		salt[i] = allowedChars[mrand.Intn(l)]
	}
	return salt
}

type fieldValue struct {
	key   string
	value string
}

func GenerateCheckMacValue(data any, algorithm string) string {
	v := reflect.ValueOf(data)
	t := reflect.TypeOf(data)
	var fields []fieldValue

	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		key := field.Tag.Get("key")
		if key == "" {
			key = field.Name
		}
		if v.Field(i).Kind() == reflect.Ptr {
			if v.Field(i).IsNil() {
				continue
			} else {
				value := fmt.Sprintf("%v", v.Field(i).Elem().Interface())
				fields = append(fields, fieldValue{key: key, value: value})
				continue
			}
		}
		//not ptr
		value := fmt.Sprintf("%v", v.Field(i).Interface())
		fields = append(fields, fieldValue{key: key, value: value})
	}
	var newFields []fieldValue
	var first fieldValue
	var last fieldValue
	for _, val := range fields {
		if val.key == "CheckMacValue" {
			continue
		}
		if val.key == "HashKey" {
			first = val
			continue
		}
		if val.key == "HashIV" {
			last = val
			continue
		}
		newFields = append(newFields, val)
	}

	sort.Slice(newFields, func(i, j int) bool {
		return newFields[i].key < newFields[j].key
	})
	newFields = append(newFields, last)
	newFields = append([]fieldValue{first}, newFields...)
	str := ""
	for _, value := range newFields {
		str += value.key + "=" + value.value + "&"
	}
	str = str[0 : len(str)-1]
	urlEncodedStr := url.QueryEscape(str)
	urlEncodedStr = strings.ToLower(urlEncodedStr)

	urlEncodedStr = strings.ReplaceAll(urlEncodedStr, "%20", "+")
	// urlEncodedStr = strings.ReplaceAll(urlEncodedStr, "%5f", "_")
	// urlEncodedStr = strings.ReplaceAll(urlEncodedStr, "%2e", ".")
	// urlEncodedStr = strings.ReplaceAll(urlEncodedStr, "%21", "!")
	urlEncodedStr = strings.ReplaceAll(urlEncodedStr, "%2a", "*")
	urlEncodedStr = strings.ReplaceAll(urlEncodedStr, "%28", "(")
	urlEncodedStr = strings.ReplaceAll(urlEncodedStr, "%29", ")")

	var finalStr string

	//
	if algorithm == EncryptMD5 {
		hash := md5.New()
		hash.Write([]byte(urlEncodedStr))
		hashBytes := hash.Sum(nil)

		//
		hashString := hex.EncodeToString(hashBytes)
		finalStr = strings.ToUpper(hashString)
	}
	if algorithm == EncryptSHA256 {
		hash := sha256.New()
		hash.Write([]byte(urlEncodedStr))
		hashBytes := hash.Sum(nil)

		//
		hashString := hex.EncodeToString(hashBytes)
		finalStr = strings.ToUpper(hashString)
	}

	return finalStr
}

const base36Chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"

// Base36
func base36Encode(num uint64, length int) string {
	res := ""
	for i := 0; i < length; i++ {
		res = string(base36Chars[num%36]) + res
		num /= 36
	}
	return res
}

func GenerateShortKey(name string) string {
	h := fnv.New64a() // MurmurHash
	h.Write([]byte(name))
	hashNum := h.Sum64()
	return base36Encode(hashNum, 8) //  Base36
}
