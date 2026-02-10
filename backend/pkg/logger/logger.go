package logger

import (
	"context"
	"fmt"
	"io"
	"os"
	"time"

	"github.com/sirupsen/logrus"
)

// 定义key名
const (
	TraceIDKey      = "trace_id"
	SpanTitleKey    = "span_title"
	SpanFunctionKey = "span_function"
	UserIDKey       = "user_id"
	VersionKey      = "version"
)

// TraceIDFunc
type TraceIDFunc func() string

var (
	version     string
	traceIDFunc TraceIDFunc
	pid         = os.Getpid()
)

func init() {
	traceIDFunc = func() string {
		return fmt.Sprintf("trace-id-%d-%s",
			os.Getpid(),
			time.Now().Format("2020.01.02.15.04.05.999999"))
	}
}

// Logger
type Logger = logrus.Logger

// Hook
type Hook = logrus.Hook

// StandardLogger
func StandardLogger() *Logger {
	return logrus.StandardLogger()
}

// SetLevel
func SetLevel(level int) {
	logrus.SetLevel(logrus.Level(level))
}

// SetFormatter
func SetFormatter(format string) {
	switch format {
	case "json":
		logrus.SetFormatter(new(logrus.JSONFormatter))
	default:
		logrus.SetFormatter(new(logrus.TextFormatter))
	}
}

// SetOutput
func SetOutput(out io.Writer) {
	logrus.SetOutput(out)
}

// SetVersion
func SetVersion(v string) {
	version = v
}

// SetTraceIDFunc
func SetTraceIDFunc(fn TraceIDFunc) {
	traceIDFunc = fn
}

// AddHook
func AddHook(hook Hook) {
	logrus.AddHook(hook)
}

type (
	traceIDContextKey struct{}
	userIDContextKey  struct{}
)

// NewTraceIDContext
// use an unique type to quickly and precisely get the traceID
func NewTraceIDContext(ctx context.Context, traceID string) context.Context {
	return context.WithValue(ctx, traceIDContextKey{}, traceID)
}

// FromTraceIDContext
func FromTraceIDContext(ctx context.Context) string {
	v := ctx.Value(traceIDContextKey{})
	if v != nil {
		if s, ok := v.(string); ok {
			return s
		}
	}
	return traceIDFunc()
}

// NewUserIDContext
func NewUserIDContext(ctx context.Context, userID string) context.Context {
	return context.WithValue(ctx, userIDContextKey{}, userID)
}

// FromUserIDContext
func FromUserIDContext(ctx context.Context) string {
	v := ctx.Value(userIDContextKey{})
	if v != nil {
		if s, ok := v.(string); ok {
			return s
		}
	}
	return ""
}

type spanOptions struct {
	Title    string
	FuncName string
}

// SpanOption
type SpanOption func(*spanOptions)

// SetSpanTitle
func SetSpanTitle(title string) SpanOption {
	return func(o *spanOptions) {
		o.Title = title
	}
}

// SetSpanFuncName
func SetSpanFuncName(funcName string) SpanOption {
	return func(o *spanOptions) {
		o.FuncName = funcName
	}
}

// StartSpan
func StartSpan(ctx context.Context, opts ...SpanOption) *Entry {
	if ctx == nil {
		ctx = context.Background()
	}
	var spanOpt spanOptions
	for _, opt := range opts {
		opt(&spanOpt)
	}
	fields := map[string]interface{}{
		VersionKey: version,
	}
	if v := FromTraceIDContext(ctx); v != "" {
		fields[TraceIDKey] = v
	}
	if v := FromUserIDContext(ctx); v != "" {
		fields[UserIDKey] = v
	}
	if v := spanOpt.Title; v != "" {
		fields[SpanTitleKey] = v
	}
	if v := spanOpt.FuncName; v != "" {
		fields[SpanFunctionKey] = v
	}
	//
	return newEntry(logrus.WithFields(fields))
}

// Infof
func Infof(ctx context.Context, format string, args ...interface{}) {
	var spanEntry = StartSpan(ctx)
	spanEntry.entry.Infof(format, args...)
}

// Debugf
func Debugf(ctx context.Context, format string, args ...interface{}) {
	var spanEntry = StartSpan(ctx)
	spanEntry.entry.Debugf(format, args...)
}

// Printf
func Printf(ctx context.Context, format string, args ...interface{}) {
	var spanEntry = StartSpan(ctx)
	spanEntry.entry.Printf(format, args...)
}

// Warnf
func Warnf(ctx context.Context, format string, args ...interface{}) {
	var spanEntry = StartSpan(ctx)
	spanEntry.entry.Warnf(format, args...)
}

// Errorf
func Errorf(ctx context.Context, format string, args ...interface{}) {
	var spanEntry = StartSpan(ctx)
	spanEntry.entry.Errorf(format, args...)
}

// Fatalf
func Fatalf(ctx context.Context, format string, args ...interface{}) {
	var spanEntry = StartSpan(ctx)
	spanEntry.entry.Fatalf(format, args...)
}

// Entry
type Entry struct {
	entry *logrus.Entry
}

func newEntry(entry *logrus.Entry) *Entry {
	return &Entry{entry: entry}
}

func (e *Entry) checkAndDelete(fields map[string]interface{}, keys ...string) {
	for _, key := range keys {
		_, ok := fields[key]
		if ok {
			delete(fields, key)
		}
	}
}

// WithFields
func (e *Entry) WithFields(fields map[string]interface{}) *Entry {
	e.checkAndDelete(fields, TraceIDKey, SpanTitleKey, SpanFunctionKey, VersionKey)
	return newEntry(e.entry.WithFields(fields))
}

// WithField
func (e *Entry) WithField(key string, value interface{}) *Entry {
	return e.WithFields(map[string]interface{}{key: value})
}

// Infof
func (e *Entry) Infof(format string, args ...interface{}) {
	e.entry.Infof(format, args...)
}
