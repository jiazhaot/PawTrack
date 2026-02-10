package model

import (
	"context"

	"github.com/yiff028/comp90018-mobile-project/backend/app/model/schema"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/errors"
	"gorm.io/gorm"
)

type Bin struct {
	DB *gorm.DB
}

// Create
func (r *Bin) Create(ctx context.Context, item *schema.Bin) error {
	db := schema.GetBinDB(ctx, r.DB)
	result := db.Create(item)
	if err := result.Error; err != nil {
		return errors.WithStack(err)
	}
	return nil
}

// Delete
func (r *Bin) Delete(ctx context.Context, id uint, userId uint) error {
	db := schema.GetBinDB(ctx, r.DB)
	result := db.Where("id = ?", id).Where("user_id = ?", userId).Delete(&schema.Bin{})
	if err := result.Error; err != nil {
		return errors.WithStack(err)
	}
	return nil
}

// ListMy
func (r *Bin) ListMy(ctx context.Context, userId uint) (schema.BinList, error) {
	db := schema.GetBinDB(ctx, r.DB).Debug()

	db = db.Where("user_id = ?", userId)
	binList := schema.BinList{}

	db = db.Find(&binList)
	if err := db.Error; err != nil {
		return nil, err
	}

	return binList, nil
}

// ListAll
func (r *Bin) ListAll(ctx context.Context) (schema.BinList, error) {
	db := schema.GetBinDB(ctx, r.DB).Debug()

	binList := schema.BinList{}

	db = db.Find(&binList)
	if err := db.Error; err != nil {
		return nil, err
	}

	return binList, nil
}
