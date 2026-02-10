package util

import (
	"fmt"
	"math/rand"
	"time"

	"github.com/google/uuid"
	"github.com/rs/xid"
)

type UUID = uuid.UUID

// NewUUID create UUID
func NewUUID() (UUID, error) {
	//
	return uuid.NewRandom()
}

// MustUUID
func MustUUID() UUID {
	v, err := NewUUID()
	if err != nil {
		panic(err)
	}
	return v
}

// NewSessionID
func NewSessionID() string {
	gid := xid.New()
	return gid.String()
}

// NewOrderID
func NewOrderID() string {
	t := time.Now().UTC()
	gid := xid.NewWithTime(t)
	return "ORD" + gid.String()
}

// NewSubscriptionID
func NewSubscriptionID() string {
	t := time.Now().UTC()
	gid := xid.NewWithTime(t)
	return "SORD" + gid.String()
}

// NewTradeID
func NewTradeID() string {
	t := time.Now().UTC()
	gid := xid.NewWithTime(t)
	return "TRA" + gid.String()
}

// NewTimestampUUID
func NewTimestampUUID() string {
	//
	timestamp := time.Now().UnixMilli()

	randomNumber := rand.Intn(10000)

	return fmt.Sprintf("%d%04d", timestamp, randomNumber)
}
