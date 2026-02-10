package schema

import (
	"context"
	"time"

	"gorm.io/gorm"
)

// RoutePointList
type RoutePointList []RoutePoint

// RoutePoint
type RoutePoint struct {
	ID          uint       `gorm:"primary_key" json:"ID"`
	RouteId     uint       `gorm:"column:route_id;not null" json:"routeId"`
	Longitude   float64    `gorm:"column:longitude;not null" json:"longitude"`
	Latitude    float64    `gorm:"column:latitude;not null" json:"latitude"`
	CreatedTime *time.Time `gorm:"column:created_time;default:current_time" json:"createdTime"`
}

// TableName
func (RoutePoint) TableName() string {
	return "route_point"
}

// GetRoutePointDB
func GetRoutePointDB(ctx context.Context, defDB *gorm.DB) *gorm.DB {
	return GetDBWithModel(ctx, defDB, new(RoutePoint))
}
