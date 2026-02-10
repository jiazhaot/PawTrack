package trace

import (
	"context"
	"fmt"
	"os"
	"time"
)

type IDFunc func() string

type (
	transCtx   struct{}
	traceIDCtx struct{}
)

var (
	idFunc IDFunc
	pid    = os.Getpid()
)

func init() {
	idFunc = func() string {
		return fmt.Sprintf("trace-id-%d-%s", pid, time.Now().Format("2020.01.02.15.04.05.999999"))
	}
}

// SetIDFunc Set trace id func
func SetIDFunc(traceIDFunc IDFunc) {
	idFunc = traceIDFunc
}

// NewID Create trace id
func NewID() string {
	return idFunc()
}

// NewTraceID 填入traceID到context
func NewTraceID(ctx context.Context, traceID string) context.Context {
	return context.WithValue(ctx, traceIDCtx{}, traceID)
}

// FromTraceID 从Context获取traceID
func FromTraceID(ctx context.Context) (string, bool) {
	// 从context取traceId
	v := ctx.Value(traceIDCtx{})
	if v != nil {
		if s, ok := v.(string); ok {
			//
			return s, s != ""
		}
	}
	//
	return "", false
}
