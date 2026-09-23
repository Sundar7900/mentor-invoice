package store

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"mentor-invoice/core"
	"mentor-invoice/models"
)

// MongoStore is the MongoDB implementation of Store
type MongoStore struct {
	db *mongo.Database
}

// NewMongoStore creates a new MongoStore instance
func NewMongoStore(db *mongo.Database) *MongoStore {
	return &MongoStore{db: db}
}

// GetMentorProfile fetches mentor profile enforcing program and deleted: false
func (s *MongoStore) GetMentorProfile(ctx context.Context, program, mentorHash string) (*models.MentorProfile, error) {
	filter := bson.M{
		"program":    program,
		"deleted":    false,
		"mentorHash": mentorHash,
	}

	var profile models.MentorProfile
	err := s.db.Collection(models.CollectionMentorProfiles).FindOne(ctx, filter).Decode(&profile)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &profile, nil
}

// UpsertMentorProfile creates or updates mentor billing profile
func (s *MongoStore) UpsertMentorProfile(ctx context.Context, program string, profile *models.MentorProfile) error {
	filter := bson.M{
		"program":    program,
		"mentorHash": profile.MentorHash,
		"deleted":    false,
	}

	profile.Program = program
	profile.Deleted = false
	if profile.Created.At == 0 {
		profile.Created.At = time.Now().Unix()
	}

	update := bson.M{
		"$set": profile,
	}

	opts := options.Update().SetUpsert(true)
	_, err := s.db.Collection(models.CollectionMentorProfiles).UpdateOne(ctx, filter, update, opts)
	return err
}

// ListMentorProfiles lists all mentor profiles for a program
func (s *MongoStore) ListMentorProfiles(ctx context.Context, program string) ([]models.MentorProfile, error) {
	filter := bson.M{
		"program": program,
		"deleted": false,
	}

	cursor, err := s.db.Collection(models.CollectionMentorProfiles).Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var list []models.MentorProfile
	if err := cursor.All(ctx, &list); err != nil {
		return nil, err
	}
	return list, nil
}

// SaveInvoice saves or updates an invoice
func (s *MongoStore) SaveInvoice(ctx context.Context, program string, inv *models.Invoice) error {
	inv.Program = program
	inv.Deleted = false
	if inv.Created.At == 0 {
		inv.Created.At = time.Now().Unix()
	}

	filter := bson.M{
		"program": program,
		"id":      inv.ID,
		"deleted": false,
	}

	opts := options.Update().SetUpsert(true)
	_, err := s.db.Collection(models.CollectionMentorInvoices).UpdateOne(ctx, filter, bson.M{"$set": inv}, opts)
	return err
}

// GetInvoice retrieves an invoice by id
func (s *MongoStore) GetInvoice(ctx context.Context, program, id string) (*models.Invoice, error) {
	filter := bson.M{
		"program": program,
		"id":      id,
		"deleted": false,
	}

	var inv models.Invoice
	err := s.db.Collection(models.CollectionMentorInvoices).FindOne(ctx, filter).Decode(&inv)
	if err != nil {
		return nil, err
	}
	return &inv, nil
}

// ListInvoices lists invoices for a program
func (s *MongoStore) ListInvoices(ctx context.Context, program string) ([]models.Invoice, error) {
	filter := bson.M{
		"program": program,
		"deleted": false,
	}

	cursor, err := s.db.Collection(models.CollectionMentorInvoices).Find(ctx, filter, options.Find().SetSort(bson.M{"created.at": -1}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var list []models.Invoice
	if err := cursor.All(ctx, &list); err != nil {
		return nil, err
	}
	return list, nil
}

// UpdateInvoiceStatus updates status of an invoice
func (s *MongoStore) UpdateInvoiceStatus(ctx context.Context, program, id, status string) error {
	filter := bson.M{
		"program": program,
		"id":      id,
		"deleted": false,
	}

	update := bson.M{
		"$set": bson.M{
			"status": status,
		},
	}

	res, err := s.db.Collection(models.CollectionMentorInvoices).UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}
	if res.MatchedCount == 0 {
		return fmt.Errorf("invoice not found")
	}
	return nil
}

// GetHostAttendanceForMentor fetches attendance records for a mentor in date range
func (s *MongoStore) GetHostAttendanceForMentor(ctx context.Context, program, mentorHash string, start, end int64) ([]models.HostAttendance, error) {
	filter := bson.M{
		"deleted": false,
		"host":    mentorHash,
	}

	if start > 0 || end > 0 {
		dateFilter := bson.M{}
		if start > 0 {
			dateFilter["$gte"] = start
		}
		if end > 0 {
			dateFilter["$lte"] = end
		}
		filter["sessionDate"] = dateFilter
	}

	cursor, err := s.db.Collection(models.CollectionHostAttendance).Find(ctx, filter, options.Find().SetSort(bson.M{"sessionStartTime": 1}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var list []models.HostAttendance
	if err := cursor.All(ctx, &list); err != nil {
		return nil, err
	}
	return list, nil
}

// GetSessionsForMentor fetches sessions
func (s *MongoStore) GetSessionsForMentor(ctx context.Context, program, mentorHash string, start, end int64) ([]models.Session, error) {
	filter := bson.M{
		"program": program,
		"deleted": false,
		"mentor":  mentorHash,
	}

	cursor, err := s.db.Collection(models.CollectionSessions).Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var list []models.Session
	if err := cursor.All(ctx, &list); err != nil {
		return nil, err
	}
	return list, nil
}

// GetBatchesMap builds a batch lookup map
func (s *MongoStore) GetBatchesMap(ctx context.Context, program string) (map[string]models.Batch, error) {
	filter := bson.M{
		"program": program,
		"deleted": false,
	}

	cursor, err := s.db.Collection(models.CollectionBatches).Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	batches := make(map[string]models.Batch)
	for cursor.Next(ctx) {
		var b models.Batch
		if err := cursor.Decode(&b); err == nil {
			batches[b.ID] = b
		}
	}
	return batches, nil
}

// GetCoursesMap builds a courses lookup map
func (s *MongoStore) GetCoursesMap(ctx context.Context, program string) (map[string]models.Course, error) {
	filter := bson.M{
		"program": program,
		"deleted": false,
	}

	cursor, err := s.db.Collection(models.CollectionCourses).Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	courses := make(map[string]models.Course)
	for cursor.Next(ctx) {
		var c models.Course
		if err := cursor.Decode(&c); err == nil {
			courses[c.ID] = c
		}
	}
	return courses, nil
}

// GetAllActiveMentors aggregates unique mentors and their statistics
func (s *MongoStore) GetAllActiveMentors(ctx context.Context, program string, start, end int64) ([]models.MentorListItem, error) {
	match := bson.M{
		"deleted": false,
	}
	if start > 0 || end > 0 {
		dateFilter := bson.M{}
		if start > 0 {
			dateFilter["$gte"] = start
		}
		if end > 0 {
			dateFilter["$lte"] = end
		}
		match["sessionDate"] = dateFilter
	}

	groupStage := bson.M{
		"$group": bson.M{
			"_id":       "$host",
			"hostName":  bson.M{"$first": "$hostName"},
			"hostEmail": bson.M{"$first": "$hostEmail"},
		},
	}

	cursor, err := s.db.Collection(models.CollectionHostAttendance).Aggregate(ctx, []bson.M{
		{"$match": match},
		groupStage,
	})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	type mentorGroup struct {
		Host      string `bson:"_id"`
		HostName  string `bson:"hostName"`
		HostEmail string `bson:"hostEmail"`
	}

	var groups []mentorGroup
	if err := cursor.All(ctx, &groups); err != nil {
		return nil, err
	}

	batches, _ := s.GetBatchesMap(ctx, program)
	courses, _ := s.GetCoursesMap(ctx, program)

	var items []models.MentorListItem
	for _, g := range groups {
		prof, _ := s.GetMentorProfile(ctx, program, g.Host)
		name := g.HostName
		email := g.HostEmail
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

		records, _ := s.GetHostAttendanceForMentor(ctx, program, g.Host, start, end)
		inv := core.AggregateMentorInvoice(core.AggregateInput{
			MentorHash:        g.Host,
			MentorName:        name,
			Email:             email,
			Profile:           prof,
			AttendanceRecords: records,
			Batches:           batches,
			Courses:           courses,
		})

		items = append(items, models.MentorListItem{
			MentorHash:      g.Host,
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
