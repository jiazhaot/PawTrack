package middleware

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/yiff028/comp90018-mobile-project/backend/app/mixin"
	itoken "github.com/yiff028/comp90018-mobile-project/backend/app/model/token"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/driver"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/errors"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/logger"
)

// Auth
func Auth(redisClient driver.ClientType) gin.HandlerFunc {
	return func(c *gin.Context) {
		// before request
		var tokenInstance = itoken.NewJWTToken(c)
		var refreshTokenInstance = itoken.NewRefreshToken(c, redisClient, itoken.REFRESH_TOKEN_USER_KEY_NAME)
		var ctx = c.Request.Context()

		tokenStr := ""
		//hybrid solution: header check
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			cookieStr, err := c.Cookie(itoken.PAW_TRACK_AUTH_NAME)
			if err != nil {
				logger.Errorf(ctx, "err is %+v", err)
				mixin.ResError(c, errors.ErrAuthCookieParseFail)
				return
			}
			fmt.Println("cookie str = ", cookieStr)
			tokenStr = cookieStr
		} else {
			parts := strings.SplitN(authHeader, " ", 2)
			if !(len(parts) == 2 && strings.EqualFold(parts[0], "Bearer")) {
				mixin.ResError(c, errors.ErrAuthCookieParseFail)
				return
			}
			tokenString := parts[1]
			tokenStr = strings.ReplaceAll(tokenString, `\`, "")
			fmt.Println("token str =", tokenStr)
		}

		// verify
		decode, err := tokenInstance.VerifyToken(ctx, tokenStr)
		if err != nil && decode == nil {
			errInfoWithStack := errors.WithStack(err)
			logger.Errorf(ctx, "err is %+v", errInfoWithStack)
			mixin.ResError(c, errors.ErrTokenAuthFail)
			return
		}
		if decode == nil && err == nil {
			fmt.Println("token expire ! now refresh!")
			tokenStr, err := c.Cookie(itoken.REFRESH_TOKEN_USER_AUTH_NAME)
			if err != nil {
				errInfoWithStack := errors.WithStack(err)
				logger.Errorf(ctx, "err is %+v", errInfoWithStack)
				mixin.ResError(c, errors.ErrAuthCookieParseFail)
				return
			}
			userData, err := refreshTokenInstance.VerifyRefreshToken(tokenStr)
			if err != nil {
				logger.Errorf(ctx, "err is %+v", err)
				mixin.ResError(c, errors.ErrRefreshTokenAuthFail)
				return
			}
			userID := userData.User.ID
			gid := userData.User.GID
			tokenData, err := redisClient.HGetAll(itoken.PAW_TRACK_LOGIN_AUTH_KEY + ":" + strconv.Itoa(int(userID)) + ":" + gid)
			if err != nil {
				errInfoWithStack := errors.WithStack(err)
				logger.Errorf(ctx, "%+v", errInfoWithStack)
				mixin.ResError(c, errors.ErrLoginRedisOperationFail)
				return
			}
			IDCache := tokenData["ID"]
			if tokenData["ID"] == "" {
				logger.Errorf(ctx, "user auth expired id is %d, gid is %s\n", userID, gid)
				mixin.ResError(c, errors.ErrLoginAuthCacheFail)
				return
			}
			IDCacheInt, err := strconv.Atoi(IDCache)
			if err != nil {
				logger.Errorf(ctx, err.Error())
				mixin.ResError(c, errors.ErrLoginAuthCacheFail)
				return
			}
			if uint(IDCacheInt) == userID && len(tokenData) > 0 && IDCache != "" {
				tokenCookie, err := tokenInstance.GenerateToken(ctx, *userData.User)
				if err != nil {
					errInfoWithStack := errors.WithStack(err)
					logger.Errorf(ctx, "%+v", errInfoWithStack)
					mixin.ResError(c, errors.ErrGenerateTokenFail)
					return
				}
				c.SetCookie(tokenCookie.Name, tokenCookie.Val, tokenCookie.MaxAge, tokenCookie.Path, tokenCookie.Domain, tokenCookie.Secure, tokenCookie.HTTPOnly)

				c.SetCookie(tokenCookie.Name, tokenCookie.Val, tokenCookie.MaxAge, tokenCookie.Path, "", tokenCookie.Secure, tokenCookie.HTTPOnly)

				refreshCookie, err := refreshTokenInstance.GenerateRefreshToken(userData.User)
				if err != nil {
					errInfoWithStack := errors.WithStack(err)
					logger.Errorf(ctx, "%+v", errInfoWithStack)
					mixin.ResError(c, errors.ErrGenerateTokenFail)
					return
				}
				c.SetCookie(refreshCookie.Name, refreshCookie.Val, refreshCookie.MaxAge, refreshCookie.Path, refreshCookie.Domain, refreshCookie.Secure, refreshCookie.HTTPOnly)
				c.Set("UserID", userData.User.ID)
				c.Set("Username", userData.User.Username)
				c.Set("RoleID", userData.User.RoleID)
				fmt.Println("refresh success!")

				c.Next()
			} else {
				//
				logger.Errorf(ctx, "redis: %s exipred", itoken.PAW_TRACK_LOGIN_AUTH_KEY)
				mixin.ResError(c, errors.ErrLoginAuthExpired)
				return
			}
		} else {
			userID := decode.ID
			userName := decode.Username
			roleId := decode.RoleID
			c.Set("UserID", userID)
			c.Set("Username", userName)
			c.Set("RoleID", roleId)
			c.Next()
		}
	}
}
