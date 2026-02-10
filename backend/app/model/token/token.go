package itoken

import (
	"context"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/yiff028/comp90018-mobile-project/backend/app/config"
	"github.com/yiff028/comp90018-mobile-project/backend/app/model/schema"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/logger"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/util"

	"github.com/gin-gonic/gin"
)

// JWTToken
type JWTToken interface {
	GenerateToken(ctx context.Context, payload schema.User) (*TokenCookie, error)
	VerifyToken(ctx context.Context, cookiesStr string) (*UserClaims, error)
}

type jwtToken struct {
	Context *gin.Context
}

// CookieToken
type CookieToken struct {
	Token    string `json:"token"`
	Username string `json:"username"`
}

// UserClaims
type UserClaims struct {
	Username string `json:"username"`
	RoleID   int    `json:"roleId"`
	ID       uint   `json:"id"`
	jwt.RegisteredClaims
}

type TokenCookie struct {
	Name     string
	Val      string
	Secure   bool
	HTTPOnly bool
	MaxAge   int
	Domain   string
	Path     string
}

// UserSecret secret
const UserSecret = "paw_track:@2025$"

// PAW_TRACK_AUTH_NAME acess token
const PAW_TRACK_AUTH_NAME = "paw_track_sig"

// PAW_TRACK_LOGIN_AUTH_KEY
const PAW_TRACK_LOGIN_AUTH_KEY = "paw_track_login_auth"

// NewJWTToken
func NewJWTToken(ctx *gin.Context) JWTToken {
	return &jwtToken{
		Context: ctx,
	}
}

// GenerateToken
func (*jwtToken) GenerateToken(ctx context.Context, payload schema.User) (*TokenCookie, error) {
	config := config.C.GetConfig()
	expireDate := time.Now().Add(time.Minute * time.Duration(config.UserInfo.CookieExpireTime))
	claims := UserClaims{
		payload.Username,
		payload.RoleID,
		payload.ID,
		jwt.RegisteredClaims{
			ExpiresAt: &jwt.NumericDate{Time: expireDate},
			Issuer:    "test",
		},
	}
	tokenObj := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	token, err := tokenObj.SignedString([]byte(UserSecret))
	if err != nil {
		logger.Errorf(ctx, err.Error())
		return nil, err
	}
	var cookieData = util.JSONMarshalToString(CookieToken{
		Token:    token,
		Username: payload.Username,
	})
	// maxAge := int((time.Hour * 8).Seconds())
	maxAge := 2592000
	cookie := &TokenCookie{
		Name:     PAW_TRACK_AUTH_NAME,
		Val:      cookieData,
		Secure:   config.HTTP.Secure,
		Path:     "",
		Domain:   config.Services.Domain,
		HTTPOnly: true,
		MaxAge:   maxAge,
	}
	return cookie, nil
}

// VerifyToken
func (*jwtToken) VerifyToken(ctx context.Context, cookiesStr string) (*UserClaims, error) {
	if cookiesStr == "" {
		logger.Errorf(ctx, "cookie is nil")
		return nil, nil
	}
	//
	var p *CookieToken = &CookieToken{}
	// storeData, ok := (util.JSONUnmarshalFromString(cookiesStr, p)).(CookieToken)
	util.JSONUnmarshalFromString(cookiesStr, p)
	storeData := *p

	token, err := jwt.ParseWithClaims(storeData.Token, &UserClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(UserSecret), nil
	})
	fmt.Println("token = ", *token)
	//
	if claims, ok := token.Claims.(*UserClaims); ok && token.Valid {
		return claims, nil
		//
	} else if ve, ok := err.(*jwt.ValidationError); ok {
		if ve.Errors&jwt.ValidationErrorMalformed != 0 {
			logger.Errorf(ctx, "it's not a token at all.")
			return nil, err
		} else if ve.Errors&(jwt.ValidationErrorExpired|jwt.ValidationErrorNotValidYet) != 0 {
			// token is expired
			// logger.Errorf(ctx, err.Error())
			return nil, nil
		}
	}
	return nil, err
}
