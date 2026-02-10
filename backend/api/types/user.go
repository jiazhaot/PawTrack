package types

import (
	"time"
)

type UserUpdateParam struct {
	ID          *uint      `json:"-"`
	Nickname    *string    `json:"nickname"`
	Email       *string    `json:"email"`
	Password    *string    `json:"-"`
	Description *string    `json:"description"`
	DateOfBirth *string    `json:"dateOfBirth"`
	Gender      *string    `json:"gender"`
	Languages   *string    `json:"languages"`
	Status      *string    `json:"status"`
	Roles       *string    `json:"roles"`
	IsActive    *bool      `json:"-"`
	RoleID      *int       `json:"-"`
	LastOnline  *time.Time `json:"-"`
}

type UserSearchParam struct {
	Name string `json:"name" binding:"required"`
}
