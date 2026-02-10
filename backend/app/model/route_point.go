package model

import (
	"context"

	"github.com/yiff028/comp90018-mobile-project/backend/app/model/schema"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/errors"
	"gorm.io/gorm"
)

type RoutePoint struct {
	DB *gorm.DB
}

// Create
func (r *RoutePoint) Create(ctx context.Context, item schema.RoutePoint) error {
	db := schema.GetRoutePointDB(ctx, r.DB)
	result := db.Create(&item)
	if err := result.Error; err != nil {
		return errors.WithStack(err)
	}
	return nil
}

// ListByRouteId
func (r *RoutePoint) ListByRouteId(ctx context.Context, routeId uint) (*schema.RoutePointList, error) {
	db := schema.GetRoutePointDB(ctx, r.DB)

	var pointList schema.RoutePointList = schema.RoutePointList{}

	db = db.Where("route_id = ?", routeId)

	result := db.Find(&pointList)

	if err := result.Error; err != nil {
		return nil, errors.WithStack(err)
	}
	return &pointList, nil
}
