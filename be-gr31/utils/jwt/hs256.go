package jwt

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"

	"prabogo/internal/model"
)

type appClaims struct {
	Email string `json:"email,omitempty"`
	Role  string `json:"role"`
	NISN  string `json:"nisn,omitempty"`
	jwt.RegisteredClaims
}

func GenerateTokenHS256(claims model.AuthClaims, secret string, ttl time.Duration) (string, error) {
	if secret == "" {
		return "", fmt.Errorf("jwt secret is empty")
	}
	if claims.ID == "" || claims.Role == "" {
		return "", fmt.Errorf("invalid claims")
	}

	now := time.Now()
	expiresAt := now.Add(ttl)
	tokenClaims := appClaims{
		Email: claims.Email,
		Role:  claims.Role,
		NISN:  claims.NISN,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   claims.ID,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(expiresAt),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, tokenClaims)
	signed, err := token.SignedString([]byte(secret))
	if err != nil {
		return "", err
	}
	return signed, nil
}

func ParseTokenHS256(tokenString string, secret string) (model.AuthClaims, error) {
	if secret == "" {
		return model.AuthClaims{}, fmt.Errorf("jwt secret is empty")
	}

	token, err := jwt.ParseWithClaims(tokenString, &appClaims{}, func(token *jwt.Token) (interface{}, error) {
		if token.Method != jwt.SigningMethodHS256 {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return []byte(secret), nil
	})
	if err != nil {
		return model.AuthClaims{}, err
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
