package models

// Collection names starting with the feature name
const (
	CollectionMentorProfiles = "mentorProfiles"
	CollectionMentorInvoices = "mentorInvoices"

	// Existing Zen collections (Read-Only references)
	CollectionHostAttendance = "hostAttendance"
	CollectionBatches        = "batches"
	CollectionCourses        = "courses"
	CollectionSessions       = "sessions"
)

// Required Route Permissions according to HACKATHON_RULES.md
const (
	PermissionView = "mentor-invoice.view"
	PermissionEdit = "mentor-invoice.edit"
)

// Invoice Status lifecycle
const (
	StatusDraft     = "draft"
	StatusSubmitted = "submitted"
	StatusApproved  = "approved"
	StatusPaid      = "paid"
)

// AuditInfo standard timestamp & user hash struct
type AuditInfo struct {
	At int64  `json:"at" bson:"at"`
	By string `json:"by" bson:"by"`
}
