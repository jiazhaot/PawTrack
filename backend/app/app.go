package app

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/natefinch/lumberjack"
	"github.com/sirupsen/logrus"
	"github.com/sirupsen/logrus/hooks/writer"
	configs "github.com/yiff028/comp90018-mobile-project/backend/app/config"
	"github.com/yiff028/comp90018-mobile-project/backend/app/controller"
	"github.com/yiff028/comp90018-mobile-project/backend/app/mixin"
	"github.com/yiff028/comp90018-mobile-project/backend/app/model"
	"github.com/yiff028/comp90018-mobile-project/backend/app/router"
	"github.com/yiff028/comp90018-mobile-project/backend/app/service"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/driver"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/logger"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/trace"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/util"
)

type options struct {
	ConfigFile string
	Version    string
}

// Option
type Option func(*options)

// SetConfigFile
func SetConfigFile(s string) Option {
	return func(o *options) {
		o.ConfigFile = s
	}
}

// SetVersion
func SetVersion(s string) Option {
	return func(o *options) {
		o.Version = s
	}
}

// AppName
const AppName = "paw-track-backend"

// Init
func Init(ctx context.Context, opts ...Option) (func(), error) {
	var o options
	for _, opt := range opts {
		opt(&o)
	}
	configs.LoadYaml(o.ConfigFile)
	trace.SetIDFunc(func() string {
		uuid, err := util.NewUUID()
		if err != nil {
			logger.Errorf(ctx, "Set Trace ID  for admin fail %+v", err)
			return ""
		}
		return uuid.String()
	})

	//
	loggerCleanFunc, multipleWriter, err := InitLogger(AppName)
	if err != nil {
		return nil, err
	}

	//
	dbInstance, dbCleanFunc := InitGormDB(ctx)

	// redis
	driver.CreateClient()
	redis := driver.RedisClient
	//
	userModel := model.User{DB: (*dbInstance).Db}
	tranModel := model.Transaction{DB: (*dbInstance).Db}
	dogModel := model.Dog{DB: (*dbInstance).Db}
	routeModel := model.Route{DB: (*dbInstance).Db}
	routePointModel := model.RoutePoint{DB: (*dbInstance).Db}
	binModel := model.Bin{DB: (*dbInstance).Db}

	dep := mixin.StoreDepency{
		RedisClient:     redis,
		DBClient:        *dbInstance,
		UserModel:       userModel,
		TranModel:       tranModel,
		RouteModel:      routeModel,
		RoutePointModel: routePointModel,
		DogModel:        dogModel,
		BinModel:        binModel,
	}
	//init web service
	ws := service.InitWInstance(ctx, "")
	//
	mrouter := &router.Router{
		AuthController: &controller.AuthController{
			Dep: dep,
			WS:  ws,
		},
		CommonController: &controller.CommonController{
			Dep: dep,
			WS:  ws,
		},
		DogController: &controller.DogController{
			Dep: dep,
			WS:  ws,
		},
		RouteController: &controller.RouteController{
			Dep: dep,
			WS:  ws,
		},
		BinController: &controller.BinController{
			Dep: dep,
			WS:  ws,
		},

		//todo
	}
	//
	engine := InitGinEngine(mrouter, dep, multipleWriter)
	//
	httpServerCleanFunc := InitHTTPServer(ctx, engine)

	return func() {
		httpServerCleanFunc()
		dbCleanFunc()
		loggerCleanFunc()
	}, nil
}

func initLogRotate(pathName string) *lumberjack.Logger {
	c := configs.C.Log

	lumberjackLogrotate := &lumberjack.Logger{
		Filename: pathName,

		MaxSize: c.MaxSize,

		MaxBackups: c.MaxBackups,

		MaxAge:   c.MaxAge,
		Compress: c.Compress,
	}
	return lumberjackLogrotate
}

// InitGinEngine
func InitGinEngine(r router.IRouter, dep mixin.StoreDepency, writer io.Writer) *gin.Engine {
	gin.SetMode(configs.C.RunMode)

	app := gin.New()

	app.Use(gin.RecoveryWithWriter(writer))

	r.Register(app, dep)
	return app
}

// InitGormDB
func InitGormDB(ctx context.Context) (*driver.Database, func()) {
	// db dirver
	database := driver.CreateDB(configs.C)
	return database, func() {
		database.Close()
	}
}

// InitHTTPServer
func InitHTTPServer(ctx context.Context, handler http.Handler) func() {
	cfg := configs.C.HTTP
	addr := fmt.Sprintf("%s:%d", cfg.Host, cfg.Port)
	//
	server := &http.Server{
		Addr:    addr,
		Handler: handler,

		ReadTimeout: time.Duration(cfg.ReadTimeout) * time.Second,

		WriteTimeout: time.Duration(cfg.WriteTimeout) * time.Second,
		// IdleTimeout is the maximum amount of time to wait for the next request when keep-alives are enabled
		IdleTimeout: time.Duration(cfg.IdleTimeout) * time.Second,
	}
	server.SetKeepAlivesEnabled(true)
	//
	go func() {
		logger.Printf(ctx, "HTTP Server is running at %s.", addr)
		var err error
		//
		err = server.ListenAndServe()
		if err != nil && err != http.ErrServerClosed {
			logger.Errorf(ctx, "http server fail: %+v\n", err)
			panic(err)
		}
	}()
	return func() {
		//
		ctx, cancel := context.WithTimeout(ctx, time.Second*time.Duration(cfg.ShutdownTimeout))
		defer cancel()
		server.SetKeepAlivesEnabled(true)
		if err := server.Shutdown(ctx); err != nil {
			logger.Errorf(ctx, "HTTP server forced to shut down here: %+v\n", err)
		}
	}
}

// InitLogger
func InitLogger(appType string) (func(), io.Writer, error) {
	c := configs.C.Log
	version := configs.C.Version
	outputFilePath := c.OutputFile
	outputErrPath := c.OutputErrFile
	// init log rotate
	lumberjackLogrotate := initLogRotate(outputFilePath)
	var errLogRotate *lumberjack.Logger
	if outputErrPath != "" {
		errLogRotate = initLogRotate(outputErrPath)
	}
	var logMultiWriter io.Writer
	logger.SetVersion(version)
	logger.SetLevel(c.Level)
	logger.SetFormatter(c.Format)
	//
	var file *os.File
	var errFile *os.File
	if c.Output != "" {
		switch c.Output {
		case "stdout":
			logger.SetOutput(os.Stdout)
		case "stderr":
			logger.SetOutput(os.Stderr)
		case "file":
			if name := outputFilePath; name != "" {
				_ = os.MkdirAll(filepath.Dir(name), 0777)
				logf, err := os.OpenFile(name, os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0666)
				// if fail then path error
				if err != nil {
					return nil, nil, err
				}
				//
				logMultiWriter = io.MultiWriter(logf, lumberjackLogrotate)
				logger.SetOutput(logMultiWriter)
				file = logf
			}
			if errName := outputErrPath; errName != "" {
				_ = os.MkdirAll(filepath.Dir(errName), 0777)
				errLogf, err := os.OpenFile(errName, os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0666)
				// if fail then path error
				if err != nil {
					return nil, nil, err
				}
				//
				logMultiWriter = io.MultiWriter(errLogf, errLogRotate)
				// add hook here
				logger.AddHook(&writer.Hook{
					Writer: logMultiWriter,
					LogLevels: []logrus.Level{
						logrus.PanicLevel,
						logrus.FatalLevel,
						logrus.ErrorLevel,
						logrus.WarnLevel,
					},
				})
				errFile = errLogf
			}
		}
	}
	//
	return func() {
		if file != nil {
			file.Close()
		}
		if errFile != nil {
			errFile.Close()
		}
	}, logMultiWriter, nil
}

// Run
func Run(ctx context.Context, opts ...Option) (func(), error) {
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGHUP, syscall.SIGINT, syscall.SIGTERM, syscall.SIGQUIT, os.Interrupt)
	// init
	clearFunc, err := Init(ctx, opts...)
	if err != nil {
		logger.Errorf(ctx, "init err is %+v\n", err)
		return nil, err
	}
EXIT:
	for {
		sig := <-quit
		logger.Printf(ctx, "get signal[%s]", sig.String())
		switch sig {
		case syscall.SIGQUIT, syscall.SIGTERM, syscall.SIGINT:
			break EXIT
		case syscall.SIGHUP:
		default:
			break EXIT
		}
	}
	logger.Printf(ctx, "service exist")
	return clearFunc, nil
}
