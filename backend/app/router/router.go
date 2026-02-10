package router

import (
	"github.com/gin-gonic/gin"
	"github.com/yiff028/comp90018-mobile-project/backend/app/controller"
	"github.com/yiff028/comp90018-mobile-project/backend/app/mixin"
)

var _ IRouter = (*Router)(nil)

// IRouter
type IRouter interface {
	Register(app *gin.Engine, dep mixin.StoreDepency) error
	Prefixes() []string
}

// Router
type Router struct {
	AuthController   *controller.AuthController
	CommonController *controller.CommonController
	DogController    *controller.DogController
	RouteController  *controller.RouteController
	BinController    *controller.BinController
}

// Register
func (router *Router) Register(app *gin.Engine, dep mixin.StoreDepency) error {
	router.RegisterAPIRouter(app, dep)

	return nil
}

// Prefixes
func (router *Router) Prefixes() []string {
	return []string{
		"/api/",
	}
}
