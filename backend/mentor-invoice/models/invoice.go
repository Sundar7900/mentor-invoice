package models

// InvoiceItem represents a single row in the Mentor Attendance Tracker and Payment Invoice Sheet
type InvoiceItem struct {
	SessionID            string  `json:"sessionId" bson:"sessionId"`
	SessionName          string  `json:"sessionName,omitempty" bson:"sessionName,omitempty"` // What session mentor has taken
	SessionType          string  `json:"sessionType,omitempty" bson:"sessionType,omitempty"` // "wpn" / "Pseudo Mainboot"
	Date                 string  `json:"date" bson:"date"`                                   // e.g. "8/16/2026"
	SessionTimestamp     int64   `json:"sessionTimestamp" bson:"sessionTimestamp"`
	CourseName           string  `json:"courseName" bson:"courseName"`
	BatchCode            string  `json:"batchCode" bson:"batchCode"`
	Interview            string  `json:"interview" bson:"interview"`   // Session Type or Interview tag (for sheet replica)
	Hours                float64 `json:"hours" bson:"hours"`           // Rounded e.g. 2.3
	HostStatus           string  `json:"hostStatus" bson:"hostStatus"` // "Done"
	Comments             string  `json:"comments" bson:"comments"`     // Combined batches e.g. "DSGA-S-WE-T-B22, DSGA-S-WE-T-B21"
	ScheduledDate        string  `json:"scheduledDate" bson:"scheduledDate"`
	ScheduledStartTime   string  `json:"scheduledStartTime" bson:"scheduledStartTime"`
	ScheduledEndTime     string  `json:"scheduledEndTime" bson:"scheduledEndTime"`
	ActualJoinedTime     string  `json:"actualJoinedTime" bson:"actualJoinedTime"`
	ActualLeftTime       string  `json:"actualLeftTime" bson:"actualLeftTime"`
	PeerDurationSeconds  int     `json:"peerDurationSeconds" bson:"peerDurationSeconds"`
	AttendancePercentage int     `json:"attendancePercentage" bson:"attendancePercentage"`
}

// Invoice represents a finalized mentor billing invoice document
type Invoice struct {
	ID                 string        `json:"id" bson:"id"`
	Program            string        `json:"program" bson:"program"`
	InvoiceNumber      string        `json:"invoiceNumber" bson:"invoiceNumber"`
	MentorHash         string        `json:"mentorHash" bson:"mentorHash"`
	MentorName         string        `json:"mentorName" bson:"mentorName"`
	Email              string        `json:"email" bson:"email"`
	CourseName         string        `json:"courseName" bson:"courseName"`
	BillingPeriodStart int64         `json:"billingPeriodStart" bson:"billingPeriodStart"`
	BillingPeriodEnd   int64         `json:"billingPeriodEnd" bson:"billingPeriodEnd"`
	BillingPeriodLabel string        `json:"billingPeriodLabel" bson:"billingPeriodLabel"` // "15th August 2026 - 14th September 2026"
	HourlyRate         float64       `json:"hourlyRate" bson:"hourlyRate"`
	TotalHours         float64       `json:"totalHours" bson:"totalHours"`
	TotalSessions      int           `json:"totalSessions" bson:"totalSessions"`
	TotalAmount        float64       `json:"totalAmount" bson:"totalAmount"`
	BankDetails        BankDetails   `json:"bankDetails" bson:"bankDetails"`
	Status             string        `json:"status" bson:"status"` // draft, submitted, approved, paid
	Items              []InvoiceItem `json:"items" bson:"items"`
	Created            AuditInfo     `json:"created" bson:"created"`
	Deleted            bool          `json:"deleted" bson:"deleted"`
}

// InvoiceSummary represents dashboard high level KPI metrics
type InvoiceSummary struct {
	TotalInvoicedAmount float64 `json:"totalInvoicedAmount"`
	TotalHoursBilled    float64 `json:"totalHoursBilled"`
	TotalSessionsCount  int     `json:"totalSessionsCount"`
	ActiveMentorsCount  int     `json:"activeMentorsCount"`
	PendingReviewCount  int     `json:"pendingReviewCount"`
	ApprovedCount       int     `json:"approvedCount"`
}

// MentorListItem represents mentor card in unified dashboard
type MentorListItem struct {
	MentorHash      string      `json:"mentorHash"`
	MentorName      string      `json:"mentorName"`
	Email           string      `json:"email"`
	CourseName      string      `json:"courseName"`
	HourlyRate      float64     `json:"hourlyRate"`
	HasBankDetails  bool        `json:"hasBankDetails"`
	BankDetails     BankDetails `json:"bankDetails"`
	SessionCount    int         `json:"sessionCount"`
	CalculatedHours float64     `json:"calculatedHours"`
	TotalAmount     float64     `json:"totalAmount"`
	LatestStatus    string      `json:"latestStatus"`
	InvoiceID       string      `json:"invoiceId,omitempty"`
	SessionsTaken   []string    `json:"sessionsTaken,omitempty"` // Names of sessions taken by mentor
}
