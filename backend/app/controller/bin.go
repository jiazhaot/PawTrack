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

// BinController
type BinController struct {
	Dep mixin.StoreDepency
	WS  service.WebService
}

// CreateBin
func (r *BinController) CreateBin(c *gin.Context) {
	ctx := c.Request.Context()

	var param schema.Bin
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

	err := r.Dep.BinModel.Create(ctx, &param)
	if err != nil {
		logger.Errorf(ctx, "create bin fail %+v", err)
		mixin.ResError(c, errors.CreateBinFail)
		return
	}

	mixin.ResSuccess(c, gin.H{
		"code":    0,
		"message": "ok",
		"data":    param,
	})
}

// Delete Bin
func (r *BinController) DeleteBin(c *gin.Context) {
	ctx := c.Request.Context()

	var param types.BinDeleteParam
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

	err := r.Dep.BinModel.Delete(ctx, param.BinId, userId)
	if err != nil {
		logger.Errorf(ctx, "delete bin fail %+v", err)
		mixin.ResError(c, errors.DeleteBinFail)
		return
	}

	mixin.ResSuccess(c, gin.H{
		"code":    0,
		"message": "ok",
	})
}

//ListMyBin
func (r *BinController) ListMyBin(c *gin.Context) {
	ctx := c.Request.Context()

	userId := c.GetUint("UserID")
	if userId == 0 {
		errInfoWithStack := errors.WithStack(errors.New("userid from cookie fail"))
		logger.Errorf(ctx, "fetch userid failed %+v", errInfoWithStack)
		mixin.ResError(c, errors.ErrQueryUserInfoFail)
		return
	}

	binList, err := r.Dep.BinModel.ListMy(ctx, userId)
	if err != nil {
		logger.Errorf(ctx, "list bin fail %+v", err)
		mixin.ResError(c, errors.ListAllBinFail)
		return
	}

	mixin.ResSuccess(c, gin.H{
		"code":    0,
		"message": "ok",
		"data":    binList,
	})
}

// ListAllBin
func (r *BinController) ListAllBin(c *gin.Context) {
	ctx := c.Request.Context()

	userId := c.GetUint("UserID")
	if userId == 0 {
		errInfoWithStack := errors.WithStack(errors.New("userid from cookie fail"))
		logger.Errorf(ctx, "fetch userid failed %+v", errInfoWithStack)
		mixin.ResError(c, errors.ErrQueryUserInfoFail)
		return
	}

	binList, err := r.Dep.BinModel.ListAll(ctx)
	if err != nil {
		logger.Errorf(ctx, "list bin fail %+v", err)
		mixin.ResError(c, errors.ListAllBinFail)
		return
	}

	mixin.ResSuccess(c, gin.H{
		"code":    0,
		"message": "ok",
		"data":    binList,
	})
}
