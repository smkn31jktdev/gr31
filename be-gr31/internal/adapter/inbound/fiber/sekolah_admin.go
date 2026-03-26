package fiber_inbound_adapter

import (
	"context"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/palantir/stacktrace"

	"prabogo/internal/model"
	"prabogo/utils/activity"
)

func (h *sekolahAdapter) CreateAdmin(a any) error {
	c := a.(*fiber.Ctx)
	ctx := activity.NewContext("http_admin_create_admin")
	claims, ok := c.Locals("auth_claims").(model.AuthClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: "Unauthorized"})
	}

	var payload model.CreateAdminInput
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: err.Error()})
	}
	ctx = context.WithValue(ctx, activity.Payload, payload)

	admin, err := h.domain.Sekolah().CreateAdmin(ctx, claims, payload)
	if err != nil {
		code := fiber.StatusBadRequest
		errMsg := stacktrace.RootCause(err).Error()
		if strings.Contains(strings.ToLower(errMsg), "unauthorized") {
			code = fiber.StatusUnauthorized
		}
		if strings.Contains(strings.ToLower(errMsg), "forbidden") {
			code = fiber.StatusForbidden
		}
		return c.Status(code).JSON(model.Response{Success: false, Error: errMsg})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Admin berhasil didaftarkan",
		"admin":   fiber.Map{"id": admin.ID, "nama": admin.Nama, "email": admin.Email, "role": admin.Role},
	})
}

func (h *sekolahAdapter) AdminLoadAdminsFromSheet(a any) error {
	c := a.(*fiber.Ctx)
	ctx := activity.NewContext("http_admin_load_admins_from_sheet")
	claims, ok := c.Locals("auth_claims").(model.AuthClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: "Unauthorized"})
	}

	var payload struct {
		SheetID string `json:"sheetId"`
		Range   string `json:"range"`
	}
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: err.Error()})
	}

	values, err := h.domain.Sekolah().AdminLoadAdminsFromSheet(ctx, claims, payload.SheetID, payload.Range)
	if err != nil {
		code := fiber.StatusBadRequest
		errMsg := stacktrace.RootCause(err).Error()
		if strings.Contains(strings.ToLower(errMsg), "forbidden") {
			code = fiber.StatusForbidden
		}
		if strings.Contains(strings.ToLower(errMsg), "unauthorized") {
			code = fiber.StatusUnauthorized
		}
		return c.Status(code).JSON(model.Response{Success: false, Error: errMsg})
	}

	return c.JSON(fiber.Map{"values": values})
}

func (h *sekolahAdapter) AdminBulkCreateAdmins(a any) error {
	c := a.(*fiber.Ctx)
	ctx := activity.NewContext("http_admin_bulk_create_admins")
	claims, ok := c.Locals("auth_claims").(model.AuthClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: "Unauthorized"})
	}

	var payload struct {
		Admins []model.CreateAdminInput `json:"admins"`
	}
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: err.Error()})
	}

	result, err := h.domain.Sekolah().AdminBulkCreateAdmins(ctx, claims, payload.Admins)
	if err != nil {
		code := fiber.StatusBadRequest
		errMsg := stacktrace.RootCause(err).Error()
		if strings.Contains(strings.ToLower(errMsg), "forbidden") {
			code = fiber.StatusForbidden
		}
		if strings.Contains(strings.ToLower(errMsg), "unauthorized") {
			code = fiber.StatusUnauthorized
		}
		return c.Status(code).JSON(model.Response{Success: false, Error: errMsg})
	}

	return c.JSON(result)
}

func (h *sekolahAdapter) ListAdmins(a any) error {
	c := a.(*fiber.Ctx)
	ctx := activity.NewContext("http_admin_list_admins")
	claims, ok := c.Locals("auth_claims").(model.AuthClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: "Unauthorized"})
	}

	items, err := h.domain.Sekolah().ListAdmins(ctx, claims, model.AdminFilter{Email: c.Query("email"), Role: c.Query("role")})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: stacktrace.RootCause(err).Error()})
	}

	return c.JSON(fiber.Map{"data": items, "total": len(items)})
}

func (h *sekolahAdapter) ListStudents(a any) error {
	c := a.(*fiber.Ctx)
	ctx := activity.NewContext("http_admin_list_students")
	claims, ok := c.Locals("auth_claims").(model.AuthClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: "Unauthorized"})
	}

	items, err := h.domain.Sekolah().ListStudents(ctx, claims, model.StudentFilter{NISN: c.Query("nisn"), Kelas: c.Query("kelas")})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: stacktrace.RootCause(err).Error()})
	}

	return c.JSON(fiber.Map{"data": items, "total": len(items)})
}
