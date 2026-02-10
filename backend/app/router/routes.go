package router

import (
	"github.com/gin-gonic/gin"
	"github.com/yiff028/comp90018-mobile-project/backend/app/middleware"
	"github.com/yiff028/comp90018-mobile-project/backend/app/mixin"
)

// RegisterAPIRouter
func (r *Router) RegisterAPIRouter(app *gin.Engine, dep mixin.StoreDepency) {
	app.Use(middleware.CORSMiddleware())

	api := app.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/login", r.AuthController.Login)
			auth.POST("/logout", r.AuthController.Logout)
			auth.POST("/createUser", r.AuthController.CreateUser)
			auth.POST("/updateUser", r.AuthController.UpdateUser)
			auth.GET("/testLoginState", middleware.Auth(dep.RedisClient), r.AuthController.TestLoginState)
		}
		dog := api.Group("/dog", middleware.Auth(dep.RedisClient))
		{
			dog.POST("/createDog", r.DogController.CreateDog)
			dog.GET("/listDog", r.DogController.ListDog)
			dog.GET("/listCurrentDog", r.DogController.ListCurrentDog)
			dog.POST("/deleteDog", r.DogController.DeleteDog)
		}
		common := api.Group("/common", middleware.Auth(dep.RedisClient))
		{
			common.POST("/createImage", r.CommonController.CreateImage)
			common.GET("/getWeather", r.CommonController.GetWeather)
		}
		route := api.Group("/route", middleware.Auth(dep.RedisClient))
		{
			route.GET("/listAllRoutes", r.RouteController.ListRoute)
			route.GET("/getRouteDetail", r.RouteController.GetRouteDetail)
			route.POST("/createRoute", r.RouteController.CreateRoute)
			route.POST("/updateRouteLocation", r.RouteController.UpdateRouteLocation)
		}
		bin := api.Group("/bin", middleware.Auth(dep.RedisClient))
		{
			bin.POST("/createBin", r.BinController.CreateBin)
			bin.POST("/deleteBin", r.BinController.DeleteBin)
			bin.GET("/listMyBins", r.BinController.ListMyBin)
			bin.GET("/listAllBins", r.BinController.ListAllBin)
		}
	}

}
