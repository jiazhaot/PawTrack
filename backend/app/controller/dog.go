package controller

import (
	"github.com/gin-gonic/gin"

	"github.com/yiff028/comp90018-mobile-project/backend/api/types"
	"github.com/yiff028/comp90018-mobile-project/backend/app/mixin"
	"github.com/yiff028/comp90018-mobile-project/backend/app/model/schema"
	"github.com/yiff028/comp90018-mobile-project/backend/app/service"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/errors"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/logger"
)

// DogController
type DogController struct {
	Dep mixin.StoreDepency
	WS  service.WebService
}

// CreateDog
func (d *DogController) CreateDog(c *gin.Context) {
	ctx := c.Request.Context()

	var param schema.Dog
	if err := c.ShouldBindJSON(&param); err != nil {
		logger.Errorf(ctx, "parse query params failed %+v", err)
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

	param.UserId = userId
	err := d.Dep.DogModel.Create(ctx, &param)
	if err != nil {
		logger.Errorf(ctx, "create dog fail %+v", err)
		mixin.ResError(c, errors.CreateDogFail)
		return
	}

	mixin.ResSuccess(c, gin.H{
		"code":    0,
		"message": "ok",
		"data":    param,
	})
}

// ListDog
func (d *DogController) ListDog(c *gin.Context) {
	ctx := c.Request.Context()

	userId := c.GetUint("UserID")
	if userId == 0 {
		errInfoWithStack := errors.WithStack(errors.New("userid from cookie fail"))
		logger.Errorf(ctx, "fetch userid failed %+v", errInfoWithStack)
		mixin.ResError(c, errors.ErrQueryUserInfoFail)
		return
	}

	dogList, err := d.Dep.DogModel.List(ctx, userId)
	if err != nil {
		logger.Errorf(ctx, "list dog fail %+v", err)
		mixin.ResError(c, errors.ListDogFail)
		return
	}

	mixin.ResSuccess(c, gin.H{
		"code":    0,
		"message": "ok",
		"data":    dogList,
	})
}

// ListCurrentDog
func (d *DogController) ListCurrentDog(c *gin.Context) {
	ctx := c.Request.Context()

	dogList, err := d.Dep.DogModel.ListCurrentDog(ctx)
	if err != nil {
		logger.Errorf(ctx, "list dog fail %+v", err)
		mixin.ResError(c, errors.ListDogFail)
		return
	}

	mixin.ResSuccess(c, gin.H{
		"code":    0,
		"message": "ok",
		"data":    dogList,
	})
}

// DeleteDog
func (d *DogController) DeleteDog(c *gin.Context) {
	ctx := c.Request.Context()

	var param types.DogEditParam
	if err := c.ShouldBindJSON(&param); err != nil {
		logger.Errorf(ctx, "parse query params failed %+v", err)
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

	err := d.Dep.DogModel.Delete(ctx, param.DogId, userId)
	if err != nil {
		logger.Errorf(ctx, "delete dog fail %+v", err)
		mixin.ResError(c, errors.DeleteDogFail)
		return
	}

	mixin.ResSuccess(c, gin.H{
		"code":    0,
		"message": "ok",
	})
}
