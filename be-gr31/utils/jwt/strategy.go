package jwt

import (
	"prabogo/internal/model"
	"time"
)

type Strategy interface {
	Generate(claims model.AuthClaims, ttl time.Duration) (string, error)
	Parse(tokenString string) (model.AuthClaims, error)
	Name() string
}
