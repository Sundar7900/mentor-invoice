package core

import (
	"math"
	"time"
)

// RoundToOneDecimal rounds a float to 1 decimal place matching Excel ROUND(..., 1)
func RoundToOneDecimal(val float64) float64 {
	return math.Round(val*10.0) / 10.0
}

// SecondsToHours converts seconds duration into decimal hours rounded to 1 decimal place
func SecondsToHours(seconds int) float64 {
	if seconds <= 0 {
		return 0.0
	}
	hours := float64(seconds) / 3600.0
	return RoundToOneDecimal(hours)
}

// MinutesToHours converts minutes duration into decimal hours rounded to 1 decimal place
func MinutesToHours(minutes int) float64 {
	if minutes <= 0 {
		return 0.0
	}
	hours := float64(minutes) / 60.0
	return RoundToOneDecimal(hours)
}

// CalculateTotalAmount multiplies total hours by hourly rate and rounds to nearest whole number
func CalculateTotalAmount(hours float64, hourlyRate float64) float64 {
	return math.Round(hours * hourlyRate)
}

// FormatUnixToDate formats timestamp into MM/DD/YYYY
func FormatUnixToDate(sec int64) string {
	if sec <= 0 {
		return ""
	}
	t := time.Unix(sec, 0).UTC()
	return t.Format("1/2/2006")
}

// FormatUnixToDayMonthYear formats timestamp into 16-Aug-2026
func FormatUnixToDayMonthYear(sec int64) string {
	if sec <= 0 {
		return ""
	}
	t := time.Unix(sec, 0).UTC()
	return t.Format("02-Jan-2006")
}

// FormatUnixToTime formats timestamp into HH:mm:ss
func FormatUnixToTime(sec int64) string {
	if sec <= 0 {
		return ""
	}
	t := time.Unix(sec, 0).UTC()
	return t.Format("15:04:05")
}
