package core

import (
	"sort"
	"strings"

	"mentor-invoice/models"
)

// AggregateInput holds raw query data required to compute an invoice
type AggregateInput struct {
	MentorHash        string
	MentorName        string
	Email             string
	BillingStart      int64
	BillingEnd        int64
	Profile           *models.MentorProfile
	AttendanceRecords []models.HostAttendance
	Sessions          []models.Session
	Batches           map[string]models.Batch
	Courses           map[string]models.Course
}

// AggregateMentorInvoice compiles raw DB records into a complete invoice structure
func AggregateMentorInvoice(input AggregateInput) *models.Invoice {
	hourlyRate := 0.0
	bankDetails := models.BankDetails{}
	courseName := ""

	if input.Profile != nil {
		hourlyRate = input.Profile.HourlyRate
		bankDetails = input.Profile.BankDetails
		courseName = input.Profile.CourseName
	}

	// Create map of sessions by ID
	sessionsByID := make(map[string]models.Session)
	for _, s := range input.Sessions {
		sessionsByID[s.ID] = s
	}

	// Group attendances to avoid duplicate billing on combined classes
	type groupedKey struct {
		StartTime int64
		EndTime   int64
	}

	type groupedSession struct {
		PrimaryAttendance models.HostAttendance
		CombinedBatches   []string
		CourseTitle       string
		SessionType       string
		SessionName       string
	}

	groupedMap := make(map[groupedKey]*groupedSession)
	var orderedKeys []groupedKey

	// Sort attendance records by session date ascending
	sort.Slice(input.AttendanceRecords, func(i, j int) bool {
		return input.AttendanceRecords[i].SessionStartTime < input.AttendanceRecords[j].SessionStartTime
	})

	for _, att := range input.AttendanceRecords {
		// Resolve sessionType and sessionName
		sessionType := strings.TrimSpace(att.SessionType)
		sessionName := strings.TrimSpace(att.SessionName)

		if s, exists := sessionsByID[att.SessionID]; exists {
			if sessionType == "" {
				sessionType = strings.TrimSpace(s.SessionType)
			}
			if sessionName == "" {
				sessionName = strings.TrimSpace(s.SessionName)
			}
		}

		// User Rule: "If the session type in blank don't take that because just need psudo main boot"
		if sessionType == "" {
			continue
		}

		// User Rule: "If session type is wpn in the sense that is psudo main boot"
		displaySessionType := sessionType
		if strings.EqualFold(sessionType, "wpn") {
			displaySessionType = "Pseudo Mainboot"
		}

		key := groupedKey{
			StartTime: att.SessionStartTime,
			EndTime:   att.SessionEndTime,
		}

		batchName := ""
		if b, exists := input.Batches[att.BatchID]; exists {
			batchName = b.Name
		} else {
			batchName = att.BatchID
		}

		cName := courseName
		if cName == "" {
			if s, exists := sessionsByID[att.SessionID]; exists {
				if c, cExists := input.Courses[s.CourseID]; cExists {
					cName = c.Name
				} else if s.CourseKey != "" {
					cName = s.CourseKey
				}
			}
		}

		if existing, exists := groupedMap[key]; exists {
			// This is an additional combined batch session for the same slot
			if batchName != "" && !contains(existing.CombinedBatches, batchName) {
				existing.CombinedBatches = append(existing.CombinedBatches, batchName)
			}
			if existing.SessionName == "" && sessionName != "" {
				existing.SessionName = sessionName
			}
		} else {
			g := &groupedSession{
				PrimaryAttendance: att,
				CombinedBatches:   []string{},
				CourseTitle:       cName,
				SessionType:       displaySessionType,
				SessionName:       sessionName,
			}
			groupedMap[key] = g
			orderedKeys = append(orderedKeys, key)
		}
	}

	var items []models.InvoiceItem
	totalHours := 0.0

	for _, key := range orderedKeys {
		g := groupedMap[key]
		att := g.PrimaryAttendance

		// Calculate billable peer duration
		durationSeconds := 0
		joinedAtSec := int64(0)
		leftAtSec := int64(0)

		if len(att.AttendanceInfo) > 0 {
			for _, info := range att.AttendanceInfo {
				durationSeconds += info.PeerDuration
				if joinedAtSec == 0 || (info.JoinedAt > 0 && info.JoinedAt < joinedAtSec) {
					joinedAtSec = info.JoinedAt
				}
				if info.LeftAt > leftAtSec {
					leftAtSec = info.LeftAt
				}
			}
		} else if att.TotalMinutesAttended > 0 {
			durationSeconds = att.TotalMinutesAttended * 60
		} else if att.MeetingDuration > 0 {
			durationSeconds = att.MeetingDuration * 60
		}

		rowHours := SecondsToHours(durationSeconds)
		totalHours += rowHours

		hostStatus := "Done"
		if !att.IsPresent && att.Status != "attended" {
			hostStatus = "Absent"
		}

		batchCode := ""
		if b, exists := input.Batches[att.BatchID]; exists {
			batchCode = b.Name
		} else {
			batchCode = att.BatchID
		}

		comments := strings.Join(g.CombinedBatches, ", ")

		scheduledDate := FormatUnixToDayMonthYear(att.SessionDate)
		if scheduledDate == "" {
			scheduledDate = FormatUnixToDayMonthYear(att.SessionStartTime)
		}

		scheduledStartTime := FormatUnixToTime(att.SessionStartTime)
		scheduledEndTime := FormatUnixToTime(att.SessionEndTime)
		actualJoinedTime := FormatUnixToTime(joinedAtSec)
		actualLeftTime := FormatUnixToTime(leftAtSec)

		item := models.InvoiceItem{
			SessionID:            att.SessionID,
			SessionName:          g.SessionName,
			SessionType:          g.SessionType,
			Date:                 FormatUnixToDate(att.SessionDate),
			SessionTimestamp:     att.SessionDate,
			CourseName:           g.CourseTitle,
			BatchCode:            batchCode,
			Interview:            g.SessionType,
			Hours:                rowHours,
			HostStatus:           hostStatus,
			Comments:             comments,
			ScheduledDate:        scheduledDate,
			ScheduledStartTime:   scheduledStartTime,
			ScheduledEndTime:     scheduledEndTime,
			ActualJoinedTime:     actualJoinedTime,
			ActualLeftTime:       actualLeftTime,
			PeerDurationSeconds:  durationSeconds,
			AttendancePercentage: att.AttendancePercentage,
		}
		items = append(items, item)
	}

	roundedTotalHours := RoundToOneDecimal(totalHours)
	totalAmount := CalculateTotalAmount(roundedTotalHours, hourlyRate)

	return &models.Invoice{
		MentorHash:         input.MentorHash,
		MentorName:         input.MentorName,
		Email:              input.Email,
		CourseName:         courseName,
		BillingPeriodStart: input.BillingStart,
		BillingPeriodEnd:   input.BillingEnd,
		HourlyRate:         hourlyRate,
		TotalHours:         roundedTotalHours,
		TotalSessions:      len(items),
		TotalAmount:        totalAmount,
		BankDetails:        bankDetails,
		Status:             models.StatusDraft,
		Items:              items,
	}
}

func contains(slice []string, val string) bool {
	for _, s := range slice {
		if s == val {
			return true
		}
	}
	return false
}
