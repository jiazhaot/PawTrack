package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/yiff028/comp90018-mobile-project/backend/app/mixin"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/errors"
)

//deprecate

var (
	maxConcurrency = 2
	sem            = make(chan struct{}, maxConcurrency)
)

func ConcurrencyLimit() gin.HandlerFunc {
	return func(c *gin.Context) {
		//
		select {
		case sem <- struct{}{}:
			defer func() {
				//
				<-sem
			}()
			//
			c.Next()
		default:
			//
			mixin.ResError(c, errors.ErrReuqestOverLimit)
			return
		}
	}
}
