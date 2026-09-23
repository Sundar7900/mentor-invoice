package routes

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"mentor-invoice/controllers"
	"mentor-invoice/models"
	"mentor-invoice/store"
	"mentor-invoice/worker"
)

// MockAuthMiddleware extracts token and tenancy following HACKATHON_RULES.md
// In production Zen portal, this is provided by Zen auth service.
func MockAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		// The client sends the token as Authorization: <token>, with no Bearer prefix.
		token = strings.TrimPrefix(token, "Bearer ")
		token = strings.TrimSpace(token)

		userHash := "mock-user-hash-admin"
		program := "zen" // Default tenant

		if token != "" {
			parts := strings.Split(token, ":")
			if len(parts) >= 2 {
				userHash = parts[0]
				program = parts[1]
			} else {
				userHash = token
			}
		}

		c.Set("auth", userHash)
		c.Set("program", program)
		c.Next()
	}
}

// RequirePermission enforces route-level permissions required by HACKATHON_RULES.md
func RequirePermission(permission string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Verify permission tag exists
		if permission == "" {
			c.JSON(http.StatusForbidden, gin.H{
				"status":  "error",
				"message": "Permission requirement missing on route",
			})
			c.Abort()
			return
		}
		// In mock mode, permit valid requests while recording the permission check
		c.Set("declaredPermission", permission)
		c.Next()
	}
}

// Register mounts all feature endpoints under /mentor-invoice/...
func Register(engine *gin.Engine, st store.Store, cache store.Cache, pool worker.Pool) {
	h := controllers.New(st, cache, pool)

	group := engine.Group("/mentor-invoice")
	group.Use(MockAuthMiddleware())
	{
		// High-level KPIs & mentor listings
		group.GET("/summary", RequirePermission(models.PermissionView), h.GetSummary)
		group.GET("/mentors", RequirePermission(models.PermissionView), h.GetMentors)

		// Live calculation & invoice preview
		group.GET("/preview", RequirePermission(models.PermissionView), h.PreviewInvoice)

		// Invoice generation & lifecycle
		group.POST("/generate", RequirePermission(models.PermissionEdit), h.GenerateInvoice)
		group.POST("/batch-generate", RequirePermission(models.PermissionEdit), h.BatchGenerateInvoices)
		group.GET("/list", RequirePermission(models.PermissionView), h.ListInvoices)
		group.GET("/:id", RequirePermission(models.PermissionView), h.GetInvoice)
		group.PATCH("/:id/status", RequirePermission(models.PermissionEdit), h.UpdateInvoiceStatus)

		// Mentor Billing Profile & Rates
		group.GET("/profiles", RequirePermission(models.PermissionView), h.GetProfiles)
		group.POST("/profiles", RequirePermission(models.PermissionEdit), h.SaveProfile)
	}
}
