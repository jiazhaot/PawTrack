package keys

const (
	UserOperationKey = "user_operation:" //rule: key:userId

	//Ban & Auth
	UserBanInfoKey = "user_ban_info:"
)

func GetLoginUserKey(username string) string {
	return "login_user:" + username
}

func GetForgetPasswordCaptchaCDKey(email string) string {
	return "forget_password_captcha_cd:" + email
}
func SetForgetPasswordCDKey(email string) string {
	return "forget_password_set_cd:" + email
}

func GetUserAccountCreateKey(username string) string {
	return "account_create:" + username
}
