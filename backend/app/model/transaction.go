package model

import (
	"context"

	"github.com/yiff028/comp90018-mobile-project/backend/pkg/driver"
	"gorm.io/gorm"
)

// Transaction
type Transaction struct {
	DB *gorm.DB
}

// ExecTrans
func (trans *Transaction) ExecTrans(ctx context.Context, db *gorm.DB, fn driver.TransFunc) error {
	return trans.Exec(ctx, fn)
}

// ExecTransWithLock
func (trans *Transaction) ExecTransWithLock(ctx context.Context, db *gorm.DB, fn driver.TransFunc) error {
	if !driver.FromTransLock(ctx) {
		ctx = driver.NewTransLock(ctx)
	}
	return trans.ExecTrans(ctx, db, fn)
}

// Exec
func (trans *Transaction) Exec(ctx context.Context, fn func(context context.Context) error) error {
	if _, ok := driver.FromTrans(ctx); ok {
		return fn(ctx)
	}
	err := trans.DB.Transaction(func(db *gorm.DB) error {
		return fn(driver.NewTrans(ctx, db))
	})
	if err != nil {
		return err
	}
	return nil
}
