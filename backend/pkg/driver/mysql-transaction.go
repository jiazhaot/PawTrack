package driver

import (
	"context"
)

// TransFunc
type TransFunc func(context.Context) error

type (
	transCtx        struct{}
	withoutTransCtx struct{}
	transLockCtx    struct{}
)

// NewTrans
func NewTrans(ctx context.Context, trans interface{}) context.Context {
	return context.WithValue(ctx, transCtx{}, trans)
}

// FromTrans
func FromTrans(ctx context.Context) (interface{}, bool) {
	val := ctx.Value(transCtx{})
	return val, val != nil
}

// NewWithoutTrans
func NewWithoutTrans(ctx context.Context) context.Context {
	return context.WithValue(ctx, withoutTransCtx{}, true)
}

// FromWithoutTrans
func FromWithoutTrans(ctx context.Context) bool {
	v := ctx.Value(withoutTransCtx{})
	return v != nil && v.(bool)
}

// NewTransLock
func NewTransLock(ctx context.Context) context.Context {
	return context.WithValue(ctx, transLockCtx{}, true)
}

// FromTransLock
func FromTransLock(ctx context.Context) bool {
	v := ctx.Value(transLockCtx{})
	return v != nil && v.(bool)
}
