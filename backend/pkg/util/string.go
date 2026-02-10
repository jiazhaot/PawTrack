package util

import (
	"path"
	"path/filepath"
	"strconv"
	"strings"
	"unicode"
)

func StringContains(str string, list []string) bool {
	for _, v := range list {
		if v == str {
			return true
		}
	}
	return false
}

// StringToInt, if err return 0
func StringToInt(str string) int {
	num64, err := strconv.ParseInt(str, 10, 64)
	if err != nil {
		return 0
	}
	return int(num64)
}

func JoinUintSlice(slice []uint, sep string) string {
	strList := make([]string, len(slice))
	for i, v := range slice {
		strList[i] = strconv.FormatUint(uint64(v), 10)
	}
	return strings.Join(strList, sep)
}

// StringContainsIllegalChars
func StringContainsIllegalChars(s string) bool {
	//
	illegalRunes := []rune{
		// '\u0020', //  (Space)
		// '\u3000', //  (IDEOGRAPHIC SPACE)
		'\u200B', //  (ZWSP)
		'\u200C', //  (ZWNJ)
		'\u200D', //  (ZWJ)
		'\uFEFF', // BOM
		'\u00A0', //  (NBSP)
		'\u2028', //  (LS)
		'\u2029', //  (PS)
		'\u00AD', //  (Soft Hyphen)
	}

	//
	for _, r := range s {
		//
		for _, illegal := range illegalRunes {
			if r == illegal {
				return true
			}
		}

		// （C0 和 C1）
		// if unicode.IsControl(r) && r != '\n' && r != '\r' && r != '\t' {
		if unicode.IsControl(r) {
			return true
		}
	}

	return false
}

func ExtractPNGName(url string) string {

	filename := path.Base(url)

	filename = strings.Split(filename, "?")[0]

	return strings.TrimSuffix(filename, filepath.Ext(filename))
}

func KeepDigits(s string) string {
	var b strings.Builder
	for _, ch := range s {
		if ch >= '0' && ch <= '9' {
			b.WriteRune(ch)
		}
	}
	return b.String()
}
