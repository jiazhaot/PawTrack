package util

import "math"

func IsTooFarFromMedian(x, median float64) bool {
	if median == 0 {
		return x != 0
	}
	relativeDiff := math.Abs(x-median) / median
	return relativeDiff > 0.5
}
