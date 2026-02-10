package model

import (
	"context"

	"github.com/yiff028/comp90018-mobile-project/backend/api/types"
	"github.com/yiff028/comp90018-mobile-project/backend/app/model/schema"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/errors"
	"gorm.io/gorm"
)

type User struct {
	DB *gorm.DB
}

func (user *User) Get(ctx context.Context, username string) (*schema.User, error) {
	var item schema.User = schema.User{}
	db := schema.GetUserDB(ctx, user.DB).Where("username=?", username)
	ok, err := schema.FindOne(ctx, db, &item)
	if err != nil {
		return nil, errors.WithStack(err)
	} else if !ok {
		return nil, nil
	}
	return &item, nil
}

func (user *User) GetById(ctx context.Context, userId int) (*schema.User, error) {
	var item schema.User = schema.User{}
	db := schema.GetUserDB(ctx, user.DB).Where("id = ?", userId)
	ok, err := schema.FindOne(ctx, db, &item)
	if err != nil {
		return nil, errors.WithStack(err)
	} else if !ok {
		return nil, nil
	}
	return &item, nil
}

func (user *User) GetByEmail(ctx context.Context, email string) (*schema.User, error) {
	var item schema.User = schema.User{}
	db := schema.GetUserDB(ctx, user.DB).Where("email=?", email)
	ok, err := schema.FindOne(ctx, db, &item)
	if err != nil {
		return nil, errors.WithStack(err)
	} else if !ok {
		return nil, nil
	}
	return &item, nil
}

func (user *User) Create(ctx context.Context, item schema.User) error {
	db := schema.GetUserDB(ctx, user.DB)
	result := db.Create(&item)
	if err := result.Error; err != nil {
		return errors.WithStack(err)
	}
	return nil
}

func (user *User) Update(ctx context.Context, param types.UserUpdateParam) (int64, error) {
	db := schema.GetUserDB(ctx, user.DB)
	if param.ID == nil {
		return 0, errors.New("user id cannot be nil")
	}
	db = db.Where("id = ?", param.ID)
	updateMap := map[string]interface{}{}
	if param.Nickname != nil {
		updateMap["nickname"] = param.Nickname
	}
	if param.Email != nil {
		updateMap["email"] = param.Email
	}
	if param.Password != nil {
		updateMap["password"] = param.Password
	}
	if param.Description != nil {
		updateMap["description"] = param.Description
	}
	if param.DateOfBirth != nil {
		updateMap["date_of_birth"] = param.DateOfBirth
	}
	if param.Gender != nil {
		updateMap["gender"] = param.Gender
	}
	if param.Languages != nil {
		updateMap["languages"] = param.Languages
	}
	if param.Status != nil {
		updateMap["status"] = param.Status
	}
	if param.Roles != nil {
		updateMap["roles"] = param.Roles
	}
	if param.IsActive != nil {
		updateMap["is_active"] = param.IsActive
	}
	if param.RoleID != nil {
		updateMap["role_id"] = param.RoleID
	}
	if param.LastOnline != nil {
		updateMap["last_online"] = param.LastOnline
	}

	result := db.Updates(updateMap)
	if err := result.Error; err != nil {
		return 0, errors.WithStack(err)
	}
	return result.RowsAffected, nil

}

// ListByUserIds
func (user *User) ListByUserIds(ctx context.Context, userIds []int) (*schema.Users, error) {
	db := schema.GetUserDB(ctx, user.DB)
	var users schema.Users
	db = db.Where("id IN (?)", userIds)
	result := db.Find(&users)

	if err := result.Error; err != nil {
		return nil, errors.WithStack(err)
	}
	return &users, nil
}

// ListByInviter
func (user *User) ListByInviter(ctx context.Context, inviterId uint) (*schema.Users, error) {
	if inviterId == 0 {
		return nil, errors.New("illegal inviter id")
	}

	db := schema.GetUserDB(ctx, user.DB).Debug()
	var users schema.Users
	db = db.Where("inviter = ?", inviterId)
	result := db.Find(&users)

	if err := result.Error; err != nil {
		return nil, errors.WithStack(err)
	}
	return &users, nil
}

// ExecRaw
func (u *User) ExecRaw(ctx context.Context, raw string) error {
	db := schema.GetUserDB(ctx, u.DB)
	result := db.Exec(raw)
	if err := result.Error; err != nil {
		return errors.WithStack(err)
	}
	return nil
}

// SearchUser
func (u *User) SearchUser(ctx context.Context, name string) (*schema.Users, error) {
	db := schema.GetUserDB(ctx, u.DB)
	var users schema.Users

	if name == "" {
		return &users, nil
	}

	db = db.Where("MATCH (nickname) AGAINST (+? IN BOOLEAN MODE)", name)
	db = db.Limit(50)

	db = db.Find(&users)
	if err := db.Error; err != nil {
		return nil, errors.WithStack(err)
	}

	return &users, nil
}
