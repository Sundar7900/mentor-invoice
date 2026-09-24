package core

import (
	"testing"

	"mentor-invoice/models"
)

func TestRoundingAndHours(t *testing.T) {
	// 6932 seconds (from PDF screenshot page 2)
	// 6932 / 3600 = 1.92555 -> 1.9
	hours1 := SecondsToHours(6932)
	if hours1 != 1.9 {
		t.Errorf("Expected 1.9 hours, got %f", hours1)
	}

	// 2.25 hours rounded -> 2.3
	rounded := RoundToOneDecimal(2.25)
	if rounded != 2.3 {
		t.Errorf("Expected 2.3, got %f", rounded)
	}

	// Total calculation test: 44.6 hours * 3000 rate = 133800 (from PDF screenshot page 2)
	amount := CalculateTotalAmount(44.6, 3000)
	if amount != 133800 {
		t.Errorf("Expected 133800, got %f", amount)
	}
}

func TestCombinedClassAggregation(t *testing.T) {
	mentorHash := "mentor-123"
	profile := &models.MentorProfile{
		MentorHash: mentorHash,
		MentorName: "Mr. Shabarinath P",
		HourlyRate: 3000,
		BankDetails: models.BankDetails{
			AccountNumber: "18521810013970",
			IFSC:          "HDFC0001852",
			PANNumber:     "CQAPS9106P",
		},
	}

	// 2 records for the same time slot across 2 batches (combined class) with SessionType: "wpn"
	records := []models.HostAttendance{
		{
			ID:               "att-1",
			Host:             mentorHash,
			BatchID:          "batch-1",
			SessionID:        "sess-1",
			SessionName:      "Week 1 / Pseudo Mainboot Day 1: How Modern Applications Work",
			SessionType:      "wpn",
			SessionStartTime: 1782390600,
			SessionEndTime:   1782397800,
			AttendanceInfo: []models.HostAttendanceInfo{
				{JoinedAt: 1782390600, LeftAt: 1782397800, PeerDuration: 7200}, // 2.0 hrs
			},
			IsPresent: true,
			Status:    "attended",
		},
		{
			ID:               "att-2",
			Host:             mentorHash,
			BatchID:          "batch-2",
			SessionID:        "sess-1",
			SessionName:      "Week 1 / Pseudo Mainboot Day 1: How Modern Applications Work",
			SessionType:      "wpn",
			SessionStartTime: 1782390600,
			SessionEndTime:   1782397800,
			AttendanceInfo: []models.HostAttendanceInfo{
				{JoinedAt: 1782390600, LeftAt: 1782397800, PeerDuration: 7200},
			},
			IsPresent: true,
			Status:    "attended",
		},
		// 1 record with BLANK SessionType: "" that MUST be ignored
		{
			ID:               "att-blank",
			Host:             mentorHash,
			BatchID:          "batch-1",
			SessionID:        "sess-blank",
			SessionName:      "Uncategorized Session",
			SessionType:      "", // Blank session type
			SessionStartTime: 1782400000,
			SessionEndTime:   1782407200,
			AttendanceInfo: []models.HostAttendanceInfo{
				{JoinedAt: 1782400000, LeftAt: 1782407200, PeerDuration: 7200},
			},
			IsPresent: true,
			Status:    "attended",
		},
	}

	batches := map[string]models.Batch{
		"batch-1": {ID: "batch-1", Name: "DSGA-S-WE-T-B24"},
		"batch-2": {ID: "batch-2", Name: "DSGA-S-WE-T-B22"},
	}

	inv := AggregateMentorInvoice(AggregateInput{
		MentorHash:        mentorHash,
		MentorName:        "Mr. Shabarinath P",
		Profile:           profile,
		AttendanceRecords: records,
		Batches:           batches,
		Courses:           map[string]models.Course{},
	})

	// Should deduplicate to 1 session, not 2
	if inv.TotalSessions != 1 {
		t.Fatalf("Expected 1 deduplicated session, got %d", inv.TotalSessions)
	}

	if inv.TotalHours != 2.0 {
		t.Fatalf("Expected 2.0 total hours, got %f", inv.TotalHours)
	}

	if inv.TotalAmount != 6000.0 {
		t.Fatalf("Expected 6000.0 total amount, got %f", inv.TotalAmount)
	}

	// Secondary batch should be in Comments
	if len(inv.Items) > 0 && inv.Items[0].Comments != "DSGA-S-WE-T-B22" {
		t.Errorf("Expected comment 'DSGA-S-WE-T-B22', got '%s'", inv.Items[0].Comments)
	}
}
