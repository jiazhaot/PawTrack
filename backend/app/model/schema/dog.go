package schema

import (
	"context"
	"time"

	"gorm.io/gorm"
)

// DogList
type DogList []Dog

// Dog
type Dog struct {
	ID              uint    `gorm:"primary_key" json:"ID"`
	UserId          uint    `gorm:"column:user_id;not null" json:"userId"`
	Name            string  `gorm:"column:name;not null" json:"name"`
	Breed           string  `gorm:"column:breed;not null" json:"breed"`
	CustomizedBreed string  `gorm:"column:customized_breed;not null" json:"customizedBreed"`
	Gender          string  `gorm:"column:gender;not null" json:"gender"`
	Weight          float64 `gorm:"column:weight;not null" json:"weight"`
	HealthCondition string  `gorm:"column:health_condition;not null" json:"healthCondition"`
	Img             string  `gorm:"column:img;not null" json:"img"`
	Age             string  `gorm:"column:age;not null" json:"age"`

	CreatedTime *time.Time     `gorm:"column:created_time;default:current_time" json:"createdTime"`
	UpdatedTime *time.Time     `gorm:"column:updated_time;default:current_time" json:"-"`
	DeletedAt   gorm.DeletedAt `gorm:"column:deleted_at;" json:"-"`

	Longitude           *float64       `gorm:"column:longitude;not null" json:"longitude"`
	Latitude            *float64       `gorm:"column:latitude;not null" json:"latitude"`
	LocationUpdatedTime *time.Time     `gorm:"column:location_updated_time;" json:"locationUpdatedTime"`
	Personality         MysqlJSONArray `gorm:"column:personality;" json:"personality"`
}

// TableName
func (Dog) TableName() string {
	return "dog"
}

// GetDogDB
func GetDogDB(ctx context.Context, defDB *gorm.DB) *gorm.DB {
	return GetDBWithModel(ctx, defDB, new(Dog))
}
