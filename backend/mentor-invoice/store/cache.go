package store

import (
	"context"
	"encoding/json"
	"time"

	"github.com/redis/go-redis/v9"
)

// Cache interface for high-performance Redis caching
type Cache interface {
	Get(ctx context.Context, key string, dest interface{}) bool
	Set(ctx context.Context, key string, value interface{}, ttl time.Duration) error
	Del(ctx context.Context, keys ...string) error
}

// RedisCache implements Cache using official go-redis
type RedisCache struct {
	client *redis.Client
}

// NewRedisCache creates a new RedisCache client
func NewRedisCache(client *redis.Client) *RedisCache {
	return &RedisCache{client: client}
}

// Get retrieves and deserializes cached JSON from Redis
func (r *RedisCache) Get(ctx context.Context, key string, dest interface{}) bool {
	if r.client == nil {
		return false
	}
	val, err := r.client.Get(ctx, key).Bytes()
	if err != nil {
		return false
	}
	return json.Unmarshal(val, dest) == nil
}

// Set serializes and stores a key-value pair in Redis with TTL
func (r *RedisCache) Set(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	if r.client == nil {
		return nil
	}
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return r.client.Set(ctx, key, data, ttl).Err()
}

// Del invalidates one or more keys in Redis
func (r *RedisCache) Del(ctx context.Context, keys ...string) error {
	if r.client == nil || len(keys) == 0 {
		return nil
	}
	return r.client.Del(ctx, keys...).Err()
}

// NoOpCache fallback when Redis is not configured
type NoOpCache struct{}

func (n *NoOpCache) Get(ctx context.Context, key string, dest interface{}) bool { return false }
func (n *NoOpCache) Set(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	return nil
}
func (n *NoOpCache) Del(ctx context.Context, keys ...string) error { return nil }
