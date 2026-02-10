package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/yiff028/comp90018-mobile-project/backend/app/mixin"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/errors"
)

// AdminCheck  check if role = 1 , if not reject
func AdminCheck() gin.HandlerFunc {
	return func(c *gin.Context) {
		roleId := c.GetInt("RoleID")
		if roleId == 1 {
			c.Next()
			return
		} else if roleId == 2 {
			if strings.HasPrefix(c.Request.URL.Path, "/api/admin/card/") {
				c.Next()
				return
			} else {
				mixin.ResError(c, errors.ErrRoleNotSupport)
				return
			}
		}
		mixin.ResError(c, errors.ErrNotAdmin)
	}
}
