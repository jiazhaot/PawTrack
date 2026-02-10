package errors

import (
	"net/http"

	"github.com/pkg/errors"
)

type SelfTimeoutErr struct {
	Desp string
	Err  error
}

func (e *SelfTimeoutErr) Error() string {
	return e.Desp + ": " + e.Err.Error()
}

func (e *SelfTimeoutErr) Timeout() bool {
	return true
}

var (
	New          = errors.New
	Wrap         = errors.Wrap
	WithStack    = errors.WithStack
	WithMessage  = errors.WithMessage
	WithMessagef = errors.WithMessagef
)

var (
	// CreateOrder
	ParamsErrType  = "params"
	CreateErrType  = "create"
	CancelErrType  = "cancel"
	LimitErrType   = "limit"
	ConnectErrType = "connect"
	// WAPOrder
	TimeErrType      = "time"
	InnerFailErrType = "inner"
	InvalidHandsErr  = "hands"
	TimePassErr      = "pass"
)

var (
	// Captcha & Validity
	ErrCaptchaAlreadyExist       = NewResponse(8000, "Failed to generate captcha - captcha already exists, please wait until it expires", http.StatusOK)
	ErrCaptchaCreateFail         = NewResponse(8001, "Failed to generate captcha", http.StatusOK)
	ErrCaptchaMailSendFail       = NewResponse(8002, "Failed to send captcha email, please try again later", http.StatusOK)
	ErrCaptchaCoolDownFail       = NewResponse(8003, "Captcha cooldown period has not ended, please try again later", http.StatusOK)
	ErrCheckCFTokenFail          = NewResponse(8004, "Captcha token verification failed, please try again", http.StatusOK)
	ErrMaxTryExceedFail          = NewResponse(8005, "Exceeded maximum daily attempt quota", http.StatusOK)
	ErrMobileCheckRoleVerifyFail = NewResponse(8006, "Role verification failed - must be an unverified mobile user - your number is already verified", http.StatusOK)
	ErrCheckCaptchaFail          = NewResponse(8007, "Captcha verification failed", http.StatusOK)

	// Template
	ErrTemplateParseFail = NewResponse(8200, "Failed to parse email template", http.StatusOK)

	// Redis
	ErrRedisOperationExistFail     = NewResponse(9000, "This type of operation is already running or is too frequent", http.StatusOK)
	ErrRedisOperationFail          = NewResponse(9001, "Redis operation failed", http.StatusOK)
	ErrRedisOperationExistWithTime = NewResponseWithExtra(9002, "This type of operation is already running or is too frequent", http.StatusOK)

	ErrBadRequest     = New400Response("Bad request")
	ErrNotAllowDelete = New400Response("Resource deletion not allowed")

	ErrNoPerm         = NewResponse(401, "Access denied", 401)
	ErrNotFound       = NewResponse(404, "Resource not found", 404)
	ErrMethodNotAllow = NewResponse(405, "Method not allowed", 405)
	ErrInternalServer = NewResponse(500, "Internal server error", 500)

	// Request Params
	ErrParseQueryFail = NewResponse(10005, "Failed to parse parameters", http.StatusOK)

	// Whitelist validation
	ErrGetWhiteListUserFail = NewResponse(10006, "Failed to retrieve whitelist user", http.StatusOK)

	// Multipart upload parsing
	ErrParseUploadFail = NewResponse(10007, "Failed to parse upload parameters", http.StatusOK)

	// Redirect
	ErrRedirectValidatePage = NewResponse(10008, "Redirecting to email verification page", http.StatusMovedPermanently)

	// Validation
	ErrValidateIPInterceptorFail = NewResponse(http.StatusUnauthorized, "IP whitelist validation failed", http.StatusUnauthorized)
	ErrMobileVerify              = NewResponse(10090, "Account not verified by mobile, please verify first", http.StatusOK)
	ErrVerifyEmailFormatFail     = NewResponse(10091, "Email format validation failed", http.StatusOK)
	ErrForgetPasswordApplyFail   = NewResponse(10092, "Failed to send password recovery request", http.StatusOK)

	// Login
	ErrUserNameNotExist        = NewResponse(7000, "Login failed - username does not exist or password is incorrect", http.StatusOK)
	ErrDBQueryFail             = NewResponse(http.StatusUnauthorized, "Database query error", http.StatusUnauthorized)
	ErrPasswordNotMatchErr     = NewResponse(7001, "Login failed - username does not exist or password is incorrect", http.StatusOK)
	ErrCheckPasswordHashFail   = NewResponse(7002, "Password verification failed", http.StatusOK)
	ErrGenerateTokenFail       = NewResponse(http.StatusUnauthorized, "Failed to generate token or refresh token", http.StatusUnauthorized)
	ErrLoginRedisOperationFail = NewResponse(http.StatusUnauthorized, "Redis operation error", http.StatusUnauthorized)
	ErrParseDjangoTokenFail    = NewResponse(http.StatusUnauthorized, "Failed to parse Django response field", http.StatusUnauthorized)
	ErrLoginAuthCacheFail      = NewResponse(http.StatusUnauthorized, "Login status Redis cache failed", http.StatusUnauthorized)
	ErrTokenAuthFail           = NewResponse(http.StatusUnauthorized, "Token verification failed or expired", http.StatusUnauthorized)
	ErrRefreshTokenAuthFail    = NewResponse(http.StatusUnauthorized, "Refresh token verification failed", http.StatusUnauthorized)
	ErrAuthCookieParseFail     = NewResponse(http.StatusUnauthorized, "Failed to parse cookie", http.StatusUnauthorized)
	ErrLoginAuthExpired        = NewResponse(http.StatusUnauthorized, "User session expired, please log in again", http.StatusUnauthorized)
	ErrLoginSecwebFail         = NewResponse(http.StatusUnauthorized, "Failed to log in to SecWeb", http.StatusUnauthorized)
	ErrEmailCode               = NewResponse(http.StatusUnauthorized, "Email captcha verification failed", http.StatusUnauthorized)
	ErrLoginSecTimeout         = NewResponse(http.StatusUnauthorized, "SecWeb login timed out", http.StatusUnauthorized)
	ErrIPValidateFail          = NewResponse(http.StatusUnauthorized, "IP verification failed", http.StatusUnauthorized)
	ErrNotAdmin                = NewResponse(http.StatusUnauthorized, "Operation failed - insufficient permissions - not an admin", http.StatusUnauthorized)
	ErrUserIdGetFail           = NewResponse(http.StatusUnauthorized, "Operation failed - failed to get user ID", http.StatusUnauthorized)
	ErrUserIsBanned            = NewResponseWithExtra(http.StatusUnauthorized, "User has been banned - reason: ", http.StatusUnauthorized)
	ErrRoleNotSupport          = NewResponse(http.StatusForbidden, "Operation failed - insufficient permissions", http.StatusForbidden)
	ErrUserIdNotEqualToToken   = NewResponse(7003, "Operation failed - user ID does not match token", http.StatusOK)
	ErrIpReuqestOverLimit      = NewResponse(http.StatusForbidden, "Operation failed - this IP has exceeded the request limit", http.StatusForbidden)
	ErrReuqestOverLimit        = NewResponse(http.StatusTooManyRequests, "API request quota exceeded, please try again later", http.StatusTooManyRequests)
	ErrAutoLoginFail           = NewResponse(7004, "An issue occurred during auto-login. Account registered successfully, please log in manually.", http.StatusOK)
	ErrReuqestExceedLimit      = NewResponse(http.StatusForbidden, "API request exceeded limit", http.StatusForbidden)

	// Util
	ErrGetUUIDFail            = NewResponse(20001, "Failed to get UUID", http.StatusOK)
	ErrJsonMarshalFail        = NewResponse(20002, "JSON marshal failed", http.StatusOK)
	ErrStrContainsIllegalChar = NewResponse(20003, "Upload content contains illegal characters, please check carefully", http.StatusOK)

	// User
	ErrUserRoleListFail                       = NewResponse(20708, "Failed to retrieve user role list", http.StatusOK)
	ErrUserDataFail                           = NewResponse(20709, "Failed to update user data", http.StatusOK)
	ErrUserPasswordGenFail                    = NewResponse(20710, "Failed to generate user password", http.StatusOK)
	ErrUserInsertDBFail                       = NewResponse(20711, "Failed to insert user into database", http.StatusOK)
	ErrUserQueryByAccountFail                 = NewResponse(20712, "Failed to query user by account", http.StatusOK)
	ErrCheckChangePasswordHashFail            = NewResponse(20715, "Password change failed - password verification error", http.StatusOK)
	ErrUserEncodePasswordFail                 = NewResponse(20713, "Failed to encrypt user password", http.StatusOK)
	ErrUserUpdatePasswordFail                 = NewResponse(20714, "Failed to update password", http.StatusOK)
	ErrChangePasswordNotMatchFail             = NewResponse(20716, "Password change failed - original password mismatch", http.StatusOK)
	ErrQueryUserListFail                      = NewResponse(20717, "Failed to query user list", http.StatusOK)
	ErrQueryUserInfoFail                      = NewResponse(20718, "Failed to query user information", http.StatusOK)
	ErrUserMailNotCorrect                     = NewResponse(20719, "Failed to query user email", http.StatusOK)
	ErrCreateUserFailUserBeenUsed             = NewResponse(20720, "Failed to create user - username already in use", http.StatusOK)
	ErrCreateUserFailEmailBeenUsed            = NewResponse(20721, "Failed to create user - email already in use", http.StatusOK)
	ErrUsernameCheckFail                      = NewResponse(20722, "Invalid username: must be alphanumeric and less than 30 characters", http.StatusOK)
	ErrCreateUserFailAuthFail                 = NewResponse(20723, "Authentication failed", http.StatusOK)
	ErrUpdateUserInfoFail                     = NewResponse(20724, "Failed to update user information", http.StatusOK)
	ErrUserPhoneNotLegal                      = NewResponse(20725, "Failed - invalid phone number format", http.StatusOK)
	ErrUserAddressTypeNotLegal                = NewResponse(20726, "Failed to update address - invalid address type", http.StatusOK)
	ErrUserAddressListFail                    = NewResponse(20727, "Failed to retrieve user address list", http.StatusOK)
	ErrUserAddressCreateFail                  = NewResponse(20728, "Failed to create user address", http.StatusOK)
	ErrUserAddressRemoveDefaultFail           = NewResponse(20729, "Failed to remove other default addresses", http.StatusOK)
	ErrUserGetTransactionBalanceListFail      = NewResponse(20730, "Failed to retrieve user transaction balance list", http.StatusOK)
	ErrUpdateUserInfoFailIllegalReceiverInput = NewResponse(20731, "Invalid receiver information: both address and phone number are required", http.StatusOK)
	ErrUpdateUserInfoFailC2CNeedInfo          = NewResponse(20732, "Failed to set transaction method - receiver information required for COD refunds", http.StatusOK)
	ErrPasswordTooShort                       = NewResponse(20733, "Password too short - minimum length is 8", http.StatusOK)
	ErrUserAddressDeleteFail                  = NewResponse(20734, "Failed to delete user address", http.StatusOK)
	ErrCreateIllegalNickname                  = NewResponse(20735, "Operation failed - invalid display name (only Chinese, English, and digits allowed)", http.StatusOK)
	ErrCreateNoLockEntityFail                 = NewResponse(20736, "Failed to create unlocked user entity", http.StatusOK)
	ErrSetUserCancelLimitFail                 = NewResponse(20737, "Failed to set user order cancellation limit", http.StatusOK)
	ErrUserNotExist                           = NewResponse(20738, "User does not exist", http.StatusOK)
	ErrUserAlreadyOnDeleteStatus              = NewResponse(20739, "User is already in account deletion status", http.StatusOK)
	ErrCheckPasswordFail                      = NewResponse(20740, "Password verification failed", http.StatusOK)
	ErrUserHasUnfinishedOrder                 = NewResponse(20741, "You have unfinished orders", http.StatusOK)
	ErrUserHasOrderIn15Days                   = NewResponse(20742, "You have transactions within the last 15 days", http.StatusOK)
	ErrUserSearchFail                         = NewResponse(20743, "Failed to search user", http.StatusOK)
	ErrSetMinOrderPriceFail                   = NewResponse(20744, "Failed to set minimum order price: maximum allowed is 200", http.StatusOK)

	// Image
	ErrImageFormatFail          = NewResponse(21000, "ErrImageFormatFail", http.StatusOK)
	ErrImageParseFail           = NewResponse(21001, "ErrImageParseFail", http.StatusOK)
	ErrImageCreateFileFail      = NewResponse(21002, "ErrImageCreateFileFail", http.StatusOK)
	ErrImageSaveFileFail        = NewResponse(21003, "ErrImageSaveFileFail", http.StatusOK)
	ErrUserImageCreateRedisFail = NewResponse(21004, "ErrUserImageCreateRedisFail", http.StatusOK)
	ErrUserImageCreateSyncFail  = NewResponse(21005, "ErrUserImageCreateSyncFail", http.StatusOK)
	ErrUserImageDecodeFail      = NewResponse(21006, "ErrUserImageDecodeFail", http.StatusOK)
	ErrUserImageOpenFail        = NewResponse(21007, "ErrUserImageOpenFail", http.StatusOK)
	ErrUserImageResizedFail     = NewResponse(21008, "ErrUserImageResizedFail", http.StatusOK)

	//Dog
	CreateDogFail      = NewResponse(22000, "CreateDogFail", http.StatusOK)
	ListDogFail        = NewResponse(22001, "ListDogFail", http.StatusOK)
	DeleteDogFail      = NewResponse(22002, "DeleteDogFail", http.StatusOK)
	ErrNickNameTooLong = NewResponse(20745, "Nickname too long - maximum length is 50", http.StatusOK)
	ErrEmailInvalid    = NewResponse(20746, "Invalid email format", http.StatusOK)

	//Route
	CreateRouteFail      = NewResponse(22100, "CreateRouteFail", http.StatusOK)
	DogNotExist          = NewResponse(22101, "DogNotExist", http.StatusOK)
	ListRouteFail        = NewResponse(22102, "ListRouteFail", http.StatusOK)
	GetRouteByIdFail     = NewResponse(22103, "GetRouteByIdFail", http.StatusOK)
	CreateRoutePointFail = NewResponse(22104, "CreateRoutePointFail", http.StatusOK)
	ListRoutePointFail   = NewResponse(22105, "ListRoutePointFail", http.StatusOK)

	//Bin
	CreateBinFail  = NewResponse(22200, "CreateBinFail", http.StatusOK)
	DeleteBinFail  = NewResponse(22201, "DeleteBinFail", http.StatusOK)
	ListAllBinFail = NewResponse(22202, "ListAllBinFail", http.StatusOK)

	//Weather
	GetWeatherUsingApiFail = NewResponse(23100, "GetWeatherUsingApiFail", http.StatusOK)
)
