package model

import (
	"context"
	"time"

	"github.com/yiff028/comp90018-mobile-project/backend/app/model/schema"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/errors"
	"gorm.io/gorm"
)

type Dog struct {
	DB *gorm.DB
}

// Create
func (d *Dog) Create(ctx context.Context, item *schema.Dog) error {
	db := schema.GetDogDB(ctx, d.DB)
	result := db.Create(item)
	if err := result.Error; err != nil {
		return errors.WithStack(err)
	}
	return nil
}

// List
func (d *Dog) List(ctx context.Context, userId uint) (schema.DogList, error) {
	db := schema.GetDogDB(ctx, d.DB).Debug()

	db = db.Where("user_id = ?", userId)
	dogList := schema.DogList{}

	db = db.Find(&dogList)
	if err := db.Error; err != nil {
		return nil, err
	}

	return dogList, nil
}

// Delete
func (d *Dog) Delete(ctx context.Context, dogId uint, userId uint) error {
	db := schema.GetDogDB(ctx, d.DB)
	result := db.Where("id = ?", dogId).Where("user_id = ?", userId).Delete(&schema.Dog{})
	if err := result.Error; err != nil {
		return errors.WithStack(err)
	}
	return nil
}

// UpdateLocation
func (d *Dog) UpdateLocation(ctx context.Context, dogId uint, userId uint, longitude float64, latitude float64) error {
	db := schema.GetDogDB(ctx, d.DB)
	db = db.Where("id = ?", dogId).Where("user_id = ?", userId)
	now := time.Now()
	updateMap := map[string]interface{}{}
	updateMap["longitude"] = longitude
	updateMap["latitude"] = latitude
	updateMap["location_updated_time"] = now

	result := db.Updates(updateMap)
	if err := result.Error; err != nil {
		return errors.WithStack(err)
	}
	return nil
}

// ListCurrentDog
func (d *Dog) ListCurrentDog(ctx context.Context) (schema.DogList, error) {
	db := schema.GetDogDB(ctx, d.DB)

	startTime := time.Now().Add(-300 * time.Minute)

	db = db.Where("location_updated_time >= ?", startTime)
	dogList := schema.DogList{}

	db = db.Find(&dogList)
	if err := db.Error; err != nil {
		return nil, err
	}

	return dogList, nil
}
