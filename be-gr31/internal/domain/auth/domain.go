package auth

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/palantir/stacktrace"
	"golang.org/x/crypto/bcrypt"

	"prabogo/internal/model"
	outbound_port "prabogo/internal/port/outbound"
	"prabogo/utils/jwt"
)

func getSuperAdminEmails() []string {
	raw := strings.TrimSpace(os.Getenv("SUPER_ADMIN_EMAILS"))
	if raw == "" {
		// Keep compatibility with existing frontend guard email.
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

func resolveAdminRole(email string, storedRole string) string {
	role := strings.ToLower(strings.TrimSpace(storedRole))
	if role == "super_admin" {
		return "super_admin"
	}

	superAdminEmails := getSuperAdminEmails()
	for _, item := range superAdminEmails {
		if strings.EqualFold(strings.TrimSpace(item), strings.TrimSpace(email)) {
			return "super_admin"
		}
	}

	return "admin"
}

type AuthDomain interface {
	StudentLogin(ctx context.Context, input model.StudentLoginInput) (string, model.StudentTokenPayload, error)
	StudentMe(ctx context.Context, id string) (model.StudentTokenPayload, error)
	AdminLogin(ctx context.Context, input model.AdminLoginInput) (string, model.AdminTokenPayload, error)
	AdminMe(ctx context.Context, id string) (model.AdminTokenPayload, error)
	RefreshToken(ctx context.Context, claims model.AuthClaims) (string, error)
	UpdateAdminSettings(ctx context.Context, claims model.AuthClaims, input model.UpdateAdminSettingsInput) (model.Admin, error)
	UploadAdminProfilePhoto(ctx context.Context, claims model.AuthClaims, mimeType string, fileContent []byte) (model.Admin, error)
	DeleteAdminProfilePhoto(ctx context.Context, claims model.AuthClaims) (model.Admin, error)
}

type authDomain struct {
	databasePort outbound_port.DatabasePort
	jwtStrategy  jwt.Strategy
	jwtConfig    jwt.Config
}

func NewAuthDomain(databasePort outbound_port.DatabasePort) AuthDomain {
	cfg := jwt.LoadConfig()
	strategy := jwt.NewHS256Strategy(cfg)
	return &authDomain{
		databasePort: databasePort,
		jwtStrategy:  strategy,
		jwtConfig:    cfg,
	}
}

func (d *authDomain) StudentLogin(ctx context.Context, input model.StudentLoginInput) (string, model.StudentTokenPayload, error) {
	if input.NISN == "" || input.Password == "" {
		return "", model.StudentTokenPayload{}, stacktrace.NewError("nisn and password are required")
	}

	student, err := d.databasePort.Auth().FindStudentByNISN(input.NISN)
	if err != nil {
		return "", model.StudentTokenPayload{}, stacktrace.Propagate(err, "find student by nisn error")
	}
	if student.ID == "" {
		return "", model.StudentTokenPayload{}, stacktrace.NewError("NISN atau password salah")
	}

	if cmpErr := bcrypt.CompareHashAndPassword([]byte(student.Password), []byte(input.Password)); cmpErr != nil {
		return "", model.StudentTokenPayload{}, stacktrace.NewError("NISN atau password salah")
	}

	token, err := d.jwtStrategy.Generate(model.AuthClaims{
		ID:    student.ID,
		Email: student.Email,
		Role:  "student",
		NISN:  student.NISN,
	}, d.jwtConfig.AccessTokenTTL)
	if err != nil {
		return "", model.StudentTokenPayload{}, stacktrace.Propagate(err, "generate student token error")
	}

	if err := d.databasePort.Auth().SetStudentOnline(student.ID, true); err != nil {
		return "", model.StudentTokenPayload{}, stacktrace.Propagate(err, "set student online error")
	}

	return token, model.StudentTokenPayload{
		ID:    student.ID,
		NISN:  student.NISN,
		Nama:  student.Nama,
		Kelas: student.Kelas,
		Email: student.Email,
	}, nil
}

func (d *authDomain) StudentMe(ctx context.Context, id string) (model.StudentTokenPayload, error) {
	if id == "" {
		return model.StudentTokenPayload{}, stacktrace.NewError("id is required")
	}

	student, err := d.databasePort.Auth().FindStudentByID(id)
	if err != nil {
		return model.StudentTokenPayload{}, stacktrace.Propagate(err, "find student by id error")
	}
	if student.ID == "" {
		return model.StudentTokenPayload{}, stacktrace.NewError("Student not found")
	}

	return model.StudentTokenPayload{
		ID:    student.ID,
		Nama:  student.Nama,
		NISN:  student.NISN,
		Kelas: student.Kelas,
		Email: student.Email,
	}, nil
}

func (d *authDomain) AdminLogin(ctx context.Context, input model.AdminLoginInput) (string, model.AdminTokenPayload, error) {
	if input.Email == "" || input.Password == "" {
		return "", model.AdminTokenPayload{}, stacktrace.NewError("email and password are required")
	}

	admin, err := d.databasePort.Auth().FindAdminByEmail(strings.ToLower(input.Email))
	if err != nil {
		return "", model.AdminTokenPayload{}, stacktrace.Propagate(err, "find admin by email error")
	}
	if admin.ID == "" {
		return "", model.AdminTokenPayload{}, stacktrace.NewError("Email atau password salah")
	}

	if cmpErr := bcrypt.CompareHashAndPassword([]byte(admin.Password), []byte(input.Password)); cmpErr != nil {
		return "", model.AdminTokenPayload{}, stacktrace.NewError("Email atau password salah")
	}

	role := resolveAdminRole(admin.Email, admin.Role)

	token, err := d.jwtStrategy.Generate(model.AuthClaims{
		ID:    admin.ID,
		Email: admin.Email,
		Role:  role,
	}, d.jwtConfig.AccessTokenTTL)
	if err != nil {
		return "", model.AdminTokenPayload{}, stacktrace.Propagate(err, "generate admin token error")
	}

	return token, model.AdminTokenPayload{
		ID:         admin.ID,
		Nama:       admin.Nama,
		Email:      admin.Email,
		FotoProfil: admin.FotoProfil,
	}, nil
}

func (d *authDomain) AdminMe(ctx context.Context, id string) (model.AdminTokenPayload, error) {
	if id == "" {
		return model.AdminTokenPayload{}, stacktrace.NewError("id is required")
	}

	admin, err := d.databasePort.Auth().FindAdminByID(id)
	if err != nil {
		return model.AdminTokenPayload{}, stacktrace.Propagate(err, "find admin by id error")
	}
	if admin.ID == "" {
		return model.AdminTokenPayload{}, stacktrace.NewError("Admin not found")
	}

	return model.AdminTokenPayload{
		ID:         admin.ID,
		Nama:       admin.Nama,
		Email:      admin.Email,
		FotoProfil: admin.FotoProfil,
	}, nil
}

func (d *authDomain) RefreshToken(ctx context.Context, claims model.AuthClaims) (string, error) {
	if claims.ID == "" || claims.Role == "" {
		return "", stacktrace.NewError("invalid claims for token refresh")
	}

	token, err := d.jwtStrategy.Generate(claims, d.jwtConfig.AccessTokenTTL)
	if err != nil {
		return "", stacktrace.Propagate(err, "generate refresh token error")
	}

	return token, nil
}

func (d *authDomain) UpdateAdminSettings(ctx context.Context, claims model.AuthClaims, input model.UpdateAdminSettingsInput) (model.Admin, error) {
	// Use claims.ID from JWT token to identify the admin
	if claims.ID == "" {
		return model.Admin{}, stacktrace.NewError("admin ID tidak ditemukan dalam token")
	}

	admin, err := d.databasePort.Auth().FindAdminByID(claims.ID)
	if err != nil {
		return model.Admin{}, stacktrace.Propagate(err, "find admin by id error")
	}
	if admin.ID == "" {
		return model.Admin{}, stacktrace.NewError("Admin tidak ditemukan")
	}

	// Update nama
	if input.Name != "" {
		admin.Nama = input.Name
	}

	// Update email jika ada perubahan
	if input.NewEmail != nil && *input.NewEmail != "" && *input.NewEmail != admin.Email {
		newEmail := strings.ToLower(*input.NewEmail)

		// Check if new email already exists
		existing, err := d.databasePort.Auth().FindAdminByEmail(newEmail)
		if err != nil {
			return model.Admin{}, stacktrace.Propagate(err, "check existing email error")
		}
		if existing.ID != "" && existing.ID != admin.ID {
			return model.Admin{}, stacktrace.NewError("Email sudah digunakan oleh admin lain")
		}

		admin.Email = newEmail
	}

	// Update password jika ada
	if input.NewPassword != nil && *input.NewPassword != "" {
		if input.CurrentPassword == nil || *input.CurrentPassword == "" {
			return model.Admin{}, stacktrace.NewError("Kata sandi saat ini diperlukan untuk mengubah kata sandi")
		}

		// Verify current password
		if cmpErr := bcrypt.CompareHashAndPassword([]byte(admin.Password), []byte(*input.CurrentPassword)); cmpErr != nil {
			return model.Admin{}, stacktrace.NewError("Kata sandi saat ini salah")
		}

		// Hash new password
		hashed, err := bcrypt.GenerateFromPassword([]byte(*input.NewPassword), 10)
		if err != nil {
			return model.Admin{}, stacktrace.Propagate(err, "hash password error")
		}
		admin.Password = string(hashed)
	}

	// Update admin in database
	updated, err := d.databasePort.Auth().UpdateAdmin(admin)
	if err != nil {
		return model.Admin{}, stacktrace.Propagate(err, "update admin error")
	}

	return updated, nil
}

var allowedProfilePhotoTypes = map[string]string{
	"image/jpeg": "jpg",
	"image/png":  "png",
	"image/webp": "webp",
}

const (
	maxProfilePhotoSize = 2 * 1024 * 1024
	profileUploadDir    = "uploads/profil"
)

func (d *authDomain) UploadAdminProfilePhoto(ctx context.Context, claims model.AuthClaims, mimeType string, fileContent []byte) (model.Admin, error) {
	if claims.ID == "" {
		return model.Admin{}, stacktrace.NewError("admin ID tidak ditemukan dalam token")
	}

	admin, err := d.databasePort.Auth().FindAdminByID(claims.ID)
	if err != nil {
		return model.Admin{}, stacktrace.Propagate(err, "find admin by id error")
	}
	if admin.ID == "" {
		return model.Admin{}, stacktrace.NewError("Admin tidak ditemukan")
	}

	ext, ok := allowedProfilePhotoTypes[mimeType]
	if !ok {
		return model.Admin{}, stacktrace.NewError("File harus berupa gambar JPG, PNG, atau WebP")
	}

	if len(fileContent) == 0 {
		return model.Admin{}, stacktrace.NewError("File foto harus diisi")
	}

	if len(fileContent) > maxProfilePhotoSize {
		return model.Admin{}, stacktrace.NewError("Ukuran file maksimal 2MB")
	}

	if err := os.MkdirAll(profileUploadDir, 0o755); err != nil {
		return model.Admin{}, stacktrace.Propagate(err, "create profile upload directory error")
	}

	if admin.FotoProfil != "" {
		_ = removeLocalUploadedFile(admin.FotoProfil)
	}

	fileName := fmt.Sprintf("admin_%s_%d.%s", claims.ID, time.Now().UnixMilli(), ext)
	filePath := filepath.Join(profileUploadDir, fileName)
	if err := os.WriteFile(filePath, fileContent, 0o644); err != nil {
		return model.Admin{}, stacktrace.Propagate(err, "write profile photo error")
	}

	fotoPath := "/uploads/profil/" + fileName
	updated, err := d.databasePort.Auth().UpdateAdminPhoto(claims.ID, fotoPath)
	if err != nil {
		_ = os.Remove(filePath)
		return model.Admin{}, stacktrace.Propagate(err, "update admin profile photo error")
	}

	return updated, nil
}

func (d *authDomain) DeleteAdminProfilePhoto(ctx context.Context, claims model.AuthClaims) (model.Admin, error) {
	if claims.ID == "" {
		return model.Admin{}, stacktrace.NewError("admin ID tidak ditemukan dalam token")
	}

	admin, err := d.databasePort.Auth().FindAdminByID(claims.ID)
	if err != nil {
		return model.Admin{}, stacktrace.Propagate(err, "find admin by id error")
	}
	if admin.ID == "" {
		return model.Admin{}, stacktrace.NewError("Admin tidak ditemukan")
	}

	if admin.FotoProfil != "" {
		_ = removeLocalUploadedFile(admin.FotoProfil)
	}

	updated, err := d.databasePort.Auth().DeleteAdminPhoto(claims.ID)
	if err != nil {
		return model.Admin{}, stacktrace.Propagate(err, "delete admin profile photo error")
	}

	return updated, nil
}

func removeLocalUploadedFile(fotoPath string) error {
	trimmed := strings.TrimSpace(fotoPath)
	if trimmed == "" {
		return nil
	}

	relative := strings.TrimPrefix(trimmed, "/")
	cleanPath := filepath.Clean(relative)
	if cleanPath == "." {
		return nil
	}

	return os.Remove(cleanPath)
}
