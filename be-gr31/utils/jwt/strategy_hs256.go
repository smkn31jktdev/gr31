package jwt

import (
	"fmt"
	"time"

	gojwt "github.com/golang-jwt/jwt/v5"

	"prabogo/internal/model"
)

type HS256Strategy struct {
	config Config
}

func NewHS256Strategy(cfg Config) *HS256Strategy {
	return &HS256Strategy{config: cfg}
}

func (s *HS256Strategy) Name() string {
	return "hs256"
}

func (s *HS256Strategy) Generate(claims model.AuthClaims, ttl time.Duration) (string, error) {
	if s.config.Secret == "" {
		return "", fmt.Errorf("jwt secret is empty")
	}
	if claims.ID == "" || claims.Role == "" {
		return "", fmt.Errorf("invalid claims: id and role are required")
	}

	now := time.Now()
	expiresAt := now.Add(ttl)
	tokenClaims := appClaims{
		Email: claims.Email,
		Role:  claims.Role,
		NISN:  claims.NISN,
		RegisteredClaims: gojwt.RegisteredClaims{
			Issuer:    s.config.Issuer,
			Subject:   claims.ID,
			IssuedAt:  gojwt.NewNumericDate(now),
			ExpiresAt: gojwt.NewNumericDate(expiresAt),
		},
	}

	token := gojwt.NewWithClaims(gojwt.SigningMethodHS256, tokenClaims)
	signed, err := token.SignedString([]byte(s.config.Secret))
	if err != nil {
		return "", fmt.Errorf("failed to sign token: %w", err)
	}
	return signed, nil
}

func (s *HS256Strategy) Parse(tokenString string) (model.AuthClaims, error) {
	if s.config.Secret == "" {
		return model.AuthClaims{}, fmt.Errorf("jwt secret is empty")
	}

	token, err := gojwt.ParseWithClaims(tokenString, &appClaims{}, func(token *gojwt.Token) (interface{}, error) {
		if token.Method != gojwt.SigningMethodHS256 {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(s.config.Secret), nil
	})
	if err != nil {
		return model.AuthClaims{}, fmt.Errorf("token validation failed: %w", err)
	}

	claims, ok := token.Claims.(*appClaims)
	if !ok || !token.Valid {
		return model.AuthClaims{}, fmt.Errorf("invalid token")
	}

	var exp int64
	if claims.ExpiresAt != nil {
		exp = claims.ExpiresAt.Time.Unix()
	}

	return model.AuthClaims{
		ID:    claims.Subject,
		Email: claims.Email,
		Role:  claims.Role,
		NISN:  claims.NISN,
		Exp:   exp,
	}, nil
}
