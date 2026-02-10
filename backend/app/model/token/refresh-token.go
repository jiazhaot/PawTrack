package itoken

import (
	"fmt"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/yiff028/comp90018-mobile-project/backend/app/config"
	"github.com/yiff028/comp90018-mobile-project/backend/app/model/schema"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/driver"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/errors"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/util"
)

const REFRESH_TOKEN_USER_KEY_NAME = "paw_track_user_refresh_token_key"
const REFRESH_TOKEN_USER_AUTH_NAME = "paw_track_refresh_auth"
const REFRESH_TOKEN_KEY_AGE = 2592000

// 8h
const REFRESH_TOKEN_VALIDITY_MAX_AGE = 2592000 //30days

// RefreshToken
type RefreshToken interface {
	GenerateRefreshToken(user *schema.User) (*RefreshTokenCookie, error)
	VerifyRefreshToken(tokenStr string) (*UserPayload, error)
	SaveKey() (*RefreshKey, error)
	getKey() (*RefreshKey, error)
}

type refreshToken struct {
	Context      *gin.Context
	RedisClient  driver.ClientType
	TokenKeyName string
}

// RefreshKey
type RefreshKey struct {
	KeyVal     string
	CreateTime string
}

// UserPayload
type UserPayload struct {
	User  *schema.User
	Nonce string
}

// RefreshTokenCookie
type RefreshTokenCookie struct {
	Name     string
	Val      string
	Secure   bool
	HTTPOnly bool
	MaxAge   int
	Domain   string
	Path     string
}

// NewRefreshToken
func NewRefreshToken(ctx *gin.Context, redisClient driver.ClientType, tokenKeyName string) RefreshToken {
	return &refreshToken{
		Context:      ctx,
		RedisClient:  redisClient,
		TokenKeyName: tokenKeyName,
	}
}

// GenerateRefreshToken
func (r *refreshToken) GenerateRefreshToken(user *schema.User) (*RefreshTokenCookie, error) {
	config := config.C.GetConfig()
	refreshKey, err := r.getKey()
	if err != nil {
		return nil, err
	}
	uuid, err := util.NewUUID()
	if err != nil {
		return nil, err
	}
	nonce := util.CreateSHAHash(uuid.String())

	var userData = UserPayload{
		User:  user,
		Nonce: nonce,
	}
	payloadSerialised := util.JSONMarshalToString(userData)
	encryptedPart, err := util.Encrypt(payloadSerialised, []byte(refreshKey.KeyVal))
	if err != nil {
		return nil, err
	}
	refreshToken := encryptedPart + "." + nonce
	maxAge := int(time.Second * REFRESH_TOKEN_VALIDITY_MAX_AGE)
	cookie := RefreshTokenCookie{
		Name:     REFRESH_TOKEN_USER_AUTH_NAME,
		Val:      refreshToken,
		Secure:   config.HTTP.Secure,
		HTTPOnly: true,
		MaxAge:   maxAge,
	}
	return &cookie, nil
}

// VerifyRefreshToken
func (r *refreshToken) VerifyRefreshToken(tokenStr string) (*UserPayload, error) {
	splittedToken := strings.Split(tokenStr, ".")
	if len(splittedToken) != 2 {
		return nil, fmt.Errorf("invalid refresh token")
	}
	nonce := splittedToken[1]
	refreshKey, err := r.getKey()
	if err != nil {
		return nil, errors.WithStack(err)
	}

	decryptRes, err := util.Decrypt(splittedToken[0], []byte(refreshKey.KeyVal))
	if err != nil {
		return nil, errors.WithStack(err)
	}
	var userData *UserPayload = &UserPayload{}
	jsonerr := util.JSONUnmarshal(decryptRes, userData)
	if jsonerr != nil {
		return nil, jsonerr
	}
	nonceFromEnc := userData.Nonce
	if nonceFromEnc != nonce {
		return nil, fmt.Errorf("invalid refresh token")
	}
	return userData, nil
}

func (r *refreshToken) SaveKey() (*RefreshKey, error) {
	keyVal, err := util.GenerateSigningKey()
	if err != nil {
		return nil, errors.WithStack(err)
	}

	var refreshKey = &RefreshKey{
		KeyVal:     string(keyVal),
		CreateTime: time.Now().String(),
	}
	res, err := r.RedisClient.HMSet(r.TokenKeyName, "key", refreshKey.KeyVal, "createdTime", refreshKey.CreateTime)
	if err != nil {
		return nil, errors.WithStack(err)
	}
	expireRes, err := r.RedisClient.Expire(r.TokenKeyName, REFRESH_TOKEN_KEY_AGE*time.Second)
	if err != nil {
		return nil, errors.WithStack(err)
	}
	if !expireRes || !res {
		refreshKey = nil
	}
	return refreshKey, nil
}

func (r *refreshToken) getKey() (*RefreshKey, error) {
	var refreshKey map[string]string
	exists := r.RedisClient.IsExist(r.TokenKeyName)
	if exists {
		var rErr error
		refreshKey, rErr = r.RedisClient.HGetAll(r.TokenKeyName)
		if rErr != nil {
			return nil, errors.WithStack(rErr)
		}
	} else {
		refreshKey = map[string]string{}
	}
	if len(refreshKey) < 1 {
		nkey, err := r.SaveKey()
		if err != nil {
			return nil, errors.WithStack(err)
		}
		return nkey, nil
	}
	var refreshKeyStruct = &RefreshKey{
		KeyVal:     refreshKey["key"],
		CreateTime: refreshKey["createdTime"],
	}
	return refreshKeyStruct, nil
}
