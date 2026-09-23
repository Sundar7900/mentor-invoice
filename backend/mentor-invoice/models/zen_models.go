package models

// HostAttendanceInfo represents individual peer join/leave segments
type HostAttendanceInfo struct {
	JoinedAt     int64 `json:"joined_at" bson:"joined_at"`
	LeftAt       int64 `json:"left_at" bson:"left_at"`
	PeerDuration int   `json:"peer_duration" bson:"peer_duration"`
}

// HostAttendance represents meeting attendance records from existing Zen DB
type HostAttendance struct {
	ID                   string               `json:"id" bson:"id"`
	Host                 string               `json:"host" bson:"host"`
	HostEmail            string               `json:"hostEmail" bson:"hostEmail"`
	HostName             string               `json:"hostName" bson:"hostName"`
	BatchID              string               `json:"batchId" bson:"batchId"`
	SessionID            string               `json:"sessionId" bson:"sessionId"`
	MeetingID            string               `json:"meetingId" bson:"meetingId"`
	Role                 string               `json:"role" bson:"role"`
	Status               string               `json:"status" bson:"status"`
	IsPresent            bool                 `json:"isPresent" bson:"isPresent"`
	AttendancePercentage int                  `json:"attendancePercentage" bson:"attendancePercentage"`
	TotalMinutesAttended int                  `json:"totalMinutesAttended" bson:"totalMinutesAttended"`
	MeetingDuration      int                  `json:"meetingDuration" bson:"meetingDuration"`
	SessionDate          int64                `json:"sessionDate" bson:"sessionDate"`
	SessionStartTime     int64                `json:"sessionStartTime" bson:"sessionStartTime"`
	SessionEndTime       int64                `json:"sessionEndTime" bson:"sessionEndTime"`
	AttendanceInfo       []HostAttendanceInfo `json:"attendanceInfo" bson:"attendanceInfo"`
	Created              AuditInfo            `json:"created" bson:"created"`
	Deleted              bool                 `json:"deleted" bson:"deleted"`
}

// DaySchedule represents scheduled weekly timings for a batch
type DaySchedule struct {
	Day       string `json:"day" bson:"day"`
	StartTime int64  `json:"startTime" bson:"startTime"`
	EndTime   int64  `json:"endTime" bson:"endTime"`
}

// Batch represents existing Zen batch document
type Batch struct {
	ID             string        `json:"id" bson:"id"`
	Name           string        `json:"name" bson:"name"`
	Language       string        `json:"language" bson:"language"`
	Type           string        `json:"type" bson:"type"`
	Email          string        `json:"email" bson:"email"`
	CourseID       string        `json:"courseId" bson:"courseId"`
	CourseKey      string        `json:"courseKey" bson:"courseKey"`
	Program        string        `json:"program" bson:"program"`
	StartTime      int64         `json:"startTime" bson:"startTime"`
	EndTime        int64         `json:"endTime" bson:"endTime"`
	DaySchedules   []DaySchedule `json:"daySchedules,omitempty" bson:"daySchedules,omitempty"`
	BatchMembers   []string      `json:"batchMembers" bson:"batchMembers"`
	Mentors        []string      `json:"mentors" bson:"mentors"`
	BatchCompleted bool          `json:"batchCompleted" bson:"batchCompleted"`
	Created        AuditInfo     `json:"created" bson:"created"`
	Deleted        bool          `json:"deleted" bson:"deleted"`
}

// Course represents existing Zen course document
type Course struct {
	ID              string    `json:"id" bson:"id"`
	Name            string    `json:"name" bson:"name"`
	CourseKey       string    `json:"courseKey" bson:"courseKey"`
	BatchCode       string    `json:"batchCode" bson:"batchCode"`
	Program         string    `json:"program" bson:"program"`
	Version         int       `json:"version" bson:"version"`
	BatchID         string    `json:"batchId" bson:"batchId"`
	IsBatchAssigned bool      `json:"isBatchAssigned" bson:"isBatchAssigned"`
	IsActive        bool      `json:"isActive" bson:"isActive"`
	Created         AuditInfo `json:"created" bson:"created"`
	Deleted         bool      `json:"deleted" bson:"deleted"`
}

// Session represents existing Zen session document
type Session struct {
	ID                  string    `json:"id" bson:"id"`
	SessionName         string    `json:"sessionName" bson:"sessionName"`
	ClassContents       []string  `json:"classContents" bson:"classContents"`
	ModuleID            string    `json:"moduleId" bson:"moduleId"`
	CourseID            string    `json:"courseId" bson:"courseId"`
	CourseKey           string    `json:"courseKey" bson:"courseKey"`
	Program             string    `json:"program" bson:"program"`
	BatchID             string    `json:"batchId" bson:"batchId"`
	SessionOrder        int32     `json:"sessionOrder" bson:"sessionOrder"`
	IsAdditionalSession bool      `json:"isAdditionalSession" bson:"isAdditionalSession"`
	AttendanceUploaded  bool      `json:"attendanceUploaded" bson:"attendanceUploaded"`
	Mentor              string    `json:"mentor" bson:"mentor"`
	Mentors             []string  `json:"mentors" bson:"mentors"`
	MentorName          string    `json:"mentorName" bson:"mentorName"`
	StartTime           int64     `json:"startTime" bson:"startTime"`
	EndTime             int64     `json:"endTime" bson:"endTime"`
	SessionType         string    `json:"sessionType" bson:"sessionType"`
	Format              string    `json:"format" bson:"format"`
	IsCombineClass      bool      `json:"isCombineClass" bson:"isCombineClass"`
	CombineClassID      string    `json:"combineClassId" bson:"combineClassId"`
	Completed           bool      `json:"completed" bson:"completed"`
	Created             AuditInfo `json:"created" bson:"created"`
	Deleted             bool      `json:"deleted" bson:"deleted"`
}
