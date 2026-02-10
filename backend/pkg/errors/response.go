package errors

// ResponseError
type ResponseError struct {
	//
	Code int
	//
	Message string
	//
	StatusCode int
	//
	ERR error
}

func (r *ResponseError) Error() string {
	if r.ERR != nil {
		return r.ERR.Error()
	}
	return r.Message
}

// UnWrapResponse
func UnWrapResponse(err error) *ResponseError {
	if v, ok := err.(*ResponseError); ok {
		return v
	}
	return nil
}

// WrapResponse
func WrapResponse(err error, code int, msg string, status ...int) error {
	res := &ResponseError{
		Code:    code,
		Message: msg,
		ERR:     err,
	}
	if len(status) > 0 {
		res.StatusCode = status[0]
	}
	return res
}

// Wrap400Response
func Wrap400Response(err error, msg ...string) error {
	m := "request fail"
	if len(msg) > 0 {
		m = msg[0]
	}
	return WrapResponse(err, 400, m, 400)
}

// NewResponse
func NewResponse(code int, msg string, status ...int) error {
	res := &ResponseError{
		Code:    code,
		Message: msg,
	}
	if len(status) > 0 {
		res.StatusCode = status[0]
	}
	return res
}

// NewResponseWithExtra
func NewResponseWithExtra(code int, msg string, status ...int) func(error) error {
	return func(err error) error {
		res := &ResponseError{
			Code:    code,
			Message: msg + err.Error(),
		}
		if len(status) > 0 {
			res.StatusCode = status[0]
		}
		return res
	}
}

// New400Response
func New400Response(msg string) error {
	return NewResponse(400, msg, 400)
}
