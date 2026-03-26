package fiber_inbound_adapter

import (
	"github.com/gofiber/fiber/v2"
	"github.com/palantir/stacktrace"

	"prabogo/internal/model"
	"prabogo/utils/activity"
)

func (h *sekolahAdapter) AdminGetAduan(a any) error {
	c := a.(*fiber.Ctx)
	ctx := activity.NewContext("http_admin_aduan_get")
	claims, ok := c.Locals("auth_claims").(model.AuthClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: "Unauthorized"})
	}

	items, meta, err := h.domain.Sekolah().AdminGetAduan(ctx, claims, model.AduanFilter{
		TicketID: c.Query("ticketId"),
		NISN:     c.Query("nisn"),
		Kelas:    c.Query("kelas"),
		Status:   c.Query("status"),
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: stacktrace.RootCause(err).Error()})
	}

	return c.JSON(fiber.Map{
		"aduan":        items,
		"total":        len(items),
		"adminNama":    meta.AdminNama,
		"isSuperAdmin": meta.IsSuperAdmin,
		"isGuruWali":   meta.IsGuruWali,
	})
}

func (h *sekolahAdapter) AdminGetAduanRoom(a any) error {
	c := a.(*fiber.Ctx)
	ctx := activity.NewContext("http_admin_aduan_room_get")
	claims, ok := c.Locals("auth_claims").(model.AuthClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: "Unauthorized"})
	}

	room, meta, err := h.domain.Sekolah().AdminGetAduanRoom(ctx, claims, c.Query("ticketId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: stacktrace.RootCause(err).Error()})
	}

	return c.JSON(fiber.Map{
		"aduan":        room,
		"adminNama":    meta.AdminNama,
		"isSuperAdmin": meta.IsSuperAdmin,
		"isGuruWali":   meta.IsGuruWali,
	})
}

func (h *sekolahAdapter) AdminUpdateAduanStatus(a any) error {
	c := a.(*fiber.Ctx)
	ctx := activity.NewContext("http_admin_aduan_status")
	claims, ok := c.Locals("auth_claims").(model.AuthClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: "Unauthorized"})
	}

	var payload struct {
		TicketID string `json:"ticketId"`
		Action   string `json:"action"`
		Note     string `json:"note"`
	}
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: err.Error()})
	}

	result, err := h.domain.Sekolah().AdminUpdateAduanStatus(ctx, claims, payload.TicketID, payload.Action, payload.Note)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: stacktrace.RootCause(err).Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Status aduan berhasil diperbarui", "aduan": result})
}

func (h *sekolahAdapter) AdminReplyAduan(a any) error {
	c := a.(*fiber.Ctx)
	ctx := activity.NewContext("http_admin_aduan_reply")
	claims, ok := c.Locals("auth_claims").(model.AuthClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: "Unauthorized"})
	}

	var payload struct {
		TicketID string `json:"ticketId"`
		Message  string `json:"message"`
	}
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: err.Error()})
	}

	result, err := h.domain.Sekolah().AdminReplyAduan(ctx, claims, payload.TicketID, payload.Message)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: stacktrace.RootCause(err).Error()})
	}
	return c.JSON(fiber.Map{"message": "Balasan aduan berhasil dikirim", "aduan": result})
}
