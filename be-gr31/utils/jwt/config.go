package jwt

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	Secret         string
	Issuer         string
	AccessTokenTTL time.Duration
	RefreshTTL     time.Duration
}

func LoadConfig() Config {
	secret := os.Getenv("JWT_SECRET")

	issuer := os.Getenv("JWT_ISSUER")
	if issuer == "" {
		issuer = "prabogo"
	}

	accessTTL := 24
	if v := os.Getenv("JWT_ACCESS_TTL_HOURS"); v != "" {
		if parsed, err := strconv.Atoi(v); err == nil && parsed > 0 {
			accessTTL = parsed
		}
	}

	refreshTTL := 168
	if v := os.Getenv("JWT_REFRESH_TTL_HOURS"); v != "" {
		if parsed, err := strconv.Atoi(v); err == nil && parsed > 0 {
			refreshTTL = parsed
		}
	}

	return Config{
		Secret:         secret,
		Issuer:         issuer,
		AccessTokenTTL: time.Duration(accessTTL) * time.Hour,
		RefreshTTL:     time.Duration(refreshTTL) * time.Hour,
	}
}
