package controller

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"net/mail"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/yiff028/comp90018-mobile-project/backend/app/config"
	"github.com/yiff028/comp90018-mobile-project/backend/app/mixin"
	"github.com/yiff028/comp90018-mobile-project/backend/app/model/schema"
	itoken "github.com/yiff028/comp90018-mobile-project/backend/app/model/token"
	"github.com/yiff028/comp90018-mobile-project/backend/app/service"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/errors"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/logger"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/util"
	"golang.org/x/crypto/pbkdf2"
)

// AuthController
type AuthController struct {
	Dep mixin.StoreDepency
	WS  service.WebService
}

// LoginData
type LoginData struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// Index
func (h *AuthController) Index(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "pong",
	})
}

// Login
func (h *AuthController) Login(c *gin.Context) {
	ctx := c.Request.Context()
	redisClient := h.Dep.RedisClient
	var param LoginData
	if err := c.ShouldBindJSON(&param); err != nil {
		logger.Errorf(ctx, "loginparam err %+v", err)
		mixin.ResError(c, errors.ErrParseQueryFail)
		return
	}

	user, err := h.Dep.UserModel.Get(ctx, param.Username)
	if err != nil {
		logger.Errorf(ctx, "err is %+v", err)
		mixin.ResError(c, errors.ErrDBQueryFail)
		return
	}
	if user == nil {
		err := fmt.Errorf("user not found")
		logger.Errorf(ctx, "get user by username fail ,err is %+v", err)
		mixin.ResError(c, errors.ErrUserNameNotExist)
		return
	}

	match, err := CheckPasswordWithHash(param.Password, user.Password)
	if err != nil {
		logger.Errorf(ctx, "check password with hash fail %+v", err)
		mixin.ResError(c, errors.ErrCheckPasswordHashFail)
		return
	}
	if !match {
		logger.Errorf(ctx, "password not match")
		mixin.ResError(c, errors.ErrPasswordNotMatchErr)
		return
	}

	// token
	tokenInstance := itoken.NewJWTToken(c)

	refreshToken := itoken.NewRefreshToken(c, redisClient, itoken.REFRESH_TOKEN_USER_KEY_NAME)
	gid := util.NewSessionID()
	// SetCookie
	user.GID = gid
	tokenCookie, err := tokenInstance.GenerateToken(ctx, *user)
	if err != nil {
		return
	}
	execCookieAuth := false
	if execCookieAuth {
		c.SetCookie(tokenCookie.Name, tokenCookie.Val, tokenCookie.MaxAge, tokenCookie.Path, tokenCookie.Domain, tokenCookie.Secure, tokenCookie.HTTPOnly)
		c.SetCookie(tokenCookie.Name, tokenCookie.Val, tokenCookie.MaxAge, tokenCookie.Path, "", tokenCookie.Secure, tokenCookie.HTTPOnly)
		refreshCookie, err := refreshToken.GenerateRefreshToken(user)
		if err != nil {
			logger.Errorf(ctx, "generate refresh token err is %+v", err)
		}
		c.SetCookie(refreshCookie.Name, refreshCookie.Val, refreshCookie.MaxAge, refreshCookie.Path, refreshCookie.Domain, refreshCookie.Secure, refreshCookie.HTTPOnly)
		authKey := itoken.PAW_TRACK_LOGIN_AUTH_KEY + ":" + strconv.Itoa(int(user.ID)) + ":" + gid
		hmRes, err := redisClient.HMSet(authKey, "ID", user.ID, "Username", user.Username, "RoleID", user.RoleID, "GID", gid)
		if err != nil {
			errInfoWithStack := errors.WithStack(err)
			logger.Errorf(ctx, "authKey hmset fail %+v\n", errInfoWithStack)
			mixin.ResError(c, errors.ErrLoginRedisOperationFail)
			return
		}
		expireRes, err := redisClient.Expire(authKey, time.Second*time.Duration(config.C.UserInfo.ExpireTime))
		if err != nil {
			errInfoWithStack := errors.WithStack(err)
			logger.Errorf(ctx, "auth key expire fail %+v\n", errInfoWithStack)
			mixin.ResError(c, errors.ErrLoginRedisOperationFail)
			return
		}
		if !hmRes || !expireRes {
			logger.Errorf(ctx, "缓存Redis缓存失败")
			mixin.ResError(c, errors.ErrLoginAuthCacheFail)
			return
		}
	}

	user.AccessToken = tokenCookie.Val
	mixin.ResSuccess(c, gin.H{
		"code":    0,
		"message": "ok",
		"data":    &user,
	})
}

// Logout
func (h *AuthController) Logout(c *gin.Context) {
	DelCookie := config.C.HTTP.DelCookie
	Secure := config.C.HTTP.Secure
	HTTPReadOnly := config.C.HTTP.HttpReadOnly
	c.SetCookie(itoken.PAW_TRACK_AUTH_NAME, "", DelCookie, "/", config.C.Services.Domain, Secure, HTTPReadOnly)
	c.SetCookie(itoken.PAW_TRACK_AUTH_NAME, "", DelCookie, "/", "", Secure, HTTPReadOnly)
	c.SetCookie(itoken.REFRESH_TOKEN_USER_AUTH_NAME, "", DelCookie, "/", "", Secure, HTTPReadOnly)
	mixin.ResSuccess(c, gin.H{
		"code":    0,
		"message": "ok",
	})
}

// TestLoginState
func (h *AuthController) TestLoginState(c *gin.Context) {

	mixin.ResSuccess(c, gin.H{
		"code":    0,
		"message": "ok",
	})
}

// CreateUser
func (h *AuthController) CreateUser(c *gin.Context) {
	ctx := c.Request.Context()
	var param schema.User
	if err := c.ShouldBindJSON(&param); err != nil {
		errInfoWithStack := errors.WithStack(err)
		logger.Errorf(ctx, "parse query params failed %+v", errInfoWithStack)
		mixin.ResError(c, errors.ErrParseQueryFail)
		return
	}

	item := schema.User{
		Username:    param.Username,
		Email:       param.Email,
		Nickname:    param.Nickname,
		RoleID:      0,
		Password:    param.Password,
		DateOfBirth: param.DateOfBirth,
		Gender:      param.Gender,
		Languages:   param.Languages,
		Status:      param.Status,
		Roles:       param.Roles,
	}

	//password,len >=6
	if len(param.Password) < 8 {
		mixin.ResError(c, errors.ErrPasswordTooShort)
		return
	}

	//nickname > 50
	if len(param.Nickname) > 50 {
		mixin.ResError(c, errors.ErrNickNameTooLong)
		return
	}

	if !isValidEmail(param.Email) {
		mixin.ResError(c, errors.ErrEmailInvalid)
		return
	}

	//empty/ wrong format for DoB
	//if param.DateOfBirth == "" {
	//mixin.ResError(c, errors.ErrDateOfBirthRequired)
	//return
	//}

	//check for duplicate username
	user, err := h.Dep.UserModel.Get(ctx, param.Username)
	if err != nil {
		errInfoWithStack := errors.WithStack(err)
		logger.Errorf(ctx, "query by username failed %+v", errInfoWithStack)
		mixin.ResError(c, errors.ErrQueryUserInfoFail)
		return
	}
	if user != nil {
		errInfoWithStack := errors.WithStack(err)
		logger.Errorf(ctx, "username already been used %+v", errInfoWithStack)
		mixin.ResError(c, errors.ErrCreateUserFailUserBeenUsed)
		return
	}

	//-----------------------------
	// new: check if email is used
	userByEmail, err := h.Dep.UserModel.GetByEmail(ctx, param.Email)
	if err != nil {
		errInfoWithStack := errors.WithStack(err)
		logger.Errorf(ctx, "query by email failed %+v", errInfoWithStack)
		mixin.ResError(c, errors.ErrQueryUserInfoFail)
		return
	}
	if userByEmail != nil {
		errInfoWithStack := errors.WithStack(err)
		logger.Errorf(ctx, "email already been used %+v", errInfoWithStack)
		mixin.ResError(c, errors.ErrCreateUserFailEmailBeenUsed)
		return
	}
	//----------------------------

	//@TODO icon logic
	// userType
	item.IsActive = true
	pwd, err := EncodePassword(param.Password)
	if err != nil {
		logger.Errorf(ctx, "encode password fail, err is %+v", err)
		mixin.ResError(c, errors.ErrUserPasswordGenFail)
		return
	}
	item.Password = pwd

	//transaction: create new
	cErr := h.Dep.TranModel.ExecTrans(ctx, h.Dep.DBClient.Db, func(ctx context.Context) error {

		err := h.Dep.UserModel.Create(ctx, item) //写入数据库
		if err != nil {
			return err
		}

		// //create avatar
		// avatar := u.Dep.MemoryMap.DefaultAvatarList.GetRandomAvatar()
		// base64, err := util.ImageToBase64(avatar, "jpeg")
		// if err != nil {
		// 	return err
		// }
		// err = u.WS.CreateImage(types.ImageCreateParamInternal{Base64Str: base64,
		// 	FileType: "jpeg",
		// 	FileName: fmt.Sprintf("image/user/avatar/%d.jpg", userItem.ID), Width: 100, Height: 100})
		// if err != nil {
		// 	return err
		// }
		return nil
	})
	if cErr != nil {
		logger.Errorf(ctx, "create user fail %+v", cErr)
		mixin.ResError(c, errors.ErrUserInsertDBFail)
		return
	}

	userItem, err := h.Dep.UserModel.Get(ctx, item.Username)
	if err != nil {
		logger.Errorf(ctx, "get user fail %+v", cErr)
		mixin.ResError(c, errors.ErrUserInsertDBFail)
		return
	}

	mixin.ResSuccess(c, gin.H{
		"code":    0,
		"message": "ok",
		"data":    &userItem,
	})
}

func (h *AuthController) UpdateUser(c *gin.Context) {
	ctx := c.Request.Context()
	var param schema.User
	if err := c.ShouldBindJSON(&param); err != nil {
		errInfoWithStack := errors.WithStack(err)
		logger.Errorf(ctx, "parse query params failed %+v", errInfoWithStack)
		mixin.ResError(c, errors.ErrParseQueryFail)
		return
	}

	item := schema.User{
		Username:    param.Username,
		Email:       param.Email,
		Nickname:    param.Nickname,
		RoleID:      0,
		Password:    param.Password,
		DateOfBirth: param.DateOfBirth,
		Gender:      param.Gender,
		Languages:   param.Languages,
		Status:      param.Status,
		Roles:       param.Roles,
	}

	//password,len >=6
	if len(param.Password) < 8 {
		mixin.ResError(c, errors.ErrPasswordTooShort)
		return
	}

	//nickname > 50
	if len(param.Nickname) > 50 {
		mixin.ResError(c, errors.ErrNickNameTooLong)
		return
	}

	if !isValidEmail(param.Email) {
		mixin.ResError(c, errors.ErrEmailInvalid)
		return
	}

	user, err := h.Dep.UserModel.Get(ctx, param.Username)
	if err != nil {
		errInfoWithStack := errors.WithStack(err)
		logger.Errorf(ctx, "query by username failed %+v", errInfoWithStack)
		mixin.ResError(c, errors.ErrQueryUserInfoFail)
		return
	}
	if user != nil {
		errInfoWithStack := errors.WithStack(err)
		logger.Errorf(ctx, "username already been used %+v", errInfoWithStack)
		mixin.ResError(c, errors.ErrCreateUserFailUserBeenUsed)
		return
	}

	userByEmail, err := h.Dep.UserModel.GetByEmail(ctx, param.Email)
	if err != nil {
		errInfoWithStack := errors.WithStack(err)
		logger.Errorf(ctx, "query by email failed %+v", errInfoWithStack)
		mixin.ResError(c, errors.ErrQueryUserInfoFail)
		return
	}
	if userByEmail != nil {
		errInfoWithStack := errors.WithStack(err)
		logger.Errorf(ctx, "email already been used %+v", errInfoWithStack)
		mixin.ResError(c, errors.ErrCreateUserFailEmailBeenUsed)
		return
	}

	item.IsActive = true
	pwd, err := EncodePassword(param.Password)
	if err != nil {
		logger.Errorf(ctx, "encode password fail, err is %+v", err)
		mixin.ResError(c, errors.ErrUserPasswordGenFail)
		return
	}
	item.Password = pwd

	cErr := h.Dep.TranModel.ExecTrans(ctx, h.Dep.DBClient.Db, func(ctx context.Context) error {

		err := h.Dep.UserModel.Create(ctx, item)
		if err != nil {
			return err
		}

		return nil
	})
	if cErr != nil {
		logger.Errorf(ctx, "create user fail %+v", cErr)
		mixin.ResError(c, errors.ErrUserInsertDBFail)
		return
	}

	userItem, err := h.Dep.UserModel.Get(ctx, item.Username)
	if err != nil {
		logger.Errorf(ctx, "get user fail %+v", cErr)
		mixin.ResError(c, errors.ErrUserInsertDBFail)
		return
	}

	mixin.ResSuccess(c, gin.H{
		"code":    0,
		"message": "ok",
		"data":    &userItem,
	})
}

// CheckPasswordWithHash
func CheckPasswordWithHash(password, encoded string) (bool, error) {
	parts := strings.SplitN(encoded, "$", 4)
	if len(parts) != 4 {
		return false, fmt.Errorf("hash must consist of 4 segments")
	}
	iter, err := strconv.Atoi(parts[1])
	if err != nil {
		return false, fmt.Errorf("wrong number of iterations: %v", err)
	}
	salt := []byte(parts[2])
	k, err := base64.StdEncoding.DecodeString(parts[3])
	if err != nil {
		return false, fmt.Errorf("wrong hash encoding: %v", err)
	}
	dk := pbkdf2.Key([]byte(password), salt, iter, sha256.Size, sha256.New)
	return bytes.Equal(k, dk), nil
}

// EncodePassword
func EncodePassword(password string) (string, error) {
	iter := 150000
	salt := util.GetRandomSalt(12)
	dk := pbkdf2.Key([]byte(password), salt, iter, sha256.Size, sha256.New)
	b64Hash := base64.StdEncoding.EncodeToString(dk)
	return fmt.Sprintf("%s$%d$%s$%s", "pbkdf2_sha256", iter, salt, b64Hash), nil
}

func isValidUsername(username string) bool {
	if len(username) < 3 || len(username) > 20 {
		return false
	}
	re := regexp.MustCompile(`^[a-zA-Z0-9_]+$`)
	return re.MatchString(username)
}

func isValidNickName(nickname string) bool {
	re := regexp.MustCompile(`^[\p{Han}a-zA-Z0-9]{2,20}$`)
	return re.MatchString(nickname)
}

func isValidEmail(email string) bool {
	_, err := mail.ParseAddress(email)
	return err == nil
}
