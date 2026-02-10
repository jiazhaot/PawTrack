package util

import (
	"bytes"
	"encoding/base64"
	"errors"
	"fmt"
	"image"
	"image/color"
	"image/draw"
	"image/jpeg"
	"image/png"
	"io"
	"net/http"
	"os"
	"path"
	"strings"

	"github.com/disintegration/imaging"
	"github.com/nfnt/resize"
	"golang.org/x/image/webp"
)

func max(a int, b int) int {
	if a < b {
		return b
	}
	return a
}

func LoadImageByPath(path string) (image.Image, string, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, "", err
	}
	defer file.Close()

	img, format, err := image.Decode(file)
	if err != nil {
		return nil, "", err
	}

	return img, format, nil
}

// resizeToSquare
func ResizeToSquare(img image.Image, size int) image.Image {
	if size == 0 {
		size = 300
	}
	//
	width := img.Bounds().Dx()
	height := img.Bounds().Dy()

	//
	maxSide := max(width, height)

	//
	dst := image.NewRGBA(image.Rect(0, 0, maxSide, maxSide))

	//
	clearColor := color.NRGBA{0, 0, 0, 0}
	draw.Draw(dst, dst.Bounds(), &image.Uniform{clearColor}, image.Point{}, draw.Src)

	//
	offsetX := (maxSide - width) / 2
	offsetY := (maxSide - height) / 2

	//
	draw.Draw(dst, image.Rect(offsetX, offsetY, offsetX+width, offsetY+height), img, image.Point{}, draw.Over)

	//
	result := imaging.Resize(dst, size, size, imaging.Lanczos)

	return result
}

// ImageToBase64
func ImageToBase64(img image.Image, imgType string) (string, error) {
	//
	var buf bytes.Buffer

	if imgType == "png" {
		err := png.Encode(&buf, img)
		if err != nil {
			return "", err
		}
	} else if imgType == "jpeg" {
		err := jpeg.Encode(&buf, img, nil)
		if err != nil {
			return "", err
		}
	}
	//
	base64Str := ""
	if imgType == "png" {
		base64Str = "data:image/png;base64,"
	} else if imgType == "jpeg" {
		base64Str = "data:image/jpeg;base64,"
	}
	base64Str += base64.StdEncoding.EncodeToString(buf.Bytes())
	return base64Str, nil
}

func DecodeBase64StrIntoImg(base64String string) (image.Image, error) {
	if base64String == "" || len(base64String) < 15 {
		return nil, errors.New("invalid input")
	}
	imgType := base64String[0:15]

	if idx := strings.Index(base64String, ","); idx != -1 {
		base64String = base64String[idx+1:]
	}

	imgData, err := base64.StdEncoding.DecodeString(base64String)
	if err != nil {
		return nil, errors.New("base64 decode fail:" + err.Error())
	}

	reader := bytes.NewReader(imgData)
	var img image.Image
	if imgType == "data:image/png;" {
		//png
		pngImg, err := png.Decode(reader)
		if err != nil {
			return nil, errors.New("image decode fail:" + err.Error())
		}
		img = pngImg
	} else if imgType == "data:image/jpeg" {
		//jpeg/jpg
		jpegImg, err := jpeg.Decode(reader)
		if err != nil {
			return nil, errors.New("image decode fail:" + err.Error())
		}
		img = jpegImg
	} else if imgType == "data:image/webp" {
		//webp
		webpImg, err := webp.Decode(reader)
		if err != nil {
			return nil, errors.New("image decode fail:" + err.Error())
		}
		img = webpImg
	} else {
		return nil, errors.New("invalid input")
	}
	return img, nil
}

func ResizeImg(originImg image.Image, newWidth int, newHeight int) image.Image {
	return resize.Resize(uint(newWidth), uint(newHeight), originImg, resize.Lanczos3)
}

func SaveImgIntoPath(img image.Image, fileName string, pathWithoutFileName string) error {
	if strings.Contains(fileName, ".") {
		fileName = fileName[0:strings.Index(fileName, ".")]
	}
	fileName += ".png"
	newfile, err := os.Create(path.Join(pathWithoutFileName, fileName))
	if err != nil {
		return err
	}
	defer newfile.Close()

	err = png.Encode(newfile, img)
	if err != nil {
		return err
	}
	return nil
}

func DecodeCardWithDefault(base64String string) (image.Image, error) {
	if base64String == "" || len(base64String) < 15 {

		file, err := os.Open("/data/image/default.png")
		if err != nil {
			return nil, errors.New("open default image fail:" + err.Error())
		}
		defer file.Close()

		defaultImg, err := png.Decode(file)
		if err != nil {
			return nil, errors.New("decode default image fail:" + err.Error())
		}
		return defaultImg, nil
	}
	imgType := base64String[0:15]

	if idx := strings.Index(base64String, ","); idx != -1 {
		base64String = base64String[idx+1:]
	}

	imgData, err := base64.StdEncoding.DecodeString(base64String)
	if err != nil {
		return nil, errors.New("base64 decode fail:" + err.Error())
	}

	reader := bytes.NewReader(imgData)
	var img image.Image
	if imgType == "data:image/png;" {
		//png
		pngImg, err := png.Decode(reader)
		if err != nil {
			return nil, errors.New("image decode fail:" + err.Error())
		}
		img = pngImg
	} else if imgType == "data:image/jpeg" {
		//jpeg/jpg
		jpegImg, err := jpeg.Decode(reader)
		if err != nil {
			return nil, errors.New("image decode fail:" + err.Error())
		}
		img = jpegImg
	} else if imgType == "data:image/webp" {
		//webp
		webpImg, err := webp.Decode(reader)
		if err != nil {
			return nil, errors.New("image decode fail:" + err.Error())
		}
		img = webpImg
	} else {
		//
		file, err := os.Open("/data/image/default.png")
		if err != nil {
			return nil, errors.New("open default image fail:" + err.Error())
		}
		defer file.Close()

		defaultImg, err := png.Decode(file)
		if err != nil {
			return nil, errors.New("decode default image fail:" + err.Error())
		}
		img = defaultImg
	}
	return img, nil
}

func DownloadImageAsBytes(url string) ([]byte, error) {

	resp, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch image: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("non-200 response: %d", resp.StatusCode)
	}

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read image body: %w", err)
	}

	return data, nil
}

func DownloadImageAsImage(url string) (image.Image, error) {

	client := &http.Client{}

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		panic(err)
	}

	req.Header.Set("referer", "admin.kapaipai.tw")

	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	// resp, err := http.Get(url)
	// if err != nil {
	// 	return nil, fmt.Errorf("failed to download: %w", err)
	// }
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("bad response status: %s", resp.Status)
	}

	img, _, err := image.Decode(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to decode image: %w", err)
	}

	return img, nil
}
