package util

func InterleaveSlices[T any](a, b []T) []T {
	result := make([]T, 0, len(a)+len(b))
	minLen := min(len(a), len(b))

	//
	for i := 0; i < minLen; i++ {
		result = append(result, a[i], b[i])
	}

	//
	if len(a) > minLen {
		result = append(result, a[minLen:]...)
	}
	if len(b) > minLen {
		result = append(result, b[minLen:]...)
	}

	return result
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
