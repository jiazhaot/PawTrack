package mixin

import (
	"github.com/yiff028/comp90018-mobile-project/backend/app/model"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/driver"
)

// StoreDepency
type StoreDepency struct {
	RedisClient     driver.ClientType
	DBClient        driver.Database
	TranModel       model.Transaction
	UserModel       model.User
	DogModel        model.Dog
	RouteModel      model.Route
	RoutePointModel model.RoutePoint
	BinModel        model.Bin
}
