package util

import (
	"fmt"
	"math/rand"
)

func IntAbs(a int) int {
	if a < 0 {
		return -a
	}
	return a
}

func IntMax(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func IntMin(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func CreateCaptcha() string {

	captcha := rand.Intn(1000000)

	return fmt.Sprintf("%06d", captcha)
}
