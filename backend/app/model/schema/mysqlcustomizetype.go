package schema

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
)

type MYSQLSET []string

func (set *MYSQLSET) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New(fmt.Sprint("Failed to unmarshal JSONB value:", value))
	}
	if len(bytes) == 0 {
		*set = []string{}
		return nil
	}
	*set = strings.Split(string(bytes), ",")
	return nil
}

func (j MYSQLSET) Value() (driver.Value, error) {
	resStr := ""

	resStr = strings.Join(j, ",")

	return resStr, nil
}

func CreateMYSQLSET(str string) MYSQLSET {
	strArr := strings.Split(str, ",")
	return strArr
}

// check if one of the str in the set equals to input
func (set *MYSQLSET) Contains(str string) bool {
	res := false
	for _, item := range *set {
		if str == item {
			res = true
		}
	}
	return res
}

// check if one of the str in the set equals to input
func (set *MysqlJSONArray) Contains(str string) bool {
	res := false
	for _, item := range *set {
		if str == item {
			res = true
		}
	}
	return res
}

type MysqlJSONArray []string

func (m *MysqlJSONArray) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New(fmt.Sprint("Failed to unmarshal JSONB value:", value))
	}
	err := json.Unmarshal(bytes, m)
	if err != nil {
		return err
	}
	return nil
}

func (m MysqlJSONArray) Value() (driver.Value, error) {
	resStr, err := json.Marshal(m)
	if err != nil {
		return nil, err
	}
	return resStr, nil
}

type MysqlPoint struct {
	Longitude float64
	Latitude  float64
}

func (p *MysqlPoint) Scan(val interface{}) error {
	b, ok := val.([]byte)
	if !ok {
		return fmt.Errorf("failed to scan Point, got %T", val)
	}

	var lng, lat float64
	_, err := fmt.Sscanf(string(b), "POINT(%f %f)", &lng, &lat)
	if err != nil {
		return err
	}
	p.Longitude, p.Latitude = lng, lat
	return nil
}

func (p MysqlPoint) Value() (driver.Value, error) {

	return fmt.Sprintf("POINT(%f %f)", p.Longitude, p.Latitude), nil
}
