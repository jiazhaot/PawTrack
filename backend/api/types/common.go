package types

import "mime/multipart"

// AuthCodeApplyParam
type AuthCodeApplyParam struct {
	Receiver string `json:"receiver" binding:"required"`
	Username string `json:"userName" binding:"required"`
	Token    string `json:"token" binding:"-"`
}

// ForgetPasswordApplyParam
type ForgetPasswordApplyParam struct {
	Email string `json:"email" binding:"required"`
	Token string `json:"token" binding:"required"`
}

type ForgetSetNewPasswordParam struct {
	Email    string `json:"email" binding:"required"`
	Captcha  string `json:"captcha" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// CaptchaRedisKey
// key+username
const (
	CaptchaCreateUser     = "captcha_create_user"
	CaptchaForgetPassword = "captcha_forget_password"
)

type CreateImageParam struct {
	Type string                `form:"type" binding:"required"`
	File *multipart.FileHeader `form:"file" binding:"required"`
}

type GetRouteDetailParam struct {
	RouteId uint `form:"routeId" binding:"required"`
}

// DogEditParam
type DogEditParam struct {
	DogId uint `json:"dogId" binding:"required"`
}

// BinDeleteParam
type BinDeleteParam struct {
	BinId uint `json:"id" binding:"required"`
}

type WeatherSearchParam struct {
	Lon float64 `form:"longitude" binding:"required"`
	Lat float64 `form:"latitude" binding:"required"`
}
