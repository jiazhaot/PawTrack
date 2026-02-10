package middleware

import (
	"fmt"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/yiff028/comp90018-mobile-project/backend/app/mixin"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/errors"
)

// NoMethodHandler
func NoMethodHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		mixin.ResError(c, errors.ErrMethodNotAllow)
	}
}

// NoRouteHandler
func NoRouteHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		mixin.ResError(c, errors.ErrNotFound)
	}
}

// SkipperFunc
type SkipperFunc func(*gin.Context) bool

// AllowPathPrefixSkipper
func AllowPathPrefixSkipper(prefixes ...string) SkipperFunc {
	return allowPathPrefixHandler(prefixes, true)
}

// AllowPathPrefixNoSkipper
func AllowPathPrefixNoSkipper(prefixes ...string) SkipperFunc {
	return allowPathPrefixHandler(prefixes, false)
}

func allowPathPrefixHandler(prefixes []string, skip bool) SkipperFunc {
	return func(c *gin.Context) bool {
		path := c.Request.URL.Path
		pathLen := len(path)
		for _, p := range prefixes {
			if pl := len(p); pathLen >= pl && path[:pl] == p {
				return skip
			}
		}
		return !skip
	}
}

// SkipHandler
func SkipHandler(c *gin.Context, skippers ...SkipperFunc) bool {
	for _, skipper := range skippers {
		if skipper(c) {
			return true
		}
	}
	return false
}

// JoinRouter
func JoinRouter(method, path string) string {
	if len(path) > 0 && path[0] != '/' {
		path = "/" + path
	}
	return fmt.Sprintf("%s%s", strings.ToUpper(method), path)
}

// EmptyMiddleware
func EmptyMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()
	}
}
