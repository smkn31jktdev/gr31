package sekolah

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/palantir/stacktrace"
	"golang.org/x/crypto/bcrypt"

	"prabogo/internal/model"
)

func (d *sekolahDomain) CreateAdmin(ctx context.Context, claims model.AuthClaims, input model.CreateAdminInput) (model.Admin, error) {
	if err := d.requireSuperAdmin(claims); err != nil {
		return model.Admin{}, err
	}
	if input.Nama == "" || input.Email == "" || input.Password == "" {
		return model.Admin{}, stacktrace.NewError("nama, email, dan password wajib diisi")
	}
	if input.Role == "" {
		input.Role = "admin"
	}

	existing, err := d.databasePort.Auth().FindAdminByEmail(strings.ToLower(input.Email))
	if err != nil {
		return model.Admin{}, stacktrace.Propagate(err, "find admin by email error")
	}
	if existing.ID != "" {
		return model.Admin{}, stacktrace.NewError("email admin sudah terdaftar")
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(input.Password), 10)
	if err != nil {
		return model.Admin{}, stacktrace.Propagate(err, "hash password error")
	}

	now := time.Now().UTC()
	admin := model.Admin{
		ID:        uuid.NewString(),
		Nama:      input.Nama,
		Email:     strings.ToLower(input.Email),
		Password:  string(hashed),
		Role:      input.Role,
		CreatedAt: now,
		UpdatedAt: now,
	}

	created, err := d.databasePort.Auth().CreateAdmin(admin)
	if err != nil {
		return model.Admin{}, stacktrace.Propagate(err, "create admin error")
	}
	return created, nil
}

func (d *sekolahDomain) AdminLoadAdminsFromSheet(ctx context.Context, claims model.AuthClaims, sheetID string, sheetRange string) ([][]string, error) {
	if err := d.requireSuperAdmin(claims); err != nil {
		return nil, err
	}

	sheetID = strings.TrimSpace(sheetID)
	if sheetID == "" {
		return nil, stacktrace.NewError("sheetId wajib diisi")
	}

	sheetRange = strings.TrimSpace(sheetRange)
	if sheetRange == "" {
		sheetRange = "B6:D"
	}

	apiKey := strings.TrimSpace(os.Getenv("GOOGLE_SHEETS_API_KEY"))
	if apiKey == "" {
		return nil, stacktrace.NewError("GOOGLE_SHEETS_API_KEY belum dikonfigurasi")
	}

	endpoint := fmt.Sprintf(
		"https://sheets.googleapis.com/v4/spreadsheets/%s/values/%s?key=%s",
		url.PathEscape(sheetID),
		url.PathEscape(sheetRange),
		url.QueryEscape(apiKey),
	)

	client := &http.Client{Timeout: 20 * time.Second}
	res, err := client.Get(endpoint)
	if err != nil {
		return nil, stacktrace.Propagate(err, "request Google Sheets API gagal")
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, stacktrace.Propagate(err, "read response Google Sheets API gagal")
	}

	if res.StatusCode < 200 || res.StatusCode >= 300 {
		var errResp struct {
			Error struct {
				Message string `json:"message"`
			} `json:"error"`
		}
		_ = json.Unmarshal(body, &errResp)
		msg := strings.TrimSpace(errResp.Error.Message)
		if msg == "" {
			msg = string(body)
		}
		if strings.TrimSpace(msg) == "" {
			msg = "Google Sheets API mengembalikan error"
		}
		return nil, stacktrace.NewError("%s", msg)
	}

	var payload struct {
		Values [][]any `json:"values"`
	}
	if err := json.Unmarshal(body, &payload); err != nil {
		return nil, stacktrace.Propagate(err, "parse response Google Sheets API gagal")
	}

	out := make([][]string, 0, len(payload.Values))
	for _, row := range payload.Values {
		clean := make([]string, len(row))
		for i, value := range row {
			clean[i] = strings.TrimSpace(fmt.Sprint(value))
		}
		out = append(out, clean)
	}

	return out, nil
}

func (d *sekolahDomain) AdminBulkCreateAdmins(ctx context.Context, claims model.AuthClaims, inputs []model.CreateAdminInput) (map[string]any, error) {
	if err := d.requireSuperAdmin(claims); err != nil {
		return nil, err
	}
	if len(inputs) == 0 {
		return nil, stacktrace.NewError("admins wajib diisi")
	}

	created := 0
	failed := 0
	errors := make([]string, 0)

	for idx, row := range inputs {
		payload := model.CreateAdminInput{
			Nama:     strings.TrimSpace(row.Nama),
			Email:    strings.TrimSpace(row.Email),
			Password: strings.TrimSpace(row.Password),
			Role:     strings.TrimSpace(row.Role),
		}

		if payload.Role == "" {
			payload.Role = "admin"
		}

		if payload.Nama == "" || payload.Email == "" || payload.Password == "" {
			failed++
			errors = append(errors, fmt.Sprintf("baris %d: nama, email, dan password wajib diisi", idx+1))
			continue
		}

		_, err := d.CreateAdmin(ctx, claims, payload)
		if err != nil {
			failed++
			errors = append(errors, fmt.Sprintf("baris %d: %s", idx+1, stacktrace.RootCause(err).Error()))
			continue
		}

		created++
	}

	message := fmt.Sprintf("Import selesai. Berhasil: %d, gagal: %d", created, failed)

	return map[string]any{
		"success": created > 0,
		"message": message,
		"created": created,
		"failed":  failed,
		"errors":  errors,
	}, nil
}

func (d *sekolahDomain) ListAdmins(ctx context.Context, claims model.AuthClaims, filter model.AdminFilter) ([]model.Admin, error) {
	if err := d.requireAdmin(claims); err != nil {
		return nil, err
	}
	return d.databasePort.Auth().FindAdminsByFilter(filter)
}

func (d *sekolahDomain) ListStudents(ctx context.Context, claims model.AuthClaims, filter model.StudentFilter) ([]model.Student, error) {
	if err := d.requireAdmin(claims); err != nil {
		return nil, err
	}

	isSuperAdmin := strings.EqualFold(strings.TrimSpace(claims.Role), "super_admin")
	if !isSuperAdmin && d.requireSuperAdmin(claims) == nil {
		isSuperAdmin = true
	}

	if !isSuperAdmin {
		admin, err := d.databasePort.Auth().FindAdminByID(claims.ID)
		if err != nil {
			return nil, stacktrace.Propagate(err, "find admin by id error")
		}
		if admin.ID == "" {
			return nil, stacktrace.NewError("admin tidak ditemukan")
		}

		filter.Walas = strings.TrimSpace(admin.Nama)
	}

	return d.databasePort.Auth().FindStudentsByFilter(filter)
}
