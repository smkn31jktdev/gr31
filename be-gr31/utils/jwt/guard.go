package jwt

import (
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"

	"prabogo/internal/model"
)

type GuardConfig struct {
	Strategy Strategy
	AllowedRoles []string
	TokenLookup string
	TokenPrefix string
	ContextKey string
}

func DefaultGuardConfig(strategy Strategy) GuardConfig {
	return GuardConfig{
		Strategy:    strategy,
		TokenLookup: "header:Authorization",
		TokenPrefix: "Bearer ",
		ContextKey:  "auth_claims",
	}
}

func AuthGuard(config GuardConfig) fiber.Handler {

	if config.TokenLookup == "" {
		config.TokenLookup = "header:Authorization"
	}
	if config.TokenPrefix == "" {
		config.TokenPrefix = "Bearer "
	}
	if config.ContextKey == "" {
		config.ContextKey = "auth_claims"
	}

	return func(c *fiber.Ctx) error {
		token, err := extractToken(c, config.TokenLookup, config.TokenPrefix)
		if err != nil || token == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(model.Response{
				Success: false,
				Error:   "Token tidak ditemukan",
			})
		}

		claims, err := config.Strategy.Parse(token)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(model.Response{
				Success: false,
				Error:   "Token tidak valid",
			})
		}

		if claims.Exp > 0 && time.Now().Unix() > claims.Exp {
			return c.Status(fiber.StatusUnauthorized).JSON(model.Response{
				Success: false,
				Error:   "Token sudah kadaluarsa",
			})
		}

		if len(config.AllowedRoles) > 0 {
			roleAllowed := false
			for _, role := range config.AllowedRoles {
				if strings.EqualFold(claims.Role, role) {
					roleAllowed = true
					break
				}
			}
			if !roleAllowed {
				return c.Status(fiber.StatusForbidden).JSON(model.Response{
					Success: false,
					Error:   "Akses ditolak: role tidak diizinkan",
				})
			}
		}

		c.Locals(config.ContextKey, claims)

		return c.Next()
	}
}

func extractToken(c *fiber.Ctx, lookup, prefix string) (string, error) {
	parts := strings.SplitN(lookup, ":", 2)
	if len(parts) != 2 {
		return "", fiber.NewError(fiber.StatusUnauthorized, "invalid token lookup format")
	}

	source, name := parts[0], parts[1]

	switch source {
	case "header":
		value := c.Get(name)
		if value == "" {
			return "", nil
		}
		if prefix != "" && strings.HasPrefix(value, prefix) {
			return value[len(prefix):], nil
		}
		return value, nil

	case "query":
		return c.Query(name), nil

	case "cookie":
		return c.Cookies(name), nil

	default:
		return "", fiber.NewError(fiber.StatusUnauthorized, "unsupported token source: "+source)
	}
}

func GetClaims(c *fiber.Ctx, contextKey ...string) (model.AuthClaims, bool) {
	key := "auth_claims"
	if len(contextKey) > 0 && contextKey[0] != "" {
		key = contextKey[0]
	}
	claims, ok := c.Locals(key).(model.AuthClaims)
	return claims, ok
}
