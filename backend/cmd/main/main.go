package main

import (
	"context"
	"os"
	"path/filepath"
	"sync/atomic"
	"time"

	"github.com/yiff028/comp90018-mobile-project/backend/app"
	"github.com/yiff028/comp90018-mobile-project/backend/pkg/logger"
)

// VERSION
var VERSION = "1.0.0"

func main() {
	var state int32 = 1
	logger.SetVersion(VERSION)

	ctx := logger.NewTraceIDContext(context.Background(), "pawtrack-backend")
	var path = "/configs/config.yaml"
	dir, err := filepath.Abs(filepath.Dir("."))
	if err != nil {
		logger.Fatalf(context.Background(), "load error")
	}
	logger.Infof(context.Background(), "dir here %s", dir)
	clearFunc, _ := app.Run(ctx,
		app.SetConfigFile(dir+path),
		app.SetVersion(VERSION))

	defer func() {
		if r := recover(); r != nil {
			logger.Errorf(ctx, "panic: %+v", r)
		}
		clearFunc()
		time.Sleep(time.Second * 3)
		os.Exit(int(atomic.LoadInt32(&state)))
	}()
}
