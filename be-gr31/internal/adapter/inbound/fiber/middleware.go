package fiber_inbound_adapter

import (
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"

	"prabogo/internal/domain"
	"prabogo/internal/model"
	"prabogo/utils/activity"
	"prabogo/utils/jwt"
)

const (
	authorizationHeader = "Authorization"
	bearerPrefix        = "Bearer "
	bearerPrefixLen     = 7
)

var jwtStrategy jwt.Strategy

func getJWTStrategy() jwt.Strategy {
	if jwtStrategy == nil {
		cfg := jwt.LoadConfig()
		jwtStrategy = jwt.NewHS256Strategy(cfg)
	}
	return jwtStrategy
}

func LoggingMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		start := time.Now()
		
		err := c.Next()
		
		duration := time.Since(start)
		statusCode := c.Response().StatusCode()
		
		endpointName := getEndpointName(c.Method(), c.Path())
		
		statusColor := getStatusColor(statusCode)
		resetColor := "\033[0m"
		
		fmt.Printf("%s%d%s %s (%dms)\n", 
			statusColor, 
			statusCode, 
			resetColor, 
			endpointName, 
			duration.Milliseconds())
		
		return err
	}
}

func getStatusColor(statusCode int) string {
	switch {
	case statusCode >= 500:
		return "\033[31m" // Red
	case statusCode >= 400:
		return "\033[33m" // Yellow
	case statusCode >= 300:
		return "\033[36m" // Cyan
	case statusCode >= 200:
		return "\033[32m" // Green
	default:
		return "\033[37m" // White
	}
}

func getEndpointName(method, path string) string {
	pathMap := map[string]string{
		"POST /v1/admin/login":                    "Admin Login",
		"POST /v1/admin/me":                       "Admin Me",
		"POST /v1/admin/refresh-token":            "Admin Refresh Token",
		"POST /v1/student/login":                  "Student Login",
		"POST /v1/student/me":                     "Student Me",
		"POST /v1/student/refresh-token":          "Student Refresh Token",
		"POST /v1/student/kehadiran":              "Student Upsert Kehadiran",
		"GET /v1/student/kehadiran":               "Student Get Kehadiran",
		"POST /v1/student/kegiatan":               "Student Create Kegiatan",
		"PUT /v1/student/kegiatan":                "Student Update Kegiatan",
		"GET /v1/student/kegiatan":                "Student Get Kegiatan",
		"DELETE /v1/student/kegiatan":             "Student Delete Kegiatan",
		"POST /v1/student/bukti":                  "Student Upsert Bukti",
		"GET /v1/student/bukti":                   "Student Get Bukti",
		"POST /v1/student/aduan":                  "Student Create Aduan",
		"GET /v1/student/aduan":                   "Student Get Aduan",
		"GET /v1/admin/kehadiran":                 "Admin Get Kehadiran",
		"POST /v1/admin/admins":                   "Admin Create Admin",
		"POST /v1/admin/tambah-admin/sheets":      "Admin Load Admins From Sheet",
		"POST /v1/admin/tambah-admin/bulk":        "Admin Bulk Create Admins",
		"GET /v1/admin/admins":                    "Admin List Admins",
		"POST /v1/admin/students":                 "Admin Create Student",
		"POST /v1/admin/tambah-siswa/sheets":      "Admin Load Students From Sheet",
		"POST /v1/admin/tambah-siswa/bulk":        "Admin Bulk Create Students",
		"GET /v1/admin/students":                  "Admin List Students",
		"GET /v1/admin/kegiatan":                  "Admin Get Kegiatan",
		"GET /v1/admin/bukti":                     "Admin Get Bukti",
		"GET /v1/admin/delete":                    "Admin Get Delete Months",
		"DELETE /v1/admin/delete":                 "Admin Delete Kegiatan By Month",
		"GET /v1/admin/aduan":                     "Admin Get Aduan",
		"GET /v1/admin/aduan/room":                "Admin Get Aduan Room",
		"POST /v1/admin/aduan/status":             "Admin Update Aduan Status",
		"POST /v1/admin/aduan/respond":            "Admin Reply Aduan",
		"PUT /v1/admin/settings":                  "Admin Update Settings",
		"POST /v1/admin/profile-photo":            "Admin Upload Profile Photo",
		"DELETE /v1/admin/profile-photo":          "Admin Delete Profile Photo",
		"GET /v1/ping":                            "Ping",
		"POST /internal/client-upsert":            "Internal Client Upsert",
		"POST /internal/client-find":              "Internal Client Find",
		"DELETE /internal/client-delete":          "Internal Client Delete",
	}
	
	key := method + " " + path
	if name, exists := pathMap[key]; exists {
		return name
	}
	
	return method + " " + path
}

func StudentGuard() fiber.Handler {
	return jwt.AuthGuard(jwt.GuardConfig{
		Strategy:     getJWTStrategy(),
		AllowedRoles: []string{"student"},
	})
}

func AdminGuard() fiber.Handler {
	return jwt.AuthGuard(jwt.GuardConfig{
		Strategy:     getJWTStrategy(),
		AllowedRoles: []string{"admin"},
	})
}

func AuthenticatedGuard() fiber.Handler {
	return jwt.AuthGuard(jwt.DefaultGuardConfig(getJWTStrategy()))
}

type MiddlewareAdapter interface {
	InternalAuth(a any) error
	ClientAuth(a any) error
	StudentAuth(a any) error
	AdminAuth(a any) error
}

type middlewareAdapter struct {
	domain domain.Domain
}

func NewMiddlewareAdapter(
	domain domain.Domain,
) MiddlewareAdapter {
	return &middlewareAdapter{
		domain: domain,
	}
}

func (h *middlewareAdapter) InternalAuth(a any) error {
	c := a.(*fiber.Ctx)
	authHeader := c.Get(authorizationHeader)
	var bearerToken string
	if len(authHeader) > bearerPrefixLen && authHeader[:bearerPrefixLen] == bearerPrefix {
		bearerToken = authHeader[bearerPrefixLen:]
	}

	if bearerToken == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	if bearerToken != os.Getenv("INTERNAL_KEY") {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	return c.Next()
}

func (h *middlewareAdapter) ClientAuth(a any) error {
	c := a.(*fiber.Ctx)
	ctx := activity.NewContext("http_client_auth")
	authHeader := c.Get(authorizationHeader)
	var bearerToken string
	if len(authHeader) > bearerPrefixLen && authHeader[:bearerPrefixLen] == bearerPrefix {
		bearerToken = authHeader[bearerPrefixLen:]
	}

	if bearerToken == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{
			Success: false,
			Error:   "Unauthorized",
		})
	}

	authDriver := os.Getenv("AUTH_DRIVER")
	if authDriver == "jwt" {
		jwksURL := os.Getenv("AUTH_JWKS_URL")

		_, err := jwt.ValidateJWTWithURL(bearerToken, jwksURL)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(model.Response{
				Success: false,
				Error:   "Unauthorized: " + err.Error(),
			})
		}
	} else {
		exists, err := h.domain.Client().IsExists(ctx, bearerToken)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(model.Response{
				Success: false,
				Error:   err.Error(),
			})
		}

		if !exists {
			return c.Status(fiber.StatusUnauthorized).JSON(model.Response{
				Success: false,
				Error:   "Unauthorized",
			})
		}
	}

	return c.Next()
}

func (h *middlewareAdapter) StudentAuth(a any) error {
	c := a.(*fiber.Ctx)
	strategy := getJWTStrategy()

	claims, err := extractAndValidate(c, strategy)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: err.Error()})
	}

	if claims.Role != "student" {
		return c.Status(fiber.StatusForbidden).JSON(model.Response{Success: false, Error: "Akses ditolak"})
	}

	c.Locals("auth_claims", claims)
	return c.Next()
}

func (h *middlewareAdapter) AdminAuth(a any) error {
	c := a.(*fiber.Ctx)
	strategy := getJWTStrategy()

	claims, err := extractAndValidate(c, strategy)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: err.Error()})
	}

	if !strings.EqualFold(claims.Role, "admin") && !strings.EqualFold(claims.Role, "super_admin") {
		return c.Status(fiber.StatusForbidden).JSON(model.Response{Success: false, Error: "Akses ditolak"})
	}

	c.Locals("auth_claims", claims)
	return c.Next()
}

func extractAndValidate(c *fiber.Ctx, strategy jwt.Strategy) (model.AuthClaims, error) {
	authHeader := c.Get(authorizationHeader)
	if len(authHeader) <= bearerPrefixLen || authHeader[:bearerPrefixLen] != bearerPrefix {
		return model.AuthClaims{}, fiber.NewError(fiber.StatusUnauthorized, "Token tidak ditemukan")
	}

	bearerToken := authHeader[bearerPrefixLen:]
	claims, err := strategy.Parse(bearerToken)
	if err != nil {
		return model.AuthClaims{}, fiber.NewError(fiber.StatusUnauthorized, "Token tidak valid")
	}

	return claims, nil
}
