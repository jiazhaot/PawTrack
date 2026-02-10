package util

import (
	jsoniter "github.com/json-iterator/go"
)

var (
	json              = jsoniter.ConfigCompatibleWithStandardLibrary
	JSONMarshal       = json.Marshal
	JSONUnmarshal     = json.Unmarshal
	JSONMarshalIndent = json.MarshalIndent
	JSONNewDecoder    = json.NewDecoder
	JSONNewEncoder    = json.NewEncoder
)

// JSONMarshalToString
func JSONMarshalToString(v interface{}) string {
	s, err := jsoniter.MarshalToString(v)
	if err != nil {
		return ""
	}
	return s
}

// JSONUnmarshalFromString
func JSONUnmarshalFromString(str string, p interface{}) interface{} {
	// var tokenData *CookieToken = &CookieToken{}
	err := jsoniter.UnmarshalFromString(str, p)
	if err != nil {
		return nil
	}
	return p
}
