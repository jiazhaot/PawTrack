package schema

import (
	"context"
	"time"

	"gorm.io/gorm"
)

// RouteList
type RouteList []Route

// Route
type Route struct {
	ID          uint           `gorm:"primary_key" json:"ID"`
	UserId      uint           `gorm:"column:user_id;not null" json:"userId"`
	DogId       uint           `gorm:"column:dog_id;not null" json:"dogId"`
	PointCount  uint           `gorm:"column:point_count;not null" json:"pointCount"`
	CreatedTime *time.Time     `gorm:"column:created_time;default:current_time" json:"createdTime"`
	UpdatedTime *time.Time     `gorm:"column:updated_time;default:current_time" json:"updatedTime"`
	DeletedAt   gorm.DeletedAt `gorm:"column:deleted_at;" json:"-"`
}

// TableName
func (Route) TableName() string {
	return "route"
}

// GetRouteDB
func GetRouteDB(ctx context.Context, defDB *gorm.DB) *gorm.DB {
	return GetDBWithModel(ctx, defDB, new(Route))
}
