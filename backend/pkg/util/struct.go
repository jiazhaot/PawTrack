package util

import (
	"reflect"

	"github.com/fatih/structs"
)

// StructMaptoStruct
func StructMaptoStruct(s, ts interface{}) error {
	if !structs.IsStruct(s) || !structs.IsStruct(ts) {
		return nil
	}
	//
	ss, tss := structs.New(s), structs.New(ts)
	for _, field := range tss.Fields() {
		//
		if !field.IsExported() {
			continue
		}
		//
		if field.IsEmbedded() && field.Kind() == reflect.Struct {
			for _, efield := range field.Fields() {
				if f, ok := ss.FieldOk(efield.Name()); ok {
					efield.Set(f.Value())
				}
			}
		} else if f, ok := ss.FieldOk(field.Name()); ok {
			field.Set(f.Value())
		}
	}
	return nil
}
