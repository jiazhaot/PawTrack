package driver

import (
	"log"
	"os"
	"time"

	configs "github.com/yiff028/comp90018-mobile-project/backend/app/config"

	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	//
	mysqlDriver "gorm.io/driver/mysql"
)

// Database
type Database struct {
	Db *gorm.DB
}

// CreateDB
func CreateDB(c *configs.Config) *Database {
	// mysql.DSN from config
	mysql := c.MySQL
	var database = new(Database)

	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags), // io writer
		logger.Config{
			SlowThreshold:             time.Second, // Slow SQL threshold
			LogLevel:                  logger.Warn, // Log level
			IgnoreRecordNotFoundError: true,        // Ignore ErrRecordNotFound error for logger
			ParameterizedQueries:      false,       // include params in the SQL log
			Colorful:                  false,       // Disable color
		},
	)

	db, err := gorm.Open(mysqlDriver.Open(mysql.DSN()), &gorm.Config{
		Logger: newLogger,
	})
	if err != nil {
		log.Fatal("Gorm db close error:", err.Error())
	}
	// err := defer db.Close()
	sqlDB, err := db.DB()
	if err != nil || sqlDB == nil {
		log.Fatal("get sql db fail \n", err.Error())
	}
	err = sqlDB.Ping()
	if err != nil {
		log.Fatal("ping db err \n", err.Error())
	}
	//
	sqlDB.SetMaxIdleConns(c.Gorm.MaxIdleConns)
	sqlDB.SetMaxOpenConns(c.Gorm.MaxOpenConns)
	sqlDB.SetConnMaxLifetime(time.Duration(c.Gorm.MaxLifetime) * time.Second)
	database.Db = db
	return database
}

// Close the sql db
func (database *Database) Close() error {
	sqlDB, err := database.Db.DB()
	if err != nil {
		log.Fatalf("failed to get *sql.DB: %v", err)
	}

	return sqlDB.Close()
}
