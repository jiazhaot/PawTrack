package service

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"time"

	"github.com/yiff028/comp90018-mobile-project/backend/app/mixin"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/logger"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/util"
)

// WebService
type WebService interface {
	Weather
}

type webService struct {
	Context context.Context
	Host    string
}

// InitWInstance
func InitWInstance(ctx context.Context, nameHost string) WebService {
	return &webService{
		ctx,
		nameHost,
	}
}

// PostRequestHandler
func PostRequestHandler(ctx context.Context, url string, reqStr []byte) (*mixin.ShowResult, error) {
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(reqStr))
	if err != nil {
		logger.Errorf(ctx, "create new request fail %+v", err)
		return nil, err
	}
	jsonBytes, err := BasicJSONCaller(ctx, req)
	if err != nil {
		logger.Errorf(ctx, "remote call fail %+v", err)
		return nil, err
	}
	var res *mixin.ShowResult = &mixin.ShowResult{}
	marshalErr := util.JSONUnmarshal(jsonBytes, res)
	if marshalErr != nil {
		return nil, marshalErr
	}
	return res, nil
}

func PostRequestJsonHandler(ctx context.Context, url string, reqStr []byte) ([]byte, error) {
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(reqStr))
	if err != nil {
		logger.Errorf(ctx, "create new request fail %+v", err)
		return nil, err
	}
	jsonBytes, err := BasicJSONCaller(ctx, req)
	if err != nil {
		logger.Errorf(ctx, "remote call fail %+v", err)
		return nil, err
	}
	return jsonBytes, nil
}

// PutRequestHandler
func PutRequestHandler(ctx context.Context, url string, reqStr []byte) (*mixin.ShowResult, error) {
	req, err := http.NewRequest("PUT", url, bytes.NewBuffer(reqStr))
	if err != nil {
		logger.Errorf(ctx, "create new request fail %+v", err)
		return nil, err
	}
	jsonBytes, err := BasicJSONCaller(ctx, req)
	if err != nil {
		logger.Errorf(ctx, "remote call fail %+v", err)
		return nil, err
	}
	var res *mixin.ShowResult = &mixin.ShowResult{}
	marshalErr := util.JSONUnmarshal(jsonBytes, res)
	if marshalErr != nil {
		return nil, marshalErr
	}
	return res, nil
}

// BasicJSONCaller
func BasicJSONCaller(ctx context.Context, req *http.Request) ([]byte, error) {
	req.Header.Set("Content-Type", "application/json")
	//
	client := &http.Client{
		Timeout: 60 * time.Second,
	}
	response, err := client.Do(req)
	if err != nil {
		logger.Errorf(ctx, "make http request fail %+v", err)
		return nil, err
	}
	if response == nil {
		err := fmt.Errorf("http response is nil")
		logger.Errorf(ctx, "err is %+v", err)
		return nil, err
	}
	defer response.Body.Close()
	if response.StatusCode != 200 {
		err := fmt.Errorf("response is not 200 ok")
		logger.Errorf(ctx, "err is %+v", err)
		return nil, err
	}
	// 10MB
	var wb = make([]byte, 0, 10485760)
	buf := bytes.NewBuffer(wb)
	_, err = io.Copy(buf, response.Body)
	body := buf.Bytes()
	defer buf.Reset()
	if err != nil {
		logger.Errorf(ctx, "err is %+v", err)
		return nil, err
	}
	return body, nil
}

// BasicJSONCallerWithTimeout
func BasicJSONCallerWithTimeout(ctx context.Context, req *http.Request, timeout *time.Duration) ([]byte, error) {
	req.Header.Set("Content-Type", "application/json")
	//
	client := &http.Client{}
	if timeout != nil {
		client.Timeout = *timeout
	} else {
		client.Timeout = 5 * time.Second
	}
	response, err := client.Do(req)
	if err != nil {
		logger.Errorf(ctx, "make http request fail %+v", err)
		return nil, err
	}
	if response == nil {
		err := fmt.Errorf("http response is nil")
		logger.Errorf(ctx, "err is %+v", err)
		return nil, err
	}
	defer response.Body.Close()
	if response.StatusCode != 200 {
		err := fmt.Errorf("response is not 200 ok")
		logger.Errorf(ctx, "err is %+v", err)
		return nil, err
	}
	// 10MB --> 50MB
	var wb = make([]byte, 0, 50485760)
	buf := bytes.NewBuffer(wb)
	_, err = io.Copy(buf, response.Body)
	body := buf.Bytes()
	defer buf.Reset()
	if err != nil {
		logger.Errorf(ctx, "err is %+v", err)
		return nil, err
	}
	return body, nil
}

// BasicFormCaller
func BasicFormCaller(ctx context.Context, req *http.Request, contentType string) ([]byte, error) {
	req.Header.Set("Accept", "text/html")
	req.Header.Set("Content-Type", contentType)
	//
	client := &http.Client{
		Timeout: 15 * time.Second,
	}
	response, err := client.Do(req)
	if err != nil {
		logger.Errorf(ctx, "make http request fail %+v", err)
		return nil, err
	}
	if response == nil {
		err := fmt.Errorf("http response is nil")
		logger.Errorf(ctx, "err is %+v", err)
		return nil, err
	}
	defer response.Body.Close()
	body, err := ioutil.ReadAll(response.Body)
	if err != nil {
		logger.Errorf(ctx, "err is %+v", err)
		return nil, err
	}
	return body, nil
}

// BasicFormCallerWithTimeout
func BasicFormCallerWithTimeout(ctx context.Context, req *http.Request, contentType string, timeout *time.Duration) ([]byte, error) {
	req.Header.Set("Content-Type", contentType)
	//
	client := &http.Client{}
	if timeout != nil {
		client.Timeout = *timeout
	} else {
		client.Timeout = 15 * time.Second
	}
	response, err := client.Do(req)
	if err != nil {
		logger.Errorf(ctx, "make http request fail %+v", err)
		return nil, err
	}
	if response == nil {
		err := fmt.Errorf("http response is nil")
		logger.Errorf(ctx, "err is %+v", err)
		return nil, err
	}
	// bytes.Trim(, cutset string)
	defer response.Body.Close()
	body, err := ioutil.ReadAll(response.Body)
	if err != nil {
		logger.Errorf(ctx, "err is %+v", err)
		return nil, err
	}
	return body, nil
}

// PostFormRequestHandler
func PostFormRequestHandler(ctx context.Context, url string, reqStr []byte, contentType string) ([]byte, error) {
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(reqStr))
	if err != nil {
		logger.Errorf(ctx, "create new request fail %+v", err)
		return nil, err
	}
	jsonBytes, err := BasicFormCaller(ctx, req, contentType)
	if err != nil {
		logger.Errorf(ctx, "remote call fail %+v", err)
		return nil, err
	}
	return jsonBytes, nil
}
