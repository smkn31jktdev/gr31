package fiber_inbound_adapter

import (
	"context"
	"io"
	"net/textproto"

	"github.com/gofiber/fiber/v2"
	"github.com/palantir/stacktrace"

	"prabogo/internal/domain"
	"prabogo/internal/model"
	inbound_port "prabogo/internal/port/inbound"
	"prabogo/utils/activity"
)

type authAdapter struct {
	domain domain.Domain
}

func NewAuthAdapter(domain domain.Domain) inbound_port.AuthHttpPort {
	return &authAdapter{domain: domain}
}

func (h *authAdapter) StudentLogin(a any) error {
	c := a.(*fiber.Ctx)
	ctx := activity.NewContext("http_student_login")
	var payload model.StudentLoginInput
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: err.Error()})
	}
	ctx = context.WithValue(ctx, activity.Payload, payload)

	token, student, err := h.domain.Auth().StudentLogin(ctx, payload)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: stacktrace.RootCause(err).Error()})
	}

	return c.JSON(fiber.Map{
		"token":   token,
		"student": fiber.Map{"id": student.ID, "nisn": student.NISN, "nama": student.Nama},
	})
}

func (h *authAdapter) StudentMe(a any) error {
	c := a.(*fiber.Ctx)
	ctx := activity.NewContext("http_student_me")
	claims, ok := c.Locals("auth_claims").(model.AuthClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: "Unauthorized"})
	}
	ctx = context.WithValue(ctx, activity.Payload, claims)

	student, err := h.domain.Auth().StudentMe(ctx, claims.ID)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: stacktrace.RootCause(err).Error()})
	}

	return c.JSON(fiber.Map{
		"student": fiber.Map{
			"id":    student.ID,
			"nama":  student.Nama,
			"nisn":  student.NISN,
			"kelas": student.Kelas,
			"email": nullableString(student.Email),
		},
	})
}

func (h *authAdapter) AdminLogin(a any) error {
	c := a.(*fiber.Ctx)
	ctx := activity.NewContext("http_admin_login")
	var payload model.AdminLoginInput
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: err.Error()})
	}
	ctx = context.WithValue(ctx, activity.Payload, payload)

	token, admin, err := h.domain.Auth().AdminLogin(ctx, payload)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: stacktrace.RootCause(err).Error()})
	}

	return c.JSON(fiber.Map{
		"token": token,
		"admin": fiber.Map{"id": admin.ID, "nama": admin.Nama, "email": admin.Email},
	})
}

func (h *authAdapter) AdminMe(a any) error {
	c := a.(*fiber.Ctx)
	ctx := activity.NewContext("http_admin_me")
	claims, ok := c.Locals("auth_claims").(model.AuthClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: "Unauthorized"})
	}
	ctx = context.WithValue(ctx, activity.Payload, claims)

	admin, err := h.domain.Auth().AdminMe(ctx, claims.ID)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: stacktrace.RootCause(err).Error()})
	}

	return c.JSON(fiber.Map{
		"user": fiber.Map{
			"id":         admin.ID,
			"nama":       admin.Nama,
			"email":      admin.Email,
			"fotoProfil": nullableString(admin.FotoProfil),
		},
	})
}

// RefreshToken handles token refresh requests.
// The user must provide a valid (non-expired) token. A new access token is returned.
func (h *authAdapter) RefreshToken(a any) error {
	c := a.(*fiber.Ctx)
	ctx := activity.NewContext("http_refresh_token")
	claims, ok := c.Locals("auth_claims").(model.AuthClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: "Unauthorized"})
	}
	ctx = context.WithValue(ctx, activity.Payload, claims)

	newToken, err := h.domain.Auth().RefreshToken(ctx, claims)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(model.Response{
			Success: false,
			Error:   stacktrace.RootCause(err).Error(),
		})
	}

	return c.JSON(fiber.Map{
		"token": newToken,
	})
}

func nullableString(v string) any {
	if v == "" {
		return nil
	}
	return v
}

func (h *authAdapter) UpdateAdminSettings(a any) error {
	c := a.(*fiber.Ctx)
	ctx := activity.NewContext("http_update_admin_settings")

	claims, ok := c.Locals("auth_claims").(model.AuthClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: "Unauthorized"})
	}

	var payload model.UpdateAdminSettingsInput
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: err.Error()})
	}
	ctx = context.WithValue(ctx, activity.Payload, payload)

	admin, err := h.domain.Auth().UpdateAdminSettings(ctx, claims, payload)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: stacktrace.RootCause(err).Error()})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Pengaturan berhasil disimpan",
		"admin": fiber.Map{
			"id":         admin.ID,
			"nama":       admin.Nama,
			"email":      admin.Email,
			"fotoProfil": nullableString(admin.FotoProfil),
		},
	})
}

func (h *authAdapter) UploadAdminProfilePhoto(a any) error {
	c := a.(*fiber.Ctx)
	ctx := activity.NewContext("http_admin_profile_photo_upload")

	claims, ok := c.Locals("auth_claims").(model.AuthClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: "Unauthorized"})
	}

	fileHeader, err := c.FormFile("foto")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: "File foto harus diisi"})
	}

	file, err := fileHeader.Open()
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: "Gagal membaca file foto"})
	}
	defer file.Close()

	content, err := io.ReadAll(file)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: "Gagal membaca file foto"})
	}

	mimeType := fileHeader.Header.Get(textproto.CanonicalMIMEHeaderKey("Content-Type"))
	admin, err := h.domain.Auth().UploadAdminProfilePhoto(ctx, claims, mimeType, content)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: stacktrace.RootCause(err).Error()})
	}

	return c.JSON(fiber.Map{
		"message":    "Foto profil berhasil diperbarui",
		"fotoProfil": admin.FotoProfil,
	})
}

func (h *authAdapter) DeleteAdminProfilePhoto(a any) error {
	c := a.(*fiber.Ctx)
	ctx := activity.NewContext("http_admin_profile_photo_delete")

	claims, ok := c.Locals("auth_claims").(model.AuthClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: "Unauthorized"})
	}

	_, err := h.domain.Auth().DeleteAdminProfilePhoto(ctx, claims)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: stacktrace.RootCause(err).Error()})
	}

	return c.JSON(fiber.Map{
		"message": "Foto profil berhasil dihapus",
	})
}
