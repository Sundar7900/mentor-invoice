package main

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"mentor-invoice/routes"
	"mentor-invoice/store"
	"mentor-invoice/worker"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	mongoURI := os.Getenv("MONGO_URI")
	dbName := os.Getenv("MONGO_DB_NAME")
	if dbName == "" {
		dbName = "zen_portal"
	}

	var dataStore store.Store

	if mongoURI != "" {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
		if err != nil {
			log.Fatalf("Failed to connect to MongoDB: %v", err)
		}
		log.Println("[mentor-invoice] Connected to MongoDB at", mongoURI)
		dataStore = store.NewMongoStore(client.Database(dbName))
	} else {
		log.Println("[mentor-invoice] MONGO_URI not provided. Starting in STANDALONE mock mode with pre-seeded data.")
		dataStore = store.NewFakeStore()
	}

	// Redis connection
	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = "localhost:6379"
	}

	var cache store.Cache = &store.NoOpCache{}
	var pool worker.Pool

	rdb := redis.NewClient(&redis.Options{
		Addr: redisAddr,
	})

	ctxRedis, cancelRedis := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancelRedis()

	if err := rdb.Ping(ctxRedis).Err(); err != nil {
		log.Printf("[mentor-invoice] Redis not reachable at %s (%v). Using NoOpCache.", redisAddr, err)
	} else {
		log.Printf("[mentor-invoice] Connected to Redis at %s", redisAddr)
		cache = store.NewRedisCache(rdb)

		workerPool := worker.NewRedisWorkerPool(rdb)
		worker.Register(workerPool, dataStore, cache)
		workerPool.Start(context.Background())
		pool = workerPool
	}

	router := gin.Default()

	// CORS middleware for local frontend dev
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, PATCH, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Register feature routes with Store, Redis Cache, and Worker Pool
	routes.Register(router, dataStore, cache, pool)

	log.Printf("[mentor-invoice] Server listening on :%s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Server stopped with error: %v", err)
	}
}
