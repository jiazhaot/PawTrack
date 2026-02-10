package middleware

import (
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/yiff028/comp90018-mobile-project/backend/app/mixin"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/driver"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/errors"
)

func RateLimit(redisClient driver.ClientType, count int) gin.HandlerFunc {
	return func(c *gin.Context) {
		path := c.Request.URL.Path
		userId := c.GetUint("UserID")

		key := fmt.Sprintf("mw:ratelimit:%d:%s", userId, path)

		if !checkLimit(redisClient, key, int64(count), 12*time.Hour) {
			mixin.ResError(c, errors.ErrReuqestExceedLimit)
			return
		}

		c.Next()
	}
}
