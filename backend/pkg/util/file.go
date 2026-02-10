package util

import (
	"archive/zip"
	"crypto/sha256"
	"encoding/hex"
	"io"
	"io/ioutil"
	"mime/multipart"
	"os"
	"path"
	"strings"

	"github.com/yiff028/comp90018-mobile-project/backend/pkg/errors"
)

// FileInfo
type FileInfo struct {
	FileName string
	FileID   string
}

// MultipartCheckSum CheckSum
func MultipartCheckSum(fileHeader *multipart.FileHeader) (string, error) {
	hash := sha256.New()
	file, err := fileHeader.Open()
	if err != nil {
		return "", err
	}
	defer file.Close()
	if _, err := io.Copy(hash, file); err != nil {
		return "", err
	}
	//
	sum := hash.Sum(nil)
	fileHash := hex.EncodeToString(sum)
	return fileHash, nil
}

// CheckSum
func CheckSum(file *os.File) (string, error) {
	hash := sha256.New()
	if _, err := io.Copy(hash, file); err != nil {
		return "", err
	}
	//
	sum := hash.Sum(nil)
	fileHash := hex.EncodeToString(sum)
	return fileHash, nil
}

// PathExists
func PathExists(path string) (bool, error) {
	_, err := os.Stat(path)
	if err == nil {
		return true, nil
	}
	if os.IsNotExist(err) {
		return false, nil
	}
	return false, err
}

// Createdir
func Createdir(dir string) bool {
	exist, err := PathExists(dir)
	if err != nil {
		return false
	}
	if exist {
		return true
	} else {
		//
		err := os.Mkdir(dir, os.ModePerm)
		if err != nil {
			return false
		} else {
			return true
		}
	}
}

// CopyFile
func CopyFile(oldPath, newPath string) error {

	input, err := ioutil.ReadFile(oldPath)
	if err != nil {

		return err
	}
	err = ioutil.WriteFile(newPath, input, 0755)
	if err != nil {
		return err
	}
	return nil

}

// ZipFiles
func ZipFiles(fileName string, files []FileInfo) error {
	newZipFile, err := os.Create(fileName)
	if err != nil {
		return err
	}
	//
	defer newZipFile.Close()
	zipWriter := zip.NewWriter(newZipFile)
	defer zipWriter.Close()

	// Add file to zip
	for _, file := range files {
		if err = AddFileToZip(zipWriter, file); err != nil {
			return err
		}
	}
	return nil
}

// AddFileToZip
func AddFileToZip(zipWriter *zip.Writer, fileInfo FileInfo) error {
	fileToZip, err := os.Open(fileInfo.FileID)
	if err != nil {
		return err
	}
	defer fileToZip.Close()
	// GetFile information
	info, err := fileToZip.Stat()
	if err != nil {
		return err
	}
	header, err := zip.FileInfoHeader(info)
	if err != nil {
		return err
	}
	//
	header.Name = path.Base(fileInfo.FileName)
	header.Method = zip.Deflate
	writer, err := zipWriter.CreateHeader(header)
	if err != nil {
		return err
	}
	_, cErr := io.Copy(writer, fileToZip)
	if cErr != nil {
		return errors.WithStack(cErr)
	}
	return nil
}

// GetFilesWithKeyWords
func GetFilesWithKeyWords(filePath string, keyWords []string) ([]os.FileInfo, error) {
	files, err := ioutil.ReadDir(filePath)
	if err != nil {
		return nil, err
	}
	if len(keyWords) == 0 {
		return []os.FileInfo{}, nil
	}
	var resFiles []os.FileInfo
	for _, file := range files {
		for _, keyWord := range keyWords {
			if strings.Contains(file.Name(), keyWord) {
				resFiles = append(resFiles, file)
				break
			}
		}
	}
	return resFiles, nil
}
