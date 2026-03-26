package fiber_inbound_adapter

import (
	"context"

	"github.com/gofiber/fiber/v2"
	"github.com/palantir/stacktrace"

	"prabogo/internal/domain"
	"prabogo/internal/model"
	inbound_port "prabogo/internal/port/inbound"
	"prabogo/utils/activity"
)

type kehadiranAdapter struct {
	domain domain.Domain
}

func NewKehadiranAdapter(domain domain.Domain) inbound_port.KehadiranHttpPort {
	return &kehadiranAdapter{domain: domain}
}

func (h *kehadiranAdapter) StudentUpsert(a any) error {
	c := a.(*fiber.Ctx)
	ctx := activity.NewContext("http_student_kehadiran_upsert")
	claims, ok := c.Locals("auth_claims").(model.AuthClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: "Unauthorized"})
	}

	var payload model.KehadiranInput
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: err.Error()})
	}
	ctx = context.WithValue(ctx, activity.Payload, payload)

	result, updated, err := h.domain.Kehadiran().StudentUpsert(ctx, claims, payload)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: stacktrace.RootCause(err).Error()})
	}

	if updated {
		return c.JSON(fiber.Map{
			"message": "Data kehadiran berhasil diperbarui",
			"data":    result,
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Data kehadiran berhasil disimpan",
		"data":    result,
	})
}

func (h *kehadiranAdapter) StudentGet(a any) error {
	c := a.(*fiber.Ctx)
	ctx := activity.NewContext("http_student_kehadiran_get")
	claims, ok := c.Locals("auth_claims").(model.AuthClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: "Unauthorized"})
	}

	result, err := h.domain.Kehadiran().StudentGet(ctx, claims, c.Query("tanggal"), c.Query("bulan"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: stacktrace.RootCause(err).Error()})
	}

	return c.JSON(result)
}

func (h *kehadiranAdapter) AdminGet(a any) error {
	c := a.(*fiber.Ctx)
	ctx := activity.NewContext("http_admin_kehadiran_get")
	_ = ctx

	filter := model.KehadiranFilter{
		Tanggal: c.Query("tanggal"),
		Dari:    c.Query("dari"),
		Sampai:  c.Query("sampai"),
		Kelas:   c.Query("kelas"),
		NISN:    c.Query("nisn"),
		Status:  c.Query("status"),
	}

	result, err := h.domain.Kehadiran().AdminGet(ctx, filter)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: stacktrace.RootCause(err).Error()})
	}

	return c.JSON(result)
}
