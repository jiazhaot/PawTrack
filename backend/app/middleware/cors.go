package middleware

import (
	"github.com/gin-gonic/gin"
	cors "github.com/rs/cors/wrapper/gin"
	"github.com/yiff028/comp90018-mobile-project/backend/app/config"
)

// CORSMiddleware
func CORSMiddleware() gin.HandlerFunc {
	cfg := config.C.CORS
	if cfg.Enable {

		return cors.New(cors.Options{
			AllowedOrigins:   cfg.AllowOrigins,
			AllowedMethods:   cfg.AllowMethods,
			AllowedHeaders:   cfg.AllowHeaders,
			AllowCredentials: cfg.AllowCredentials,
			MaxAge:           cfg.MaxAge,
			//AllowOriginFunc:  validateOrgin,
		})
	}
	return func(c *gin.Context) {
		c.Next()
	}
}

// func validateOrgin(origin string) bool {
// 	if origin == "http://dev.yunruitest.com" || origin == "https://www.yunruitest.com" || origin == "https://www.yunruift.com" || origin == "https://www.yunruisecurities.com" {
// 		return true
// 	}
// 	return false
// }
