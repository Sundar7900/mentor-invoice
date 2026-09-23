package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"mentor-invoice/core"
	"mentor-invoice/models"
	"mentor-invoice/store"
	"mentor-invoice/worker"
)

// Handlers holds controller actions and dependencies
type Handlers struct {
	store store.Store
	cache store.Cache
	pool  worker.Pool
}

// New creates a new Handlers instance with Store, Redis Cache, and Worker Pool
func New(st store.Store, cache store.Cache, pool worker.Pool) *Handlers {
	if cache == nil {
		cache = &store.NoOpCache{}
	}
	return &Handlers{
		store: st,
		cache: cache,
		pool:  pool,
	}
}

// SuccessResponse envelope format specified in HACKATHON_RULES.md
func (h *Handlers) SuccessResponse(c *gin.Context, httpCode int, data interface{}) {
	c.JSON(httpCode, gin.H{
		"status": "success",
		"data":   data,
	})
}

// ErrorResponse envelope format specified in HACKATHON_RULES.md
func (h *Handlers) ErrorResponse(c *gin.Context, httpCode int, message string) {
	c.JSON(httpCode, gin.H{
		"status":  "error",
		"message": message,
	})
}

// GetSummary returns dashboard high level KPI metrics with Redis caching
func (h *Handlers) GetSummary(c *gin.Context) {
	program := c.MustGet("program").(string)
	cacheKey := fmt.Sprintf("mentor_invoice:summary:%s", program)

	// 1. Try Redis cache first
	var cachedSummary models.InvoiceSummary
	if h.cache.Get(c.Request.Context(), cacheKey, &cachedSummary) {
		h.SuccessResponse(c, http.StatusOK, cachedSummary)
		return
	}

	// 2. Cache miss: aggregate from MongoDB
	mentors, err := h.store.GetAllActiveMentors(c.Request.Context(), program, 0, 0)
	if err != nil {
		h.ErrorResponse(c, http.StatusInternalServerError, "Failed to load summary: "+err.Error())
		return
	}

	invoices, _ := h.store.ListInvoices(c.Request.Context(), program)

	totalAmount := 0.0
	totalHours := 0.0
	totalSessions := 0
	pendingReview := 0
	approvedCount := 0

	for _, m := range mentors {
		totalAmount += m.TotalAmount
		totalHours += m.CalculatedHours
		totalSessions += m.SessionCount
	}

	for _, inv := range invoices {
		if inv.Status == models.StatusSubmitted || inv.Status == models.StatusDraft {
			pendingReview++
		} else if inv.Status == models.StatusApproved || inv.Status == models.StatusPaid {
			approvedCount++
		}
	}

	summary := models.InvoiceSummary{
		TotalInvoicedAmount: core.RoundToOneDecimal(totalAmount),
		TotalHoursBilled:    core.RoundToOneDecimal(totalHours),
		TotalSessionsCount:  totalSessions,
		ActiveMentorsCount:  len(mentors),
		PendingReviewCount:  pendingReview,
		ApprovedCount:       approvedCount,
	}

	// 3. Store in Redis cache with 3-minute TTL
	_ = h.cache.Set(c.Request.Context(), cacheKey, summary, 3*time.Minute)

	h.SuccessResponse(c, http.StatusOK, summary)
}

// GetMentors returns all active mentors for selection
func (h *Handlers) GetMentors(c *gin.Context) {
	program := c.MustGet("program").(string)

	startStr := c.Query("start")
	endStr := c.Query("end")
	start, _ := strconv.ParseInt(startStr, 10, 64)
	end, _ := strconv.ParseInt(endStr, 10, 64)

	mentors, err := h.store.GetAllActiveMentors(c.Request.Context(), program, start, end)
	if err != nil {
		h.ErrorResponse(c, http.StatusInternalServerError, "Failed to load mentors: "+err.Error())
		return
	}

	h.SuccessResponse(c, http.StatusOK, mentors)
}

// PreviewInvoice calculates live invoice lines for a given mentor and date range
func (h *Handlers) PreviewInvoice(c *gin.Context) {
	program := c.MustGet("program").(string)
	mentorHash := c.Query("mentorHash")
	if mentorHash == "" {
		h.ErrorResponse(c, http.StatusBadRequest, "mentorHash is required")
		return
	}

	startStr := c.Query("start")
	endStr := c.Query("end")
	start, _ := strconv.ParseInt(startStr, 10, 64)
	end, _ := strconv.ParseInt(endStr, 10, 64)

	// Fetch mentor profile
	profile, _ := h.store.GetMentorProfile(c.Request.Context(), program, mentorHash)

	// Fetch attendance records
	attendance, err := h.store.GetHostAttendanceForMentor(c.Request.Context(), program, mentorHash, start, end)
	if err != nil {
		h.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch attendance: "+err.Error())
		return
	}

	// Fetch sessions, batches and courses
	sessions, _ := h.store.GetSessionsForMentor(c.Request.Context(), program, mentorHash, start, end)
	batches, _ := h.store.GetBatchesMap(c.Request.Context(), program)
	courses, _ := h.store.GetCoursesMap(c.Request.Context(), program)

	mentorName := "Mentor"
	email := ""
	if profile != nil {
		mentorName = profile.MentorName
		email = profile.Email
	} else if len(attendance) > 0 {
		mentorName = attendance[0].HostName
		email = attendance[0].HostEmail
	}

	inv := core.AggregateMentorInvoice(core.AggregateInput{
		MentorHash:        mentorHash,
		MentorName:        mentorName,
		Email:             email,
		BillingStart:      start,
		BillingEnd:        end,
		Profile:           profile,
		AttendanceRecords: attendance,
		Sessions:          sessions,
		Batches:           batches,
		Courses:           courses,
	})

	inv.Program = program
	inv.BillingPeriodLabel = "Billing Period"
	if start > 0 && end > 0 {
		inv.BillingPeriodLabel = core.FormatUnixToDayMonthYear(start) + " - " + core.FormatUnixToDayMonthYear(end)
	}

	h.SuccessResponse(c, http.StatusOK, inv)
}

// GenerateInvoice saves a finalized invoice snapshot
func (h *Handlers) GenerateInvoice(c *gin.Context) {
	program := c.MustGet("program").(string)
	userHash := c.MustGet("auth").(string)

	var req struct {
		MentorHash   string `json:"mentorHash" binding:"required"`
		BillingStart int64  `json:"billingStart"`
		BillingEnd   int64  `json:"billingEnd"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		h.ErrorResponse(c, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}

	profile, _ := h.store.GetMentorProfile(c.Request.Context(), program, req.MentorHash)
	attendance, err := h.store.GetHostAttendanceForMentor(c.Request.Context(), program, req.MentorHash, req.BillingStart, req.BillingEnd)
	if err != nil {
		h.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch attendance: "+err.Error())
		return
	}

	sessions, _ := h.store.GetSessionsForMentor(c.Request.Context(), program, req.MentorHash, req.BillingStart, req.BillingEnd)
	batches, _ := h.store.GetBatchesMap(c.Request.Context(), program)
	courses, _ := h.store.GetCoursesMap(c.Request.Context(), program)

	mentorName := "Mentor"
	email := ""
	if profile != nil {
		mentorName = profile.MentorName
		email = profile.Email
	} else if len(attendance) > 0 {
		mentorName = attendance[0].HostName
		email = attendance[0].HostEmail
	}

	inv := core.AggregateMentorInvoice(core.AggregateInput{
		MentorHash:        req.MentorHash,
		MentorName:        mentorName,
		Email:             email,
		BillingStart:      req.BillingStart,
		BillingEnd:        req.BillingEnd,
		Profile:           profile,
		AttendanceRecords: attendance,
		Sessions:          sessions,
		Batches:           batches,
		Courses:           courses,
	})

	inv.ID = uuid.New().String()
	inv.Program = program
	inv.InvoiceNumber = "INV-" + time.Now().Format("20060102") + "-" + inv.ID[:6]
	inv.Status = models.StatusSubmitted
	inv.Created = models.AuditInfo{
		At: time.Now().Unix(),
		By: userHash,
	}

	if err := h.store.SaveInvoice(c.Request.Context(), program, inv); err != nil {
		h.ErrorResponse(c, http.StatusInternalServerError, "Failed to save invoice: "+err.Error())
		return
	}

	// Invalidate Redis summary cache
	_ = h.cache.Del(c.Request.Context(), fmt.Sprintf("mentor_invoice:summary:%s", program))

	h.SuccessResponse(c, http.StatusCreated, inv)
}

// BatchGenerateInvoices queues an async background job via Redis
func (h *Handlers) BatchGenerateInvoices(c *gin.Context) {
	program := c.MustGet("program").(string)
	userHash := c.MustGet("auth").(string)

	var req struct {
		BillingStart int64 `json:"billingStart"`
		BillingEnd   int64 `json:"billingEnd"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		h.ErrorResponse(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	payload, _ := json.Marshal(worker.BatchGeneratePayload{
		Program:      program,
		UserHash:     userHash,
		BillingStart: req.BillingStart,
		BillingEnd:   req.BillingEnd,
	})

	if h.pool != nil {
		if err := h.pool.Enqueue(c.Request.Context(), worker.JobBatchGenerate, payload); err != nil {
			h.ErrorResponse(c, http.StatusInternalServerError, "Failed to enqueue Redis worker job: "+err.Error())
			return
		}
	}

	h.SuccessResponse(c, http.StatusAccepted, gin.H{
		"message": "Batch invoice calculation queued in Redis background worker",
		"status":  "queued",
	})
}

// ListInvoices lists all generated invoices
func (h *Handlers) ListInvoices(c *gin.Context) {
	program := c.MustGet("program").(string)

	invoices, err := h.store.ListInvoices(c.Request.Context(), program)
	if err != nil {
		h.ErrorResponse(c, http.StatusInternalServerError, "Failed to list invoices: "+err.Error())
		return
	}

	h.SuccessResponse(c, http.StatusOK, invoices)
}

// GetInvoice returns a single invoice
func (h *Handlers) GetInvoice(c *gin.Context) {
	program := c.MustGet("program").(string)
	id := c.Param("id")

	inv, err := h.store.GetInvoice(c.Request.Context(), program, id)
	if err != nil {
		h.ErrorResponse(c, http.StatusNotFound, "Invoice not found")
		return
	}

	h.SuccessResponse(c, http.StatusOK, inv)
}

// UpdateInvoiceStatus changes invoice status
func (h *Handlers) UpdateInvoiceStatus(c *gin.Context) {
	program := c.MustGet("program").(string)
	id := c.Param("id")

	var req struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		h.ErrorResponse(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := h.store.UpdateInvoiceStatus(c.Request.Context(), program, id, req.Status); err != nil {
		h.ErrorResponse(c, http.StatusInternalServerError, "Failed to update status: "+err.Error())
		return
	}

	// Invalidate Redis summary cache
	_ = h.cache.Del(c.Request.Context(), fmt.Sprintf("mentor_invoice:summary:%s", program))

	h.SuccessResponse(c, http.StatusOK, gin.H{"id": id, "status": req.Status})
}

// GetProfiles lists mentor billing profiles with Redis caching
func (h *Handlers) GetProfiles(c *gin.Context) {
	program := c.MustGet("program").(string)
	cacheKey := fmt.Sprintf("mentor_invoice:profiles:%s", program)

	// 1. Try Redis cache
	var cachedProfiles []models.MentorProfile
	if h.cache.Get(c.Request.Context(), cacheKey, &cachedProfiles) {
		h.SuccessResponse(c, http.StatusOK, cachedProfiles)
		return
	}

	// 2. Fetch from MongoDB
	profiles, err := h.store.ListMentorProfiles(c.Request.Context(), program)
	if err != nil {
		h.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch profiles: "+err.Error())
		return
	}

	// 3. Set Redis cache (5 minutes TTL)
	_ = h.cache.Set(c.Request.Context(), cacheKey, profiles, 5*time.Minute)

	h.SuccessResponse(c, http.StatusOK, profiles)
}

// SaveProfile creates or updates mentor hourly rate and bank details
func (h *Handlers) SaveProfile(c *gin.Context) {
	program := c.MustGet("program").(string)
	userHash := c.MustGet("auth").(string)

	var profile models.MentorProfile
	if err := c.ShouldBindJSON(&profile); err != nil {
		h.ErrorResponse(c, http.StatusBadRequest, "Invalid profile payload: "+err.Error())
		return
	}

	if profile.ID == "" {
		profile.ID = uuid.New().String()
	}
	profile.Program = program
	profile.Created = models.AuditInfo{
		At: time.Now().Unix(),
		By: userHash,
	}

	if err := h.store.UpsertMentorProfile(c.Request.Context(), program, &profile); err != nil {
		h.ErrorResponse(c, http.StatusInternalServerError, "Failed to save profile: "+err.Error())
		return
	}

	// Invalidate Redis caches
	_ = h.cache.Del(c.Request.Context(),
		fmt.Sprintf("mentor_invoice:profiles:%s", program),
		fmt.Sprintf("mentor_invoice:summary:%s", program),
	)

	h.SuccessResponse(c, http.StatusOK, profile)
}
