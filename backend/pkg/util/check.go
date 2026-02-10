package util

import (
	"context"
	"errors"
	"regexp"
	"time"
)

// CheckPhoneNumber
func CheckPhoneNumber(number string) bool {
	//
	re := regexp.MustCompile(`^09\d{8}$`)
	return re.MatchString(number)
}

func Retry(ctx context.Context, maxRetries int, interval time.Duration, fn func() error) error {
	for i := 0; i < maxRetries; i++ {
		// Check if the context is canceled or expired
		if ctx.Err() != nil {
			return ctx.Err()
		}

		// Execute the function
		err := fn()
		if err == nil {
			return nil // Success
		}

		// Log the retry attempt (optional)
		if i < maxRetries-1 {
			time.Sleep(interval)
		}
	}

	return errors.New("max retries exceeded")
}
