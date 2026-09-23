package controllers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"

	"mentor-invoice/models"
	"mentor-invoice/store"
)

func setupTestRouter(fs store.Store) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	// Mock auth
	r.Use(func(c *gin.Context) {
		c.Set("auth", "admin-hash")
		c.Set("program", "zen")
		c.Next()
	})

	h := New(fs, &store.NoOpCache{}, nil)
	grp := r.Group("/mentor-invoice")
	{
		grp.GET("/summary", h.GetSummary)
		grp.GET("/mentors", h.GetMentors)
		grp.GET("/preview", h.PreviewInvoice)
		grp.POST("/generate", h.GenerateInvoice)
		grp.GET("/list", h.ListInvoices)
		grp.GET("/:id", h.GetInvoice)
		grp.PATCH("/:id/status", h.UpdateInvoiceStatus)
		grp.GET("/profiles", h.GetProfiles)
		grp.POST("/profiles", h.SaveProfile)
	}

	return r
}

func TestSummaryHandler(t *testing.T) {
	fs := store.NewFakeStore()
	r := setupTestRouter(fs)

	req := httptest.NewRequest(http.MethodGet, "/mentor-invoice/summary", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	var resp struct {
		Status string                `json:"status"`
		Data   models.InvoiceSummary `json:"data"`
	}
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("Failed to parse json: %v", err)
	}

	if resp.Status != "success" {
		t.Errorf("Expected status 'success', got '%s'", resp.Status)
	}

	if resp.Data.ActiveMentorsCount == 0 {
		t.Errorf("Expected active mentors count > 0, got %d", resp.Data.ActiveMentorsCount)
	}
}

func TestPreviewInvoiceHandler(t *testing.T) {
	fs := store.NewFakeStore()
	r := setupTestRouter(fs)

	shabarinathHash := "5f0a150188351bf13b2721fa2ca3de341a161b1f75b7f986a42f0cdd85e14e19cf4765c41b3e98242d9fe025ac95aa582c0abfc577ee3f0224719f753bd69728"
	req := httptest.NewRequest(http.MethodGet, "/mentor-invoice/preview?mentorHash="+shabarinathHash, nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	var resp struct {
		Status string         `json:"status"`
		Data   models.Invoice `json:"data"`
	}
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("Failed to parse json: %v", err)
	}

	if resp.Status != "success" {
		t.Errorf("Expected status 'success', got '%s'", resp.Status)
	}

	// In FakeStore we preloaded 21 sessions totaling 44.6 hours at 3000/hr = 133800
	if resp.Data.TotalHours != 44.6 {
		t.Errorf("Expected 44.6 hours, got %f", resp.Data.TotalHours)
	}
	if resp.Data.TotalAmount != 133800 {
		t.Errorf("Expected 133800 total amount, got %f", resp.Data.TotalAmount)
	}
	if resp.Data.BankDetails.AccountNumber != "18521810013970" {
		t.Errorf("Expected bank account '18521810013970', got '%s'", resp.Data.BankDetails.AccountNumber)
	}
}

func TestSaveAndGetProfileHandler(t *testing.T) {
	fs := store.NewFakeStore()
	r := setupTestRouter(fs)

	newProfile := models.MentorProfile{
		MentorHash: "new-mentor-789",
		MentorName: "Akash Gupta",
		Email:      "akash@guvi.in",
		HourlyRate: 2000.0,
		BankDetails: models.BankDetails{
			AccountNumber: "1122334455",
			IFSC:          "SBIN0001234",
			PANNumber:     "XYZPN9876K",
		},
	}
	body, _ := json.Marshal(newProfile)

	req := httptest.NewRequest(http.MethodPost, "/mentor-invoice/profiles", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	// Verify profile is in store
	prof, err := fs.GetMentorProfile(nil, "zen", "new-mentor-789")
	if err != nil || prof.HourlyRate != 2000.0 {
		t.Errorf("Failed to retrieve saved profile from store: %v", err)
	}
}
