package util

import (
	"fmt"
	"net/url"
	"reflect"

	"github.com/ajg/form"
)

func FormUrlMarshal(data interface{}) (string, error) {
	str, err := form.EncodeToString(data)
	if err != nil {
		return "", err
	}
	return str, nil
}

func FormUrlUnMarshal(data string, result interface{}) error {

	values, err := url.ParseQuery(data)
	if err != nil {
		return err
	}

	val := reflect.ValueOf(result).Elem()
	typ := reflect.TypeOf(result).Elem()

	for i := 0; i < val.NumField(); i++ {
		field := typ.Field(i)
		tag := field.Tag.Get("form")
		if tag == "" {
			continue
		}

		//
		if v, ok := values[tag]; ok && len(v) > 0 {
			fieldVal := val.Field(i)
			if fieldVal.CanSet() {
				switch fieldVal.Kind() {
				case reflect.String:
					fieldVal.SetString(v[0])
				case reflect.Int:
					//
					fieldVal.SetInt(int64(atoi(v[0])))
					//
				}
			}
		}
	}
	return nil
}

func atoi(s string) int {
	var num int
	fmt.Sscanf(s, "%d", &num)
	return num
}
