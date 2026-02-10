package service

import (
	"fmt"
	"net/http"

	"github.com/yiff028/comp90018-mobile-project/backend/pkg/logger"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/util"
)

type Weather interface {
	GetByLocation(lon float64, lat float64) (interface{}, error)
}

// GetSecList
func (w *webService) GetByLocation(lon float64, lat float64) (interface{}, error) {
	reqURL := fmt.Sprintf("https://api.openweathermap.org/data/3.0/onecall?lat=%f&lon=%f&appid=1dd7e98e2d6f0fd562d07c2db494c47f", lat, lon)
	req, err := http.NewRequest("GET", reqURL, nil)
	if err != nil {
		logger.Errorf(w.Context, "create new request fail %+v", err)
		return nil, err
	}
	jsonBytes, err := BasicJSONCaller(w.Context, req)
	if err != nil {
		logger.Errorf(w.Context, "remote call fail %+v", err)
		return nil, err
	}
	var res interface{}
	marshalErr := util.JSONUnmarshal(jsonBytes, &res)
	if marshalErr != nil {
		logger.Errorf(w.Context, "parse respense fail %+v", err)
		return nil, marshalErr
	}
	return res, nil
}
