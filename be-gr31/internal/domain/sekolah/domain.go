package sekolah

import (
	"context"
	"os"
	"strings"

	"github.com/palantir/stacktrace"

	"prabogo/internal/model"
	outbound_port "prabogo/internal/port/outbound"
)

type SekolahDomain interface {
	CreateAdmin(ctx context.Context, claims model.AuthClaims, input model.CreateAdminInput) (model.Admin, error)
	AdminLoadAdminsFromSheet(ctx context.Context, claims model.AuthClaims, sheetID string, sheetRange string) ([][]string, error)
	AdminBulkCreateAdmins(ctx context.Context, claims model.AuthClaims, inputs []model.CreateAdminInput) (map[string]any, error)
	CreateStudent(ctx context.Context, claims model.AuthClaims, input model.CreateStudentInput) (model.Student, error)
	AdminLoadStudentsFromSheet(ctx context.Context, claims model.AuthClaims, sheetID string, sheetRange string) ([][]string, error)
	AdminBulkCreateStudents(ctx context.Context, claims model.AuthClaims, inputs []model.CreateStudentInput) (map[string]any, error)
	ListAdmins(ctx context.Context, claims model.AuthClaims, filter model.AdminFilter) ([]model.Admin, error)
	ListStudents(ctx context.Context, claims model.AuthClaims, filter model.StudentFilter) ([]model.Student, error)

	StudentUpsertKegiatan(ctx context.Context, claims model.AuthClaims, input model.KegiatanInput) (map[string]any, bool, error)
	StudentUpdateKegiatan(ctx context.Context, claims model.AuthClaims, input model.KegiatanInput) (map[string]any, error)
	StudentGetKegiatan(ctx context.Context, claims model.AuthClaims, tanggal string) (map[string]any, error)
	StudentDeleteKegiatan(ctx context.Context, claims model.AuthClaims, tanggal string, section string) error
	StudentUpsertBukti(ctx context.Context, claims model.AuthClaims, foto string, linkYouTube string) (map[string]any, error)
	StudentGetBukti(ctx context.Context, claims model.AuthClaims, bulan string) (map[string]any, error)
	AdminGetKegiatan(ctx context.Context, claims model.AuthClaims, filter model.KegiatanFilter) (map[string]any, error)
	AdminGetBukti(ctx context.Context, claims model.AuthClaims, filter model.BuktiFilter) (map[string]any, error)
	AdminGetDeleteMonths(ctx context.Context, claims model.AuthClaims, nisn string) ([]map[string]any, error)
	AdminDeleteKegiatanByMonth(ctx context.Context, claims model.AuthClaims, nisn string, bulan string) (int, error)

	StudentCreateOrReplyAduan(ctx context.Context, claims model.AuthClaims, input model.AduanInput) (model.Aduan, bool, error)
	StudentGetAduan(ctx context.Context, claims model.AuthClaims) ([]model.Aduan, error)
	AdminGetAduan(ctx context.Context, claims model.AuthClaims, filter model.AduanFilter) ([]model.Aduan, model.AdminAduanMeta, error)
	AdminGetAduanRoom(ctx context.Context, claims model.AuthClaims, ticketID string) (model.Aduan, model.AdminAduanMeta, error)
	AdminUpdateAduanStatus(ctx context.Context, claims model.AuthClaims, ticketID string, action string, note string) (model.Aduan, error)
	AdminReplyAduan(ctx context.Context, claims model.AuthClaims, ticketID string, message string) (model.Aduan, error)
}

type sekolahDomain struct {
	databasePort outbound_port.DatabasePort
}

func getSuperAdminEmails() []string {
	raw := strings.TrimSpace(os.Getenv("SUPER_ADMIN_EMAILS"))
	if raw == "" {
		return []string{"smkn31jktdev@gmail.com"}
	}

	parts := strings.Split(raw, ",")
	out := make([]string, 0, len(parts))
	for _, item := range parts {
		email := strings.TrimSpace(item)
		if email != "" {
			out = append(out, email)
		}
	}

	if len(out) == 0 {
		return []string{"smkn31jktdev@gmail.com"}
	}

	return out
}

func NewSekolahDomain(databasePort outbound_port.DatabasePort) SekolahDomain {
	return &sekolahDomain{databasePort: databasePort}
}

func (d *sekolahDomain) requireAdmin(claims model.AuthClaims) error {
	role := strings.ToLower(strings.TrimSpace(claims.Role))
	if claims.ID == "" || (role != "admin" && role != "super_admin") {
		return stacktrace.NewError("unauthorized")
	}
	return nil
}

func (d *sekolahDomain) requireSuperAdmin(claims model.AuthClaims) error {
	if err := d.requireAdmin(claims); err != nil {
		return err
	}

	admin, err := d.databasePort.Auth().FindAdminByID(claims.ID)
	if err != nil {
		return stacktrace.Propagate(err, "find admin by id error")
	}
	if admin.ID == "" {
		return stacktrace.NewError("admin tidak ditemukan")
	}

	if strings.EqualFold(admin.Role, "super_admin") {
		return nil
	}

	superAdminEmails := getSuperAdminEmails()
	for _, item := range superAdminEmails {
		if strings.EqualFold(strings.TrimSpace(item), claims.Email) {
			return nil
		}
	}

	return stacktrace.NewError("forbidden: hanya super admin")
}
