package store

import (
	"context"

	"mentor-invoice/models"
)

// Store defines the data access contract for mentor invoice operations
type Store interface {
	// Mentor billing profile & bank details
	GetMentorProfile(ctx context.Context, program, mentorHash string) (*models.MentorProfile, error)
	UpsertMentorProfile(ctx context.Context, program string, profile *models.MentorProfile) error
	ListMentorProfiles(ctx context.Context, program string) ([]models.MentorProfile, error)

	// Invoice lifecycle
	SaveInvoice(ctx context.Context, program string, inv *models.Invoice) error
	GetInvoice(ctx context.Context, program, id string) (*models.Invoice, error)
	ListInvoices(ctx context.Context, program string) ([]models.Invoice, error)
	UpdateInvoiceStatus(ctx context.Context, program, id, status string) error

	// Zen collections read-only queries (enforcing program and deleted: false)
	GetHostAttendanceForMentor(ctx context.Context, program, mentorHash string, start, end int64) ([]models.HostAttendance, error)
	GetSessionsForMentor(ctx context.Context, program, mentorHash string, start, end int64) ([]models.Session, error)
	GetBatchesMap(ctx context.Context, program string) (map[string]models.Batch, error)
	GetCoursesMap(ctx context.Context, program string) (map[string]models.Course, error)
	GetAllActiveMentors(ctx context.Context, program string, start, end int64) ([]models.MentorListItem, error)
}
