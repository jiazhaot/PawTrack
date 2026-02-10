package util

import (
	"math/rand"
	"time"
)

func GetTimePtr(t time.Time) *time.Time {
	return &t
}

func RandomTimeBetween(minTime, maxTime time.Time) time.Time {
	if maxTime.Before(minTime) {
		minTime, maxTime = maxTime, minTime
	}

	duration := maxTime.Sub(minTime)
	randSeconds := rand.Int63n(int64(duration))
	return minTime.Add(time.Duration(randSeconds))
}
