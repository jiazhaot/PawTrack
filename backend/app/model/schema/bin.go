package schema

import (
	"context"
	"time"

	"gorm.io/gorm"
)

// BinList
type BinList []Bin

// BinPoint
type Bin struct {
	ID          uint           `gorm:"primary_key" json:"ID"`
	UserId      uint           `gorm:"column:user_id;not null" json:"userId"`
	Longitude   float64        `gorm:"column:longitude;not null" json:"longitude"`
	Latitude    float64        `gorm:"column:latitude;not null" json:"latitude"`
	CreatedTime *time.Time     `gorm:"column:created_time;default:current_time" json:"createdTime"`
	DeletedAt   gorm.DeletedAt `gorm:"column:deleted_at;" json:"-"`
}

// TableName
func (Bin) TableName() string {
	return "bin"
}

// GetBiniDB
func GetBinDB(ctx context.Context, defDB *gorm.DB) *gorm.DB {
	return GetDBWithModel(ctx, defDB, new(Bin))
}
