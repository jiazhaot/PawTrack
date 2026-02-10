package schema

import (
	"context"
	"fmt"
	"strings"

	"github.com/yiff028/comp90018-mobile-project/backend/pkg/driver"
	"gorm.io/gorm"

	sql_driver "database/sql/driver"
	"encoding/json"
	"errors"
)

type StringSlice []string

func (s *StringSlice) Scan(value interface{}) error {
	if value == nil {
		*s = nil
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed for StringSlice")
	}

	return json.Unmarshal(bytes, s)
}

func (s StringSlice) Value() (sql_driver.Value, error) {
	if len(s) == 0 {
		return nil, nil
	}

	return json.Marshal(s)
}

// PaginationResult
type PaginationResult struct {
	Total  int  `json:"total"`
	Offset uint `json:"offset"`
	Limit  uint `json:"limit"`
}

// ListResult
type ListResult struct {
	List       interface{}       `json:"list"`
	Pagination *PaginationResult `json:"pagination,omitempty"`
}

// PaginationParam
type PaginationParam struct {
	//
	Pagination bool `form:"-"`
	//
	OnlyCount bool `form:"-"`

	Offset uint `form:"offset"`

	Limit uint `form:"limit"`
}

const (
	DEFAULT_LIMIT = 10000
)

// GetOffset
func (page PaginationParam) GetOffset() uint {
	return page.Offset
}

// GetLimit
func (page PaginationParam) GetLimit() uint {
	limit := page.Limit

	if limit > DEFAULT_LIMIT {
		limit = DEFAULT_LIMIT
	}
	return limit
}

// OrderField
type OrderField struct {
	//
	Key string
	//
	Direction int
}

// OrderFieldFunc
type OrderFieldFunc func(string) string

const (
	// OrderByASC
	OrderByASC int = 1
	// OrderByDESC
	OrderByDESC int = 2
)

// GetDB
func getDB(ctx context.Context, defDB *gorm.DB) *gorm.DB {
	trans, ok := driver.FromTrans(ctx)
	if ok && !driver.FromWithoutTrans(ctx) {
		db, ok := trans.(*gorm.DB)
		//
		if ok && driver.FromTransLock(ctx) {
			// mysql
			db = db.Set("gorm:query_option", "FOR UPDATE")
			return db
		}
		return db
	}
	return defDB
}

// GetDBWithModel
func GetDBWithModel(ctx context.Context, defDB *gorm.DB, model interface{}) *gorm.DB {
	db := getDB(ctx, defDB)
	type tabler interface {
		TableName() string
	}
	//
	if t, ok := model.(tabler); ok {
		return db.Table(t.TableName())
	}
	return db.Model(model)
}

// NewOrderFields
func NewOrderFields(orderFields ...*OrderField) []*OrderField {
	return orderFields
}

// NewOrderField
func NewOrderField(key string, direction int) *OrderField {
	return &OrderField{
		Key:       key,
		Direction: direction,
	}
}

// ParseOrder
func ParseOrder(items []*OrderField, handle ...OrderFieldFunc) string {
	orders := make([]string, len(items))
	for i, item := range items {
		key := item.Key
		if len(handle) > 0 {
			key = handle[0](key)
		}

		direction := "ASC"
		if item.Direction == OrderByDESC {
			direction = "DESC"
		}
		orders[i] = fmt.Sprintf("%s %s", key, direction)
	}
	return strings.Join(orders, ",")
}

// WrapPageQuery
func WrapPageQuery(ctx context.Context, db *gorm.DB, param PaginationParam, out interface{}) (*PaginationResult, error) {
	if param.OnlyCount {
		var count int64
		err := db.Count(&count).Error
		if err != nil {
			return nil, err
		}
		return &PaginationResult{
			Total: int(count),
		}, nil
	} else if !param.Pagination {
		//
		err := db.Find(out).Error
		return nil, err
	}

	total, err := FindPage(ctx, db, param, out)
	if err != nil {
		return nil, err
	}
	return &PaginationResult{
		Total:  total,
		Offset: param.GetOffset(),
		Limit:  param.GetLimit(),
	}, nil
}

// FindPage
func FindPage(ctx context.Context, db *gorm.DB, param PaginationParam, out interface{}) (int, error) {
	var count int64
	err := db.Count(&count).Error
	if err != nil {
		return 0, err
	} else if count == 0 {
		return int(count), nil
	}

	offset, limit := param.GetOffset(), param.GetLimit()
	if offset > 0 && limit > 0 {
		//
		db = db.Offset(int((offset - 1) * limit)).Limit(int(limit))
	} else if limit > 0 {
		db = db.Limit(int(limit))
	}
	err = db.Find(out).Error
	return int(count), err
}

// FindOne
func FindOne(ctx context.Context, db *gorm.DB, out interface{}) (bool, error) {
	result := db.First(out)
	if err := result.Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

// FindLastOne
func FindLastOne(ctx context.Context, db *gorm.DB, out interface{}) (bool, error) {
	result := db.Last(out)
	if err := result.Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return false, nil
		}
		return false, err
	}
	return true, nil
}
