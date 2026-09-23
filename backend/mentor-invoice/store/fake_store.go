package store

import (
	"context"
	"errors"
	"sync"
	"time"

	"mentor-invoice/core"
	"mentor-invoice/models"
)

// FakeStore is an in-memory implementation of Store for automated tests without a database
type FakeStore struct {
	mu         sync.RWMutex
	Profiles   map[string]models.MentorProfile // key: program + ":" + mentorHash
	Invoices   map[string]models.Invoice       // key: program + ":" + id
	Attendance []models.HostAttendance
	Batches    map[string]models.Batch
	Courses    map[string]models.Course
	Sessions   []models.Session
}

// NewFakeStore initializes an in-memory store pre-populated with test fixtures matching PDF
func NewFakeStore() *FakeStore {
	fs := &FakeStore{
		Profiles:   make(map[string]models.MentorProfile),
		Invoices:   make(map[string]models.Invoice),
		Batches:    make(map[string]models.Batch),
		Courses:    make(map[string]models.Course),
		Attendance: make([]models.HostAttendance, 0),
		Sessions:   make([]models.Session, 0),
	}

	// Default program
	prog := "zen"

	// Preload Shabarinath P profile matching Google Sheet
	shabarinathHash := "5f0a150188351bf13b2721fa2ca3de341a161b1f75b7f986a42f0cdd85e14e19cf4765c41b3e98242d9fe025ac95aa582c0abfc577ee3f0224719f753bd69728"
	fs.Profiles[prog+":"+shabarinathHash] = models.MentorProfile{
		ID:         "prof-shabari-1",
		Program:    prog,
		MentorHash: shabarinathHash,
		MentorName: "Mr. Shabarinath P",
		Email:      "shabarinath.p@guvi.in",
		CourseName: "Program / INTEL AIML Intel & IITM Pravartak Certified Artificial Intelligence & Data Science",
		HourlyRate: 3000.0,
		Currency:   "INR",
		BankDetails: models.BankDetails{
			AccountNumber: "18521810013970",
			IFSC:          "HDFC0001852",
			BankName:      "HDFC Bank",
			PANNumber:     "CQAPS9106P",
		},
		Created: models.AuditInfo{At: time.Now().Unix(), By: "system"},
		Deleted: false,
	}

	// Preload Swastik Nayak profile
	swastikHash := "swastik-mentor-hash-2"
	fs.Profiles[prog+":"+swastikHash] = models.MentorProfile{
		ID:         "prof-swastik-2",
		Program:    prog,
		MentorHash: swastikHash,
		MentorName: "Swastik Nayak",
		Email:      "swastik@guvi.in",
		CourseName: "Full Stack Development - MERN",
		HourlyRate: 2500.0,
		Currency:   "INR",
		BankDetails: models.BankDetails{
			AccountNumber: "98765432101234",
			IFSC:          "ICIC0001234",
			BankName:      "ICICI Bank",
			PANNumber:     "ABCPN1234F",
		},
		Created: models.AuditInfo{At: time.Now().Unix(), By: "system"},
		Deleted: false,
	}

	// Batches
	b1 := models.Batch{
		ID:       "6c78282c-91cd-4353-9e5b-2f74b06dd8d8",
		Name:     "DSGA-S-WE-T-B24",
		CourseID: "c89ec418-c685-43dc-88c0-e807edb03d41",
		Program:  prog,
		Deleted:  false,
	}
	b2 := models.Batch{
		ID:       "b-combined-22",
		Name:     "DSGA-S-WE-T-B22",
		CourseID: "c89ec418-c685-43dc-88c0-e807edb03d41",
		Program:  prog,
		Deleted:  false,
	}
	b3 := models.Batch{
		ID:       "b-combined-21",
		Name:     "DSGA-S-WE-T-B21",
		CourseID: "c89ec418-c685-43dc-88c0-e807edb03d41",
		Program:  prog,
		Deleted:  false,
	}
	b4 := models.Batch{
		ID:       "b-combined-23",
		Name:     "DSGA-S-WE-T-B23",
		CourseID: "c89ec418-c685-43dc-88c0-e807edb03d41",
		Program:  prog,
		Deleted:  false,
	}
	fs.Batches[b1.ID] = b1
	fs.Batches[b2.ID] = b2
	fs.Batches[b3.ID] = b3
	fs.Batches[b4.ID] = b4

	// Course
	fs.Courses["c89ec418-c685-43dc-88c0-e807edb03d41"] = models.Course{
		ID:        "c89ec418-c685-43dc-88c0-e807edb03d41",
		Name:      "Zen_Data_Science",
		CourseKey: "zen_data_science",
		Program:   prog,
		Deleted:   false,
	}

	// 21 sample attendance records for Shabarinath to match exactly 44.6 hours and ₹133,800 total
	baseTime := int64(1786876800) // Aug 16, 2026 16:00:00
	durations := []int{
		8280, 8280, 8280, 7920, 8280, 7920, 8280, // 2.3, 2.3, 2.3, 2.2, 2.3, 2.2, 2.3 (16.1 hrs)
		7920, 7920, 7920, 7920, 7920, 7920, 8280, // 2.2, 2.2, 2.2, 2.2, 2.2, 2.2, 2.3 (15.5 hrs)
		7560, 7560, 7560, 7560, 7560, 7560, 2160, // 2.1, 2.1, 2.1, 2.1, 2.1, 2.1, 0.6 -> Total: 44.6 hrs!
		// Total: 16.1 + 15.5 + 13.0 = 44.6 hrs across 21 sessions!
	}

	for i, dur := range durations {
		sessTime := baseTime + int64(i*86400)
		sessID := "sess-" + string(rune(i+'A'))
		attID := "att-" + string(rune(i+'A'))

		fs.Sessions = append(fs.Sessions, models.Session{
			ID:          sessID,
			SessionName: "Class Session",
			CourseID:    "c89ec418-c685-43dc-88c0-e807edb03d41",
			BatchID:     b1.ID,
			Program:     prog,
			Mentor:      shabarinathHash,
			MentorName:  "Mr. Shabarinath P",
			StartTime:   sessTime,
			EndTime:     sessTime + int64(dur),
			SessionType: "Live Class",
			Completed:   true,
			Deleted:     false,
		})

		fs.Attendance = append(fs.Attendance, models.HostAttendance{
			ID:               attID,
			Host:             shabarinathHash,
			HostName:         "Mr. Shabarinath P",
			HostEmail:        "shabarinath.p@guvi.in",
			BatchID:          b1.ID,
			SessionID:        sessID,
			SessionDate:      sessTime,
			SessionStartTime: sessTime,
			SessionEndTime:   sessTime + int64(dur),
			AttendanceInfo: []models.HostAttendanceInfo{
				{JoinedAt: sessTime + 12, LeftAt: sessTime + int64(dur) + 33, PeerDuration: dur},
			},
			IsPresent:            true,
			Status:               "attended",
			AttendancePercentage: 96,
			Deleted:              false,
		})

		// Add combined batch records for some sessions
		if i%3 == 0 {
			fs.Attendance = append(fs.Attendance, models.HostAttendance{
				ID:               attID + "-comb22",
				Host:             shabarinathHash,
				HostName:         "Mr. Shabarinath P",
				HostEmail:        "shabarinath.p@guvi.in",
				BatchID:          b2.ID,
				SessionID:        sessID,
				SessionDate:      sessTime,
				SessionStartTime: sessTime,
				SessionEndTime:   sessTime + int64(dur),
				AttendanceInfo: []models.HostAttendanceInfo{
					{JoinedAt: sessTime + 12, LeftAt: sessTime + int64(dur) + 33, PeerDuration: dur},
				},
				IsPresent: true,
				Status:    "attended",
				Deleted:   false,
			})
		}
	}

	return fs
}

func (fs *FakeStore) GetMentorProfile(ctx context.Context, program, mentorHash string) (*models.MentorProfile, error) {
	fs.mu.RLock()
	defer fs.mu.RUnlock()
	p, exists := fs.Profiles[program+":"+mentorHash]
	if !exists || p.Deleted || p.Program != program {
		return nil, errors.New("mentor profile not found")
	}
	return &p, nil
}

func (fs *FakeStore) UpsertMentorProfile(ctx context.Context, program string, profile *models.MentorProfile) error {
	fs.mu.Lock()
	defer fs.mu.Unlock()
	profile.Program = program
	profile.Deleted = false
	fs.Profiles[program+":"+profile.MentorHash] = *profile
	return nil
}

func (fs *FakeStore) ListMentorProfiles(ctx context.Context, program string) ([]models.MentorProfile, error) {
	fs.mu.RLock()
	defer fs.mu.RUnlock()
	var list []models.MentorProfile
	for _, p := range fs.Profiles {
		if p.Program == program && !p.Deleted {
			list = append(list, p)
		}
	}
	return list, nil
}

func (fs *FakeStore) SaveInvoice(ctx context.Context, program string, inv *models.Invoice) error {
	fs.mu.Lock()
	defer fs.mu.Unlock()
	inv.Program = program
	inv.Deleted = false
	fs.Invoices[program+":"+inv.ID] = *inv
	return nil
}

func (fs *FakeStore) GetInvoice(ctx context.Context, program, id string) (*models.Invoice, error) {
	fs.mu.RLock()
	defer fs.mu.RUnlock()
	inv, exists := fs.Invoices[program+":"+id]
	if !exists || inv.Deleted || inv.Program != program {
		return nil, errors.New("invoice not found")
	}
	return &inv, nil
}

func (fs *FakeStore) ListInvoices(ctx context.Context, program string) ([]models.Invoice, error) {
	fs.mu.RLock()
	defer fs.mu.RUnlock()
	var list []models.Invoice
	for _, inv := range fs.Invoices {
		if inv.Program == program && !inv.Deleted {
			list = append(list, inv)
		}
	}
	return list, nil
}

func (fs *FakeStore) UpdateInvoiceStatus(ctx context.Context, program, id, status string) error {
	fs.mu.Lock()
	defer fs.mu.Unlock()
	inv, exists := fs.Invoices[program+":"+id]
	if !exists || inv.Deleted || inv.Program != program {
		return errors.New("invoice not found")
	}
	inv.Status = status
	fs.Invoices[program+":"+id] = inv
	return nil
}

func (fs *FakeStore) GetHostAttendanceForMentor(ctx context.Context, program, mentorHash string, start, end int64) ([]models.HostAttendance, error) {
	fs.mu.RLock()
	defer fs.mu.RUnlock()
	var list []models.HostAttendance
	for _, a := range fs.Attendance {
		if a.Deleted {
			continue
		}
		if a.Host == mentorHash {
			if start > 0 && a.SessionDate < start {
				continue
			}
			if end > 0 && a.SessionDate > end {
				continue
			}
			list = append(list, a)
		}
	}
	return list, nil
}

func (fs *FakeStore) GetSessionsForMentor(ctx context.Context, program, mentorHash string, start, end int64) ([]models.Session, error) {
	fs.mu.RLock()
	defer fs.mu.RUnlock()
	var list []models.Session
	for _, s := range fs.Sessions {
		if s.Program == program && !s.Deleted {
			if s.Mentor == mentorHash {
				list = append(list, s)
			}
		}
	}
	return list, nil
}

func (fs *FakeStore) GetBatchesMap(ctx context.Context, program string) (map[string]models.Batch, error) {
	fs.mu.RLock()
	defer fs.mu.RUnlock()
	res := make(map[string]models.Batch)
	for k, v := range fs.Batches {
		if v.Program == program && !v.Deleted {
			res[k] = v
		}
	}
	return res, nil
}

func (fs *FakeStore) GetCoursesMap(ctx context.Context, program string) (map[string]models.Course, error) {
	fs.mu.RLock()
	defer fs.mu.RUnlock()
	res := make(map[string]models.Course)
	for k, v := range fs.Courses {
		if v.Program == program && !v.Deleted {
			res[k] = v
		}
	}
	return res, nil
}

func (fs *FakeStore) GetAllActiveMentors(ctx context.Context, program string, start, end int64) ([]models.MentorListItem, error) {
	fs.mu.RLock()
	defer fs.mu.RUnlock()

	// Find all unique hosts from attendance
	hosts := make(map[string]models.HostAttendance)
	for _, a := range fs.Attendance {
		if !a.Deleted {
			hosts[a.Host] = a
		}
	}

	var items []models.MentorListItem
	for hostHash, a := range hosts {
		prof, _ := fs.GetMentorProfile(ctx, program, hostHash)
		name := a.HostName
		email := a.HostEmail
		rate := 0.0
		course := ""
		hasBank := false
		bank := models.BankDetails{}

		if prof != nil {
			name = prof.MentorName
			email = prof.Email
			rate = prof.HourlyRate
			course = prof.CourseName
			hasBank = prof.BankDetails.AccountNumber != ""
			bank = prof.BankDetails
		}

		// Calculate quick stats
		records, _ := fs.GetHostAttendanceForMentor(ctx, program, hostHash, start, end)
		batches, _ := fs.GetBatchesMap(ctx, program)
		courses, _ := fs.GetCoursesMap(ctx, program)
		inv := core.AggregateMentorInvoice(core.AggregateInput{
			MentorHash:        hostHash,
			MentorName:        name,
			Email:             email,
			Profile:           prof,
			AttendanceRecords: records,
			Batches:           batches,
			Courses:           courses,
		})

		items = append(items, models.MentorListItem{
			MentorHash:      hostHash,
			MentorName:      name,
			Email:           email,
			CourseName:      course,
			HourlyRate:      rate,
			HasBankDetails:  hasBank,
			BankDetails:     bank,
			SessionCount:    inv.TotalSessions,
			CalculatedHours: inv.TotalHours,
			TotalAmount:     inv.TotalAmount,
			LatestStatus:    models.StatusDraft,
		})
	}

	return items, nil
}
