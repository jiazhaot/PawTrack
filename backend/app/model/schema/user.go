package schema

import (
	"context"
	"time"

	"gorm.io/gorm"
)

// Users
type Users []User

// User
type User struct {
	ID          uint        `gorm:"primary_key" json:"ID"`
	Username    string      `gorm:"column:username;not null" json:"username"`
	Email       string      `gorm:"column:email;not null" json:"email"`
	Nickname    string      `gorm:"column:nickname;not null" json:"nickname"`
	Password    string      `gorm:"column:password;not null" json:"password"`
	DateOfBirth string      `gorm:"column:date_of_birth;type:date" json:"dateOfBirth"`
	Gender      string      `gorm:"column:gender;default:'prefer_not_to_say'" json:"gender"`
	Languages   StringSlice `gorm:"column:languages;type:json" json:"languages"`
	Status      string      `gorm:"column:status;default:'pending_verification'" json:"status"`
	Roles       StringSlice `gorm:"column:roles;type:json;default:'[\"user\"]'" json:"roles"`
	IsActive    bool        `gorm:"column:is_active;not null" json:"isActive"`
	RoleID      int         `gorm:"column:role_id;not null" json:"roleID"`
	CreatedTime *time.Time  `gorm:"column:created_time;default:current_time" json:"createdTime"`
	UpdatedTime *time.Time  `gorm:"column:updated_time;default:current_time" json:"updatedTime"`
	LastOnline  *time.Time  `gorm:"column:last_online;default:current_time" json:"lastOnline"`

	GID         string `gorm:"-"`
	AccessToken string `gorm:"-" json:"accessToken"`
}

// TableName
func (User) TableName() string {
	return "user"
}

// GetUserDB
func GetUserDB(ctx context.Context, defDB *gorm.DB) *gorm.DB {
	return GetDBWithModel(ctx, defDB, new(User))
}
