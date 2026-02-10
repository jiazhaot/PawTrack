package middleware

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/yiff028/comp90018-mobile-project/backend/app/mixin"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/driver"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/errors"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/logger"
)

func RequestLimitMiddleware(redisClient driver.ClientType, expire time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetUint("UserID")

		var bodyHash string
		if c.Request.Method == http.MethodPost {
			bodyBytes, err := io.ReadAll(c.Request.Body)
			if err != nil {
				logger.Errorf(c, "read body fail %+v", err)
				c.Next()
				return
			}

			//
			c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

			hash := sha256.Sum256(bodyBytes)
			bodyHash = hex.EncodeToString(hash[:])
		}

		key := fmt.Sprintf("req_limit:%d:%s:%s", userID, c.FullPath(), bodyHash)

		//
		success, err := redisClient.SetNx(key, "", expire)
		if err != nil {
			//if err , just next , do not skip
			logger.Errorf(c, "redis set nx fail %+v", err)
			c.Next()
		} else {
			if !success {
				mixin.ResError(c, errors.ErrRedisOperationExistWithTime(errors.New("("+expire.String()+"一次)")))
				return
			}
			c.Next()
		}
	}
}
