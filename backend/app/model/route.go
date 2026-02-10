package model

import (
	"context"
	"fmt"

	"github.com/yiff028/comp90018-mobile-project/backend/app/model/schema"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/errors"
	"gorm.io/gorm"
)

type Route struct {
	DB *gorm.DB
}

// Create
func (r *Route) Create(ctx context.Context, item *schema.Route) error {
	db := schema.GetRouteDB(ctx, r.DB)
	result := db.Create(item)
	if err := result.Error; err != nil {
		return errors.WithStack(err)
	}
	return nil
}

// AddPointCount
func (r *Route) AddPointCount(ctx context.Context, userId uint, routeId uint) error {
	db := schema.GetRouteDB(ctx, r.DB)

	raw := fmt.Sprintf("UPDATE route SET point_count = point_count +1 where id = %d and user_id = %d", routeId, userId)

	result := db.Exec(raw)
	if err := result.Error; err != nil {
		return errors.WithStack(err)
	}
	return nil
}

// ListRoute
func (r *Route) ListRoute(ctx context.Context, userId *uint) (*schema.RouteList, error) {
	db := schema.GetRouteDB(ctx, r.DB)

	var routeList schema.RouteList = schema.RouteList{}

	if userId != nil {
		db = db.Where("user_id = ?", userId)
	}

	result := db.Find(&routeList)

	if err := result.Error; err != nil {
		return nil, errors.WithStack(err)
	}
	return &routeList, nil
}

// GetRouteById
func (r *Route) GetRouteById(ctx context.Context, routeId uint) (*schema.Route, error) {
	db := schema.GetRouteDB(ctx, r.DB).Where("id = ?", routeId)

	var item schema.Route = schema.Route{}

	ok, err := schema.FindOne(ctx, db, &item)
	if err != nil {
		return nil, errors.WithStack(err)
	} else if !ok {
		return nil, nil
	}
	return &item, nil
}
