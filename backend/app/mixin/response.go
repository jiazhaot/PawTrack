package mixin

import (
	"fmt"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"reflect"

	"github.com/gin-gonic/gin"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/errors"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/logger"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/util"
)

// StatusText
type StatusText string

const (
	OKStatus    StatusText = "OK"
	ErrorStatus StatusText = "ERROR"
	FailStatus  StatusText = "FAIL"
)

// StatusResult
type StatusResult struct {
	Status StatusText `json:"status"` // 状态(OK)
}

// PaginationResult
type PaginationResult struct {
	Total  int  `json:"total"`
	Offset uint `json:"offset"`
	Limit  uint `json:"limit"`
}

// ShowResult
type ShowResult struct {
	Code    int        `json:"code"`
	Message string     `json:"message"`
	Data    ListResult `json:"data"`
}

// ListResult
type ListResult struct {
	List       interface{}       `json:"list"`
	Pagination *PaginationResult `json:"pagination,omitempty"`
}

// ErrorResult
type ErrorResult struct {
	Error ErrorItem `json:"error"` //
}

// ErrorItem
type ErrorItem struct {
	Code    int    `json:"code"`    //
	Message string `json:"message"` //
}

const (
	prefix = "xhj-backend"

	UserIDKey = prefix + "/user-id"

	ResBodyKey = prefix + "/res-body"
)

// ParseJSON
func ParseJSON(c *gin.Context, obj interface{}) error {
	if err := c.ShouldBindJSON(obj); err != nil {
		return errors.Wrap400Response(err, fmt.Sprintf("Error occurs when parsing request body json - %s ", err.Error()))
	}
	value := reflect.ValueOf(obj).Elem()
	for i := 0; i < value.NumField(); i++ {
		val := value.Field(i)
		typeField := value.Type().Field(i)
		tag := string(typeField.Tag)

		if val.IsZero() && tag != "" && val.Type().String() == "string" {
			err := fmt.Errorf("Errors occurs when request query params not exists")
			return err
		}
	}
	return nil
}

// ParseQuery
func ParseQuery(c *gin.Context, obj interface{}) error {
	if err := c.ShouldBindQuery(obj); err != nil {
		return errors.Wrap400Response(err, fmt.Sprintf("Erros occurs when parsing request query - %s", err.Error()))
	}

	value := reflect.ValueOf(obj).Elem()
	for i := 0; i < value.NumField(); i++ {
		val := value.Field(i)
		if val.IsZero() {
			err := fmt.Errorf("Errors occurs when request query params not exists")
			return err
		}
	}
	return nil
}

// ResOK
func ResOK(c *gin.Context) {
	ResSuccess(c, StatusResult{Status: OKStatus})
}

func ResUnauthorized(c *gin.Context, v interface{}) {
	ResJSON(c, http.StatusUnauthorized, v)
}

// ResPage
func ResPage(c *gin.Context, v interface{}, pr *PaginationResult) {
	list := ListResult{
		List:       v,
		Pagination: pr,
	}
	showResult := ShowResult{
		Code:    0,
		Message: "ok",
		Data:    list,
	}
	ResSuccess(c, showResult)
}

// ResSuccess
func ResSuccess(c *gin.Context, v interface{}) {
	ResJSON(c, http.StatusOK, v)
}

// ResFile
func ResFile(c *gin.Context, filePath string) {
	//
	mimeType := mime.TypeByExtension(filepath.Ext(filePath))
	if mimeType == "" {
		mimeType = "application/octet-stream"
	}
	//
	c.Header("Content-Type", mimeType)
	//
	fileInfo, err := os.Stat(filePath)
	if os.IsNotExist(err) {
		c.String(http.StatusNotFound, "File not found")
		return
	} else if err != nil {
		c.String(http.StatusInternalServerError, "Failed to get file info: %s", err.Error())
		return
	}
	//
	file, err := os.Open(filePath)
	if err != nil {
		c.String(http.StatusInternalServerError, "Failed to open file: %s", err.Error())
		return
	}
	defer file.Close()
	//
	http.ServeContent(c.Writer, c.Request, filePath, fileInfo.ModTime(), file)
}

// ResError
func ResError(c *gin.Context, err error, status ...int) {
	ctx := c.Request.Context()
	var res *errors.ResponseError
	if err != nil {
		//
		if e, ok := err.(*errors.ResponseError); ok {
			res = e
		} else {
			res = errors.UnWrapResponse(errors.WrapResponse(err, 500, "服务器错误", 500))
		}
	} else {
		//
		res = errors.UnWrapResponse(errors.ErrInternalServer)
	}

	if len(status) > 0 {
		res.StatusCode = status[0]
	}

	if err := res.ERR; err != nil {
		if status := res.StatusCode; status >= 400 && status < 500 {
			logger.Warnf(ctx, err.Error())
		} else if status >= 500 {
			span := logger.StartSpan(ctx)
			span = span.WithField("stack", fmt.Sprintf("%+v", err))
		}
	}
	eitem := ErrorItem{
		Code:    res.Code,
		Message: res.Message,
	}
	c.Set("reserr", res.Code)
	c.Set("reserrmsg", res.Message)

	ResJSON(c, res.StatusCode, eitem)
}

// ResJSON
func ResJSON(c *gin.Context, status int, v interface{}) {
	buf, err := util.JSONMarshal(v)
	if err != nil {
		ctx := c.Request.Context()
		logger.Errorf(ctx, "response json err %+v\n", err)
		c.AbortWithError(status, err)
		return
	}
	c.Set(ResBodyKey, buf)
	c.Data(status, "application/json; charset=utf-8", buf)
	// //calculate
	// timer, exist := c.Get("timer")
	// if exist {
	// 	t := timer.(*time.Time)
	// 	duration := time.Since(*t)
	// 	fmt.Printf("接口耗时: %v\n", duration)
	// }
	c.Abort()
}

// ResRawSuccessJson
func ResRawSuccessJson(c *gin.Context, v []byte) {
	c.Set(ResBodyKey, v)
	c.Data(http.StatusOK, "application/json; charset=utf-8", v)

	c.Abort()
}

// ResString
func ResString(c *gin.Context, status int, str string) {

	c.String(status, str)
	c.Abort()
}
