package fiber_inbound_adapter

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/palantir/stacktrace"

	"prabogo/internal/model"
	"prabogo/utils/activity"
)

var allowedBuktiContentTypes = map[string]string{
	"image/jpeg": "jpg",
	"image/png":  "png",
	"image/webp": "webp",
}

const maxBuktiFileSize = 5 * 1024 * 1024

func (h *sekolahAdapter) CreateStudent(a any) error {
	c := a.(*fiber.Ctx)
	ctx := activity.NewContext("http_admin_create_student")
	claims, ok := c.Locals("auth_claims").(model.AuthClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: "Unauthorized"})
	}

	var payload model.CreateStudentInput
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: err.Error()})
	}
	ctx = context.WithValue(ctx, activity.Payload, payload)

	student, err := h.domain.Sekolah().CreateStudent(ctx, claims, payload)
	if err != nil {
		code := fiber.StatusBadRequest
		errMsg := stacktrace.RootCause(err).Error()
		if strings.Contains(strings.ToLower(errMsg), "unauthorized") {
			code = fiber.StatusUnauthorized
		}
		return c.Status(code).JSON(model.Response{Success: false, Error: errMsg})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Siswa berhasil ditambahkan",
		"student": fiber.Map{"id": student.ID, "nisn": student.NISN, "nama": student.Nama, "kelas": student.Kelas, "walas": student.Walas},
	})
}

func (h *sekolahAdapter) AdminLoadStudentsFromSheet(a any) error {
	c := a.(*fiber.Ctx)
	ctx := activity.NewContext("http_admin_load_students_from_sheet")
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

	values, err := h.domain.Sekolah().AdminLoadStudentsFromSheet(ctx, claims, payload.SheetID, payload.Range)
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

func (h *sekolahAdapter) AdminBulkCreateStudents(a any) error {
	c := a.(*fiber.Ctx)
	ctx := activity.NewContext("http_admin_bulk_create_students")
	claims, ok := c.Locals("auth_claims").(model.AuthClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: "Unauthorized"})
	}

	var payload struct {
		Students []model.CreateStudentInput `json:"students"`
	}
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: err.Error()})
	}

	result, err := h.domain.Sekolah().AdminBulkCreateStudents(ctx, claims, payload.Students)
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

func (h *sekolahAdapter) StudentCreateOrReplyAduan(a any) error {
	c := a.(*fiber.Ctx)
	ctx := activity.NewContext("http_student_aduan_post")
	claims, ok := c.Locals("auth_claims").(model.AuthClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: "Unauthorized"})
	}

	var payload model.AduanInput
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: err.Error()})
	}

	aduan, isReply, err := h.domain.Sekolah().StudentCreateOrReplyAduan(ctx, claims, payload)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: stacktrace.RootCause(err).Error()})
	}

	if isReply {
		return c.JSON(fiber.Map{"success": true, "message": "Pesan aduan berhasil ditambahkan", "aduan": aduan})
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "aduan": aduan})
}

func (h *sekolahAdapter) StudentGetAduan(a any) error {
	c := a.(*fiber.Ctx)
	ctx := activity.NewContext("http_student_aduan_get")
	claims, ok := c.Locals("auth_claims").(model.AuthClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: "Unauthorized"})
	}

	items, err := h.domain.Sekolah().StudentGetAduan(ctx, claims)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: stacktrace.RootCause(err).Error()})
	}

	return c.JSON(fiber.Map{"aduan": items, "total": len(items)})
}

func (h *sekolahAdapter) StudentGetBukti(a any) error {
	c := a.(*fiber.Ctx)
	ctx := activity.NewContext("http_student_bukti_get")
	claims, ok := c.Locals("auth_claims").(model.AuthClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: "Unauthorized"})
	}

	month := c.Query("month")
	if month == "" {
		month = c.Query("bulan")
	}

	result, err := h.domain.Sekolah().StudentGetBukti(ctx, claims, month)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: stacktrace.RootCause(err).Error()})
	}

	return c.JSON(result)
}

func (h *sekolahAdapter) StudentUpsertBukti(a any) error {
	c := a.(*fiber.Ctx)
	ctx := activity.NewContext("http_student_bukti_upsert")
	claims, ok := c.Locals("auth_claims").(model.AuthClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(model.Response{Success: false, Error: "Unauthorized"})
	}

	fileHeader, err := c.FormFile("foto")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: "File foto harus diisi"})
	}

	if fileHeader.Size > maxBuktiFileSize {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: "Ukuran file maksimal 5MB"})
	}

	ext, ok := allowedBuktiContentTypes[fileHeader.Header.Get("Content-Type")]
	if !ok {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: "File harus berupa gambar JPG, PNG, atau WebP"})
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

	if len(content) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: "File foto harus diisi"})
	}

	if err := os.MkdirAll("uploads/bukti", 0o755); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(model.Response{Success: false, Error: "Gagal menyiapkan folder upload"})
	}

	fileName := fmt.Sprintf("bukti_%s_%d.%s", claims.NISN, time.Now().UnixMilli(), ext)
	storedPath := filepath.Join("uploads", "bukti", fileName)
	if err := os.WriteFile(storedPath, content, 0o644); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(model.Response{Success: false, Error: "Gagal menyimpan foto bukti"})
	}

	fotoPath := "/uploads/bukti/" + fileName
	result, err := h.domain.Sekolah().StudentUpsertBukti(ctx, claims, fotoPath, c.FormValue("linkYouTube"))
	if err != nil {
		_ = os.Remove(storedPath)
		return c.Status(fiber.StatusBadRequest).JSON(model.Response{Success: false, Error: stacktrace.RootCause(err).Error()})
	}

	return c.JSON(fiber.Map{
		"message": "Bukti berhasil disimpan",
		"bukti":   result,
	})
}
