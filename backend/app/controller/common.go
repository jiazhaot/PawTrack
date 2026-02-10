package controller

import (
	"fmt"
	"image"
	"image/jpeg"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	jsoniter "github.com/json-iterator/go"

	"github.com/yiff028/comp90018-mobile-project/backend/api/types"
	"github.com/yiff028/comp90018-mobile-project/backend/app/mixin"
	"github.com/yiff028/comp90018-mobile-project/backend/app/service"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/errors"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/logger"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/util"
)

// CommonController
type CommonController struct {
	Dep mixin.StoreDepency
	WS  service.WebService
}

// CreateImage
func (common *CommonController) CreateImage(c *gin.Context) {
	ctx := c.Request.Context()
	var param types.CreateImageParam
	if err := c.ShouldBind(&param); err != nil {
		errInfoWithStack := errors.WithStack(err)
		logger.Errorf(ctx, "parse query params failed %+v", errInfoWithStack)
		mixin.ResError(c, errors.ErrParseQueryFail)
		return
	}
	userId := c.GetUint("UserID")
	if userId == 0 {
		errInfoWithStack := errors.WithStack(errors.New("userid from cookie fail"))
		logger.Errorf(ctx, "fetch userid failed %+v", errInfoWithStack)
		mixin.ResError(c, errors.ErrQueryUserInfoFail)
		return
	}
	//check type
	if !(param.Type == "mp4" || param.Type == "image") {
		logger.Errorf(ctx, "illegal type ")
		mixin.ResError(c, errors.ErrImageFormatFail)
		return
	}
	//get updated file
	fileHeader := param.File

	if param.Type == "image" {
		file, err := fileHeader.Open()
		if err != nil {
			logger.Errorf(ctx, "decode file error %+v", err)
			mixin.ResError(c, errors.ErrUserImageDecodeFail)
			return
		}
		if file == nil {
			logger.Errorf(ctx, "file is nil error %+v", err)
			mixin.ResError(c, errors.ErrUserImageOpenFail)
			return
		}
		defer file.Close()

		image, _, err := image.Decode(file)
		if err != nil {
			logger.Errorf(ctx, "file decode to image fail %+v", err)
			mixin.ResError(c, errors.ErrUserImageDecodeFail)
			return
		}

		fileId := uuid.New().String()
		filePath := "/data/img/" + fileId + ".jpg"
		returnUrl := "https://pawtrack.xyz/image/" + fileId + ".jpg"

		// create file
		out, err := os.Create(filePath)
		if err != nil {
			logger.Errorf(ctx, "file create path fail %+v", err)
			mixin.ResError(c, errors.ErrImageCreateFileFail)
			return
		}
		defer out.Close()

		if err := jpeg.Encode(out, image, &jpeg.Options{Quality: 85}); err != nil {
			logger.Errorf(ctx, "file save to path fail %+v", err)
			mixin.ResError(c, errors.ErrImageSaveFileFail)
			return
		}

		mixin.ResSuccess(c, gin.H{
			"code":    0,
			"message": "ok",
			"data":    returnUrl,
		})
		return
	}

	mixin.ResSuccess(c, gin.H{
		"code":    0,
		"message": "ok",
	})
}

// GetWeather
func (common *CommonController) GetWeather(c *gin.Context) {
	ctx := c.Request.Context()
	var param types.WeatherSearchParam
	if err := c.ShouldBindQuery(&param); err != nil {
		errInfoWithStack := errors.WithStack(err)
		logger.Errorf(ctx, "parse query params failed %+v", errInfoWithStack)
		mixin.ResError(c, errors.ErrParseQueryFail)
		return
	}
	userId := c.GetUint("UserID")
	if userId == 0 {
		errInfoWithStack := errors.WithStack(errors.New("userid from cookie fail"))
		logger.Errorf(ctx, "fetch userid failed %+v", errInfoWithStack)
		mixin.ResError(c, errors.ErrQueryUserInfoFail)
		return
	}

	//redis-cache
	cacheKey := fmt.Sprintf("weather:%d", userId)
	var locationInfo interface{}

	cachedInfo, err := common.Dep.RedisClient.Get(cacheKey)
	if err != nil {
		mixin.ResError(c, errors.GetWeatherUsingApiFail)
		return
	}
	if cachedInfo == "" {
		locationInfo, err = common.WS.GetByLocation(param.Lon, param.Lat)
		if err != nil {
			logger.Errorf(ctx, "get weather by location using third api fail %+v", err)
			mixin.ResError(c, errors.GetWeatherUsingApiFail)
			return
		}

		marshalStr, err := jsoniter.Marshal(locationInfo)
		if err != nil {
			logger.Errorf(ctx, "json marshal fail %+v", err)
			mixin.ResError(c, errors.GetWeatherUsingApiFail)
			return
		}
		_, err = common.Dep.RedisClient.Set(cacheKey, marshalStr, 30*time.Minute)
		if err != nil {
			logger.Errorf(ctx, "set to redis fail %+v", err)
			mixin.ResError(c, errors.GetWeatherUsingApiFail)
			return
		}
	} else {
		var res interface{}
		marshalErr := util.JSONUnmarshal([]byte(cachedInfo), &res)
		if marshalErr != nil {
			logger.Errorf(ctx, "json unmarshal fail %+v", err)
			mixin.ResError(c, errors.GetWeatherUsingApiFail)
			return
		}
		locationInfo = res
	}

	mixin.ResSuccess(c, gin.H{
		"code":    0,
		"message": "ok",
		"data":    locationInfo,
	})
}
