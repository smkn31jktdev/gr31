package fiber_inbound_adapter

import (
	"context"

	"github.com/gofiber/fiber/v2"

	inbound_port "prabogo/internal/port/inbound"
)

func InitRoute(
	ctx context.Context,
	app *fiber.App,
	port inbound_port.HttpPort,
) {
	app.Use(LoggingMiddleware())
	
	app.Static("/uploads", "./uploads")

	internal := app.Group("/internal")
	internal.Use(func(c *fiber.Ctx) error {
		return port.Middleware().InternalAuth(c)
	})
	internal.Post("/client-upsert", func(c *fiber.Ctx) error {
		return port.Client().Upsert(c)
	})
	internal.Post("/client-find", func(c *fiber.Ctx) error {
		return port.Client().Find(c)
	})
	internal.Delete("/client-delete", func(c *fiber.Ctx) error {
		return port.Client().Delete(c)
	})

	client := app.Group("/v1")
	// Public auth endpoints (no guard needed)
	client.Post("/student/login", func(c *fiber.Ctx) error {
		return port.Auth().StudentLogin(c)
	})
	client.Post("/admin/login", func(c *fiber.Ctx) error {
		return port.Auth().AdminLogin(c)
	})

	// -----------------------------------------------------------------
	// Student-protected routes (JWT guard: role = student)
	// -----------------------------------------------------------------
	student := client.Group("/student")
	student.Use(func(c *fiber.Ctx) error {
		return port.Middleware().StudentAuth(c)
	})
	student.Post("/me", func(c *fiber.Ctx) error {
		return port.Auth().StudentMe(c)
	})
	student.Post("/refresh-token", func(c *fiber.Ctx) error {
		return port.Auth().RefreshToken(c)
	})
	student.Post("/kehadiran", func(c *fiber.Ctx) error {
		return port.Kehadiran().StudentUpsert(c)
	})
	student.Get("/kehadiran", func(c *fiber.Ctx) error {
		return port.Kehadiran().StudentGet(c)
	})
	student.Post("/kegiatan", func(c *fiber.Ctx) error {
		return port.Sekolah().StudentUpsertKegiatan(c)
	})
	student.Put("/kegiatan", func(c *fiber.Ctx) error {
		return port.Sekolah().StudentUpdateKegiatan(c)
	})
	student.Get("/kegiatan", func(c *fiber.Ctx) error {
		return port.Sekolah().StudentGetKegiatan(c)
	})
	student.Delete("/kegiatan", func(c *fiber.Ctx) error {
		return port.Sekolah().StudentDeleteKegiatan(c)
	})
	student.Post("/bukti", func(c *fiber.Ctx) error {
		return port.Sekolah().StudentUpsertBukti(c)
	})
	student.Get("/bukti", func(c *fiber.Ctx) error {
		return port.Sekolah().StudentGetBukti(c)
	})
	student.Post("/aduan", func(c *fiber.Ctx) error {
		return port.Sekolah().StudentCreateOrReplyAduan(c)
	})
	student.Get("/aduan", func(c *fiber.Ctx) error {
		return port.Sekolah().StudentGetAduan(c)
	})

	// -----------------------------------------------------------------
	// Admin-protected routes (JWT guard: role = admin)
	// -----------------------------------------------------------------
	admin := client.Group("/admin")
	admin.Use(func(c *fiber.Ctx) error {
		return port.Middleware().AdminAuth(c)
	})
	admin.Post("/me", func(c *fiber.Ctx) error {
		return port.Auth().AdminMe(c)
	})
	admin.Post("/refresh-token", func(c *fiber.Ctx) error {
		return port.Auth().RefreshToken(c)
	})
	admin.Get("/kehadiran", func(c *fiber.Ctx) error {
		return port.Kehadiran().AdminGet(c)
	})
	admin.Post("/admins", func(c *fiber.Ctx) error {
		return port.Sekolah().CreateAdmin(c)
	})
	admin.Post("/tambah-admin/sheets", func(c *fiber.Ctx) error {
		return port.Sekolah().AdminLoadAdminsFromSheet(c)
	})
	admin.Post("/tambah-admin/bulk", func(c *fiber.Ctx) error {
		return port.Sekolah().AdminBulkCreateAdmins(c)
	})
	admin.Get("/admins", func(c *fiber.Ctx) error {
		return port.Sekolah().ListAdmins(c)
	})
	admin.Post("/students", func(c *fiber.Ctx) error {
		return port.Sekolah().CreateStudent(c)
	})
	admin.Post("/tambah-siswa/sheets", func(c *fiber.Ctx) error {
		return port.Sekolah().AdminLoadStudentsFromSheet(c)
	})
	admin.Post("/tambah-siswa/bulk", func(c *fiber.Ctx) error {
		return port.Sekolah().AdminBulkCreateStudents(c)
	})
	admin.Get("/students", func(c *fiber.Ctx) error {
		return port.Sekolah().ListStudents(c)
	})
	admin.Get("/kegiatan", func(c *fiber.Ctx) error {
		return port.Sekolah().AdminGetKegiatan(c)
	})
	admin.Get("/bukti", func(c *fiber.Ctx) error {
		return port.Sekolah().AdminGetBukti(c)
	})
	admin.Get("/delete", func(c *fiber.Ctx) error {
		return port.Sekolah().AdminGetDeleteMonths(c)
	})
	admin.Delete("/delete", func(c *fiber.Ctx) error {
		return port.Sekolah().AdminDeleteKegiatanByMonth(c)
	})
	admin.Get("/aduan", func(c *fiber.Ctx) error {
		return port.Sekolah().AdminGetAduan(c)
	})
	admin.Get("/aduan/room", func(c *fiber.Ctx) error {
		return port.Sekolah().AdminGetAduanRoom(c)
	})
	admin.Post("/aduan/status", func(c *fiber.Ctx) error {
		return port.Sekolah().AdminUpdateAduanStatus(c)
	})
	admin.Post("/aduan/respond", func(c *fiber.Ctx) error {
		return port.Sekolah().AdminReplyAduan(c)
	})
	admin.Put("/settings", func(c *fiber.Ctx) error {
		return port.Auth().UpdateAdminSettings(c)
	})
	admin.Post("/profile-photo", func(c *fiber.Ctx) error {
		return port.Auth().UploadAdminProfilePhoto(c)
	})
	admin.Delete("/profile-photo", func(c *fiber.Ctx) error {
		return port.Auth().DeleteAdminProfilePhoto(c)
	})

	client.Use(func(c *fiber.Ctx) error {
		return port.Middleware().ClientAuth(c)
	})
	client.Get("/ping", func(c *fiber.Ctx) error {
		return port.Ping().GetResource(c)
	})
}
