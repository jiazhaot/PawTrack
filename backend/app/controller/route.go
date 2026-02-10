package controller

import (
	"context"

	"github.com/gin-gonic/gin"
	"github.com/yiff028/comp90018-mobile-project/backend/api/types"
	"github.com/yiff028/comp90018-mobile-project/backend/app/mixin"
	"github.com/yiff028/comp90018-mobile-project/backend/app/model/schema"
	"github.com/yiff028/comp90018-mobile-project/backend/app/service"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/errors"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/logger"
)

// RouteController
type RouteController struct {
	Dep mixin.StoreDepency
	WS  service.WebService
}

// CreateRoute
func (r *RouteController) CreateRoute(c *gin.Context) {
	ctx := c.Request.Context()

	var param schema.Route
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

	//check dog validity
	dogList, err := r.Dep.DogModel.List(ctx, userId)
	if err != nil {
		logger.Errorf(ctx, "list dog fail %+v", err)
		mixin.ResError(c, errors.ListDogFail)
		return
	}
	exist := false
	for _, dogItem := range dogList {
		if dogItem.ID == param.DogId {
			exist = true
		}
	}

	if !exist {
		mixin.ResError(c, errors.DogNotExist)
		return
	}

	param.UserId = userId
	err = r.Dep.RouteModel.Create(ctx, &param)
	if err != nil {
		logger.Errorf(ctx, "create route fail %+v", err)
		mixin.ResError(c, errors.CreateRouteFail)
		return
	}

	mixin.ResSuccess(c, gin.H{
		"code":    0,
		"message": "ok",
		"data":    param,
	})
}

// ListRoute
func (r *RouteController) ListRoute(c *gin.Context) {
	ctx := c.Request.Context()

	userId := c.GetUint("UserID")
	if userId == 0 {
		errInfoWithStack := errors.WithStack(errors.New("userid from cookie fail"))
		logger.Errorf(ctx, "fetch userid failed %+v", errInfoWithStack)
		mixin.ResError(c, errors.ErrQueryUserInfoFail)
		return
	}

	routeList, err := r.Dep.RouteModel.ListRoute(ctx, &userId)
	if err != nil {
		logger.Errorf(ctx, "list route fail %+v", err)
		mixin.ResError(c, errors.ListRouteFail)
		return
	}

	mixin.ResSuccess(c, gin.H{
		"code":    0,
		"message": "ok",
		"data":    routeList,
	})
}

// GetRouteDetail
func (r *RouteController) GetRouteDetail(c *gin.Context) {
	ctx := c.Request.Context()

	var param types.GetRouteDetailParam
	if err := c.ShouldBindQuery(&param); err != nil {
		logger.Errorf(ctx, "parse query params failed %+v", err)
		mixin.ResError(c, errors.ErrParseQueryFail)
		return
	}

	route, err := r.Dep.RouteModel.GetRouteById(ctx, param.RouteId)
	if err != nil {
		logger.Errorf(ctx, "get route by id fail %+v", err)
		mixin.ResError(c, errors.GetRouteByIdFail)
		return
	}

	routePoints, err := r.Dep.RoutePointModel.ListByRouteId(ctx, param.RouteId)
	if err != nil {
		logger.Errorf(ctx, "get route point by id fail %+v", err)
		mixin.ResError(c, errors.ListRoutePointFail)
		return
	}

	mixin.ResSuccess(c, gin.H{
		"code":    0,
		"message": "ok",
		"data": gin.H{
			"route":       route,
			"routePoints": routePoints,
		},
	})
}

// UpdateRouteLocation
func (r *RouteController) UpdateRouteLocation(c *gin.Context) {
	ctx := c.Request.Context()

	var param schema.RoutePoint
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

	//check if ownership is valid
	route, err := r.Dep.RouteModel.GetRouteById(ctx, param.RouteId)
	if err != nil {
		logger.Errorf(ctx, "get route by id fail %+v", err)
		mixin.ResError(c, errors.GetRouteByIdFail)
		return
	}

	if route == nil || route.UserId != userId {
		mixin.ResError(c, errors.GetRouteByIdFail)
		return
	}

	err = r.Dep.TranModel.ExecTrans(ctx, r.Dep.DBClient.Db, func(ctx context.Context) error {
		//add location
		err = r.Dep.RoutePointModel.Create(ctx, param)
		if err != nil {
			return err
		}

		// add location count
		err = r.Dep.RouteModel.AddPointCount(ctx, userId, param.RouteId)
		if err != nil {
			return err
		}

		// update dog location
		err = r.Dep.DogModel.UpdateLocation(ctx, route.DogId, route.UserId, param.Longitude, param.Latitude)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		logger.Errorf(ctx, "create route point fail %+v", err)
		mixin.ResError(c, errors.CreateRoutePointFail)
		return
	}

	mixin.ResSuccess(c, gin.H{
		"code":    0,
		"message": "ok",
	})
}
