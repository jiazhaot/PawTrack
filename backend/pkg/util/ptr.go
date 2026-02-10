package util

func IntPtr(v int) *int {
	return &v
}

func StringPtr(s string) *string {
	return &s
}

func UintPtr(v uint) *uint {
	return &v
}
