package redismodel

import "github.com/yiff028/comp90018-mobile-project/backend/pkg/driver"

type RedisUserModel struct {
	RedisInstance driver.ClientType
}

//User A Map to store user info , and replace it
