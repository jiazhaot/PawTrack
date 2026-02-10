package middleware

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

func CacheControl(maxAgeSecond int) gin.HandlerFunc {
	return func(c *gin.Context) {

		c.Header("cache-control", "public, max-age="+strconv.Itoa(maxAgeSecond))

		c.Next()
	}
}
