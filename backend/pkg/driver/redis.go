package driver

import (
	"context"
	"fmt"
	"time"

	"github.com/go-redis/redis/v7"
	configs "github.com/yiff028/comp90018-mobile-project/backend/app/config"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/logger"
)

// ClientType
type ClientType struct {
	Conn *redis.Client
}

// RedisClient
var RedisClient ClientType

// CreateClient @TODO: Cluster
func CreateClient() error {
	var c = configs.C.GetConfig()
	fmt.Printf("redis config is %+v\n", c.Redis)
	RedisClient.Conn = redis.NewClient(&redis.Options{
		Addr:        c.Redis.Host,
		Password:    c.Redis.Password,
		DB:          c.Redis.DB,
		DialTimeout: time.Second * 3,
	})
	pong, err := RedisClient.Conn.Ping().Result()
	fmt.Println("redis pong is", pong)
	if err != nil {
		logger.Errorf(context.Background(), err.Error())
	}
	return err
}

// Set
func (client *ClientType) Set(key string, value interface{}, expiration time.Duration) (*redis.Client, error) {
	err := client.Conn.Set(key, value, expiration).Err()
	if err != nil {
		return nil, err
	}
	return (*client).Conn, nil
}

// SetNx atomic operation to ensure the set concurrency safe
func (client *ClientType) SetNx(key string, value interface{}, expiration time.Duration) (bool, error) {
	isSuccess, err := client.Conn.SetNX(key, value, expiration).Result()
	if err != nil {
		return false, err
	}
	return isSuccess, nil
}

// Get
func (client *ClientType) Get(key string) (string, error) {
	val, err := (*client).Conn.Get(key).Result()
	// key does not exists
	if err == redis.Nil {
		return "", nil
	}
	if err != nil {
		return "", nil
	}

	return val, nil
}

// Pipeline
func (client *ClientType) Pipeline() redis.Pipeliner {
	return client.Conn.Pipeline()
}

// Expire
func (client *ClientType) Expire(key string, expiration time.Duration) (bool, error) {
	res, err := client.Conn.Expire(key, expiration).Result()
	if err != nil {
		return false, err
	}
	return res, nil
}

// IsExist
func (client *ClientType) IsExist(key string) bool {
	_, err := (*client).Conn.Get(key).Result()
	return err != redis.Nil
}

// MGet
func (client *ClientType) MGet(key ...string) ([]interface{}, error) {
	res, err := client.Conn.MGet(key...).Result()
	if err != nil {
		return nil, err
	}
	return res, nil
}

// Del
func (client *ClientType) Del(key ...string) (*redis.Client, error) {
	_, err := client.Conn.Del(key...).Result()
	if err != nil {
		return nil, err
	}
	return (*client).Conn, nil
}

// HGetAll
func (client *ClientType) HGetAll(key string) (map[string]string, error) {
	mapStr, err := client.Conn.HGetAll(key).Result()
	if err != nil {
		return nil, err
	}
	return mapStr, nil
}

// HGet
func (client *ClientType) HGet(key string, pop string) (string, error) {
	mapStr, err := client.Conn.HGet(key, pop).Result()
	if err != nil {
		return "", err
	}
	return mapStr, nil
}

// HMSet
func (client *ClientType) HMSet(key string, values ...interface{}) (bool, error) {
	success, err := client.Conn.HMSet(key, values...).Result()
	if err != nil {
		return false, err
	}
	return success, nil
}

// HDel
func (client *ClientType) HDel(key string, fields ...string) (int64, error) {
	success, err := client.Conn.HDel(key, fields...).Result()
	if err != nil {
		return 0, err
	}
	return success, nil
}

// HSet
func (client *ClientType) HSet(key string, values ...interface{}) (int64, error) {
	success, err := client.Conn.HSet(key, values...).Result()
	if err != nil {
		return -1, err
	}
	return success, nil
}

// LPush
func (client *ClientType) LPush(key string, values ...interface{}) (int64, error) {
	lres, err := (*client).Conn.LPush(key, values...).Result()
	if err != nil {
		return -1, err
	}
	return lres, nil
}

// LRange
func (client *ClientType) LRange(key string, start int64, end int64) ([]string, error) {
	list, err := (*client).Conn.LRange(key, start, end).Result()
	if err != nil {
		return nil, err
	}
	return list, nil
}

// LTrim
func (client *ClientType) LTrim(key string, start int64, end int64) (string, error) {
	list, err := (*client).Conn.LTrim(key, start, end).Result()
	if err != nil {
		return "", err
	}
	return list, nil
}

// PSubscribe
func (client *ClientType) PSubscribe(channels ...string) *redis.PubSub {
	ps := (*client).Conn.PSubscribe(channels...)
	return ps
}

// SCard
func (client *ClientType) SCard(key string) (int64, error) {
	count, err := (*client).Conn.SCard(key).Result()
	if err != nil {
		return 0, err
	}
	return count, nil
}

// SIsMember
func (client *ClientType) SIsMember(key string, value interface{}) (bool, error) {
	exist, err := (*client).Conn.SIsMember(key, value).Result()
	if err != nil {
		return false, err
	}
	return exist, nil
}

// SMembers
func (client *ClientType) SMembers(key string) ([]string, error) {
	set, err := (*client).Conn.SMembers(key).Result()
	if err != nil {
		return nil, err
	}
	return set, nil
}

// SAdd
func (client *ClientType) SAdd(key string, members ...interface{}) (int64, error) {
	lres, err := (*client).Conn.SAdd(key, members...).Result()
	if err != nil {
		return -1, err
	}
	return lres, nil
}
