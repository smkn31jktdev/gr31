package noop_outbound_adapter

import (
	"github.com/redis/go-redis/v9"

	"prabogo/internal/model"
	outbound_port "prabogo/internal/port/outbound"
)

type cacheAdapter struct{}

type clientCacheAdapter struct{}

func NewCacheAdapter() outbound_port.CachePort {
	return &cacheAdapter{}
}

func (a *cacheAdapter) Client() outbound_port.ClientCachePort {
	return &clientCacheAdapter{}
}

func (a *clientCacheAdapter) Set(data model.Client) error {
	return nil
}

func (a *clientCacheAdapter) Get(bearerKey string) (model.Client, error) {
	return model.Client{}, redis.Nil
}
