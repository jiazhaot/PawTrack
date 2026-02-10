# note: call scripts from /scripts
#GOOS=darwin
GOOS=linux
GOARCH=amd64
PROJECTNAME=$(shell basename "$(PWD)")

APP = pawtracktest

APP_PRERELEASE = pawtrackpre

APP_PRODUCTION = pawtrack

PROJECTPATH=github.com/yiff028/comp90018-mobile-project/backend/cmd/main

export GOPATH := $(shell go env GOPATH)
GOBASE=$(GOPATH)
GOBIN=$(GOBASE)/bin

install:
	go mod download

built:
	go build -race -o $(GOBIN)/$(PROJECTNAME) $(PROJECTPATH)
	# go install $(GOBASE)/cmd/main/main.go

clean: 
	go clean
	rm -rf ./release/*

start:
	$(GOPATH)/bin/${PROJECTNAME}

# 测试环境
cross:
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o ./release/$(APP) $(PROJECTPATH)

# 预发布
prerelease:
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o ./release/$(APP_PRERELEASE) $(PROJECTPATH)

# 生产环境
production:
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o ./release/$(APP_PRODUCTION) $(PROJECTPATH)

