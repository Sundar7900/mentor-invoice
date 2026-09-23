package models

// BankDetails stores mentor bank account and tax registration
type BankDetails struct {
	AccountNumber string `json:"accountNumber" bson:"accountNumber"`
	IFSC          string `json:"ifsc" bson:"ifsc"`
	BankName      string `json:"bankName" bson:"bankName"`
	PANNumber     string `json:"panNumber" bson:"panNumber"`
}

// MentorProfile stores mentor billing configuration and bank credentials
type MentorProfile struct {
	ID          string      `json:"id" bson:"id"`
	Program     string      `json:"program" bson:"program"`
	MentorHash  string      `json:"mentorHash" bson:"mentorHash"`
	MentorName  string      `json:"mentorName" bson:"mentorName"`
	Email       string      `json:"email" bson:"email"`
	CourseName  string      `json:"courseName" bson:"courseName"`
	HourlyRate  float64     `json:"hourlyRate" bson:"hourlyRate"`
	Currency    string      `json:"currency" bson:"currency"`
	BankDetails BankDetails `json:"bankDetails" bson:"bankDetails"`
	Created     AuditInfo   `json:"created" bson:"created"`
	Deleted     bool        `json:"deleted" bson:"deleted"`
}
