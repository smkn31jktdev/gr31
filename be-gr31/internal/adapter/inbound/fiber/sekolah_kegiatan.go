package fiber_inbound_adapter

import (
	"context"

	"github.com/gofiber/fiber/v2"
	"github.com/palantir/stacktrace"

	"prabogo/internal/model"
	"prabogo/utils/activity"
)

func (h *sekolahAdapter) StudentUpsertKegiatan(a any) error {
	c := a.(*fiber.Ctx)
	ctx := activity.NewContext("http_student_kegiatan_upsert")
	claims, ok := c.Locals("auth_claims").(model.AuthClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: "Unauthorized"})
	}

	var payload model.KegiatanInput
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: err.Error()})
	}
	ctx = context.WithValue(ctx, activity.Payload, payload)

	result, updated, err := h.domain.Sekolah().StudentUpsertKegiatan(ctx, claims, payload)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: stacktrace.RootCause(err).Error()})
	}

	message := "Data kegiatan berhasil disimpan"
	if updated {
		message = "Data kegiatan berhasil diperbarui"
	}
	return c.JSON(fiber.Map{"message": message, "data": result})
}

func (h *sekolahAdapter) StudentUpdateKegiatan(a any) error {
	c := a.(*fiber.Ctx)
	ctx := activity.NewContext("http_student_kegiatan_update")
	claims, ok := c.Locals("auth_claims").(model.AuthClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: "Unauthorized"})
	}

	var payload model.KegiatanInput
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: err.Error()})
	}
	ctx = context.WithValue(ctx, activity.Payload, payload)

	result, err := h.domain.Sekolah().StudentUpdateKegiatan(ctx, claims, payload)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: stacktrace.RootCause(err).Error()})
	}

	return c.JSON(fiber.Map{"message": "Data kegiatan berhasil diperbarui", "data": result})
}

func (h *sekolahAdapter) StudentGetKegiatan(a any) error {
	c := a.(*fiber.Ctx)
	ctx := activity.NewContext("http_student_kegiatan_get")
	claims, ok := c.Locals("auth_claims").(model.AuthClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: "Unauthorized"})
	}

	result, err := h.domain.Sekolah().StudentGetKegiatan(ctx, claims, c.Query("tanggal"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: stacktrace.RootCause(err).Error()})
	}

	return c.JSON(fiber.Map{"kegiatan": result})
}

func (h *sekolahAdapter) StudentDeleteKegiatan(a any) error {
	c := a.(*fiber.Ctx)
	ctx := activity.NewContext("http_student_kegiatan_delete")
	claims, ok := c.Locals("auth_claims").(model.AuthClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: "Unauthorized"})
	}

	tanggal := c.Query("tanggal")
	section := c.Query("section")
	ctx = context.WithValue(ctx, activity.Payload, map[string]string{"tanggal": tanggal, "section": section})

	err := h.domain.Sekolah().StudentDeleteKegiatan(ctx, claims, tanggal, section)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: stacktrace.RootCause(err).Error()})
	}

	message := "Data kegiatan berhasil dihapus"
	if section != "" {
		message = "Section kegiatan berhasil dihapus"
	}

	return c.JSON(fiber.Map{"message": message})
}

func (h *sekolahAdapter) AdminGetKegiatan(a any) error {
	c := a.(*fiber.Ctx)
	ctx := activity.NewContext("http_admin_kegiatan_get")
	claims, ok := c.Locals("auth_claims").(model.AuthClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: "Unauthorized"})
	}

	result, err := h.domain.Sekolah().AdminGetKegiatan(ctx, claims, model.KegiatanFilter{
		NISN:    c.Query("nisn"),
		Kelas:   c.Query("kelas"),
		Tanggal: c.Query("tanggal"),
		Dari:    c.Query("dari"),
		Sampai:  c.Query("sampai"),
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: stacktrace.RootCause(err).Error()})
	}

	return c.JSON(result)
}

func (h *sekolahAdapter) AdminGetBukti(a any) error {
	c := a.(*fiber.Ctx)
	ctx := activity.NewContext("http_admin_bukti_get")
	claims, ok := c.Locals("auth_claims").(model.AuthClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: "Unauthorized"})
	}

	result, err := h.domain.Sekolah().AdminGetBukti(ctx, claims, model.BuktiFilter{
		NISN:  c.Query("nisn"),
		Kelas: c.Query("kelas"),
		Bulan: c.Query("month"),
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: stacktrace.RootCause(err).Error()})
	}

	return c.JSON(result)
}

func (h *sekolahAdapter) AdminGetDeleteMonths(a any) error {
	c := a.(*fiber.Ctx)
	ctx := activity.NewContext("http_admin_delete_months_get")
	claims, ok := c.Locals("auth_claims").(model.AuthClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: "Unauthorized"})
	}

	months, err := h.domain.Sekolah().AdminGetDeleteMonths(ctx, claims, c.Query("nisn"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: stacktrace.RootCause(err).Error()})
	}

	return c.JSON(fiber.Map{"months": months, "total": len(months)})
}

func (h *sekolahAdapter) AdminDeleteKegiatanByMonth(a any) error {
	c := a.(*fiber.Ctx)
	ctx := activity.NewContext("http_admin_delete_kegiatan_by_month")
	claims, ok := c.Locals("auth_claims").(model.AuthClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: "Unauthorized"})
	}

	var payload struct {
		NISN  string `json:"nisn"`
		Month string `json:"month"`
	}
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: err.Error()})
	}

	deletedCount, err := h.domain.Sekolah().AdminDeleteKegiatanByMonth(ctx, claims, payload.NISN, payload.Month)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: stacktrace.RootCause(err).Error()})
	}

	return c.JSON(fiber.Map{
		"message":      "Data kegiatan berhasil dihapus",
		"deletedCount": deletedCount,
	})
}
