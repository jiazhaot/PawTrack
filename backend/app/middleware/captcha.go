package middleware

import (
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/yiff028/comp90018-mobile-project/backend/app/mixin"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/driver"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/errors"
)

func GetCaptchaRateLimit(redisClient driver.ClientType, dep mixin.StoreDepency) gin.HandlerFunc {
	return func(c *gin.Context) {
		clientIP := c.ClientIP()

		ipKey := fmt.Sprintf("rl:captcha:ip:%s", clientIP)
		if !checkLimit(redisClient, ipKey, 5, time.Minute) {
			mixin.ResError(c, errors.ErrIpReuqestOverLimit)
			return
		}

		c.Next()
	}
}

func checkLimit(redisClient driver.ClientType, key string, max int64, expire time.Duration) bool {
	count, err := redisClient.Conn.Incr(key).Result()
	if err != nil {
		return true //
	}
	if count == 1 {
		redisClient.Expire(key, expire)
	}
	return count <= max
}
