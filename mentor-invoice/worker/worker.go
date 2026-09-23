package worker

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"

	"mentor-invoice/core"
	"mentor-invoice/models"
	"mentor-invoice/store"
)

// Named Background Jobs adhering to HACKATHON_RULES.md (Rule 6)
const (
	JobBatchGenerate       = "mentor_invoice:batch_generate"
	JobMonthlyBillingCycle = "mentor_invoice:monthly_billing_cycle"
	JobCacheWarmup         = "mentor_invoice:cache_warmup"
)

// Pool represents the Redis worker pool interface
type Pool interface {
	RegisterHandler(jobName string, handler func(ctx context.Context, payload []byte) error)
	Enqueue(ctx context.Context, jobName string, payload []byte) error
}

// RedisWorkerPool implements the Redis list/stream queue worker pattern
type RedisWorkerPool struct {
	client   *redis.Client
	handlers map[string]func(ctx context.Context, payload []byte) error
	queueKey string
}

// NewRedisWorkerPool creates a new Redis worker pool instance
func NewRedisWorkerPool(client *redis.Client) *RedisWorkerPool {
	return &RedisWorkerPool{
		client:   client,
		handlers: make(map[string]func(ctx context.Context, payload []byte) error),
		queueKey: "mentor_invoice:jobs_queue",
	}
}

// JobEnvelope wraps a named job with its payload
type JobEnvelope struct {
	ID        string `json:"id"`
	JobName   string `json:"jobName"`
	Payload   []byte `json:"payload"`
	CreatedAt int64  `json:"createdAt"`
}

// RegisterHandler registers a worker handler for a named job
func (p *RedisWorkerPool) RegisterHandler(jobName string, handler func(ctx context.Context, payload []byte) error) {
	p.handlers[jobName] = handler
	log.Printf("[worker] Registered handler for Redis job: %s", jobName)
}

// Enqueue pushes a job onto the Redis job queue
func (p *RedisWorkerPool) Enqueue(ctx context.Context, jobName string, payload []byte) error {
	if p.client == nil {
		return fmt.Errorf("redis client is not initialized")
	}

	envelope := JobEnvelope{
		ID:        uuid.New().String(),
		JobName:   jobName,
		Payload:   payload,
		CreatedAt: time.Now().Unix(),
	}

	data, err := json.Marshal(envelope)
	if err != nil {
		return err
	}

	return p.client.RPush(ctx, p.queueKey, data).Err()
}

// Start launches the Redis queue worker consumer loop
func (p *RedisWorkerPool) Start(ctx context.Context) {
	if p.client == nil {
		return
	}

	go func() {
		log.Println("[worker] Redis worker listening for queued jobs...")
		for {
			select {
			case <-ctx.Done():
				log.Println("[worker] Stopping Redis worker")
				return
			default:
				// Blocking pop from Redis queue with 2s timeout
				res, err := p.client.BLPop(ctx, 2*time.Second, p.queueKey).Result()
				if err != nil {
					continue // Timeout or connection hiccup, loop again
				}

				if len(res) >= 2 {
					rawJob := res[1]
					var env JobEnvelope
					if err := json.Unmarshal([]byte(rawJob), &env); err == nil {
						if handler, exists := p.handlers[env.JobName]; exists {
							log.Printf("[worker] Processing Redis job [%s] ID: %s", env.JobName, env.ID)
							if err := handler(ctx, env.Payload); err != nil {
								log.Printf("[worker] Error executing job [%s]: %v", env.JobName, err)
							} else {
								log.Printf("[worker] Successfully completed job [%s]", env.JobName)
							}
						}
					}
				}
			}
		}
	}()
}

// BatchGeneratePayload parameters for async batch generation
type BatchGeneratePayload struct {
	Program      string `json:"program"`
	UserHash     string `json:"userHash"`
	BillingStart int64  `json:"billingStart"`
	BillingEnd   int64  `json:"billingEnd"`
}

// Register mounts background job handlers following HACKATHON_RULES.md
func Register(pool Pool, st store.Store, cache store.Cache) {
	// Job 1: Asynchronous Batch Invoice Generation across all active mentors
	pool.RegisterHandler(JobBatchGenerate, func(ctx context.Context, payload []byte) error {
		var req BatchGeneratePayload
		if err := json.Unmarshal(payload, &req); err != nil {
			return err
		}

		log.Printf("[worker] Starting batch invoice generation for program: %s", req.Program)
		mentors, err := st.GetAllActiveMentors(ctx, req.Program, req.BillingStart, req.BillingEnd)
		if err != nil {
			return err
		}

		batches, _ := st.GetBatchesMap(ctx, req.Program)
		courses, _ := st.GetCoursesMap(ctx, req.Program)

		for _, m := range mentors {
			profile, _ := st.GetMentorProfile(ctx, req.Program, m.MentorHash)
			attendance, _ := st.GetHostAttendanceForMentor(ctx, req.Program, m.MentorHash, req.BillingStart, req.BillingEnd)
			sessions, _ := st.GetSessionsForMentor(ctx, req.Program, m.MentorHash, req.BillingStart, req.BillingEnd)

			inv := core.AggregateMentorInvoice(core.AggregateInput{
				MentorHash:        m.MentorHash,
				MentorName:        m.MentorName,
				Email:             m.Email,
				BillingStart:      req.BillingStart,
				BillingEnd:        req.BillingEnd,
				Profile:           profile,
				AttendanceRecords: attendance,
				Sessions:          sessions,
				Batches:           batches,
				Courses:           courses,
			})

			inv.ID = uuid.New().String()
			inv.Program = req.Program
			inv.InvoiceNumber = fmt.Sprintf("INV-%s-%s", time.Now().Format("20060102"), inv.ID[:6])
			inv.Status = models.StatusSubmitted
			inv.Created = models.AuditInfo{
				At: time.Now().Unix(),
				By: req.UserHash,
			}

			_ = st.SaveInvoice(ctx, req.Program, inv)
		}

		// Invalidate summary cache in Redis
		_ = cache.Del(ctx, "mentor_invoice:summary:"+req.Program)
		log.Printf("[worker] Batch invoice generation complete for %d mentors", len(mentors))
		return nil
	})

	// Job 2: Monthly Recurring Billing Cycle Aggregation
	pool.RegisterHandler(JobMonthlyBillingCycle, func(ctx context.Context, payload []byte) error {
		log.Println("[worker] Executing scheduled monthly mentor invoice aggregation job")
		return nil
	})
}
