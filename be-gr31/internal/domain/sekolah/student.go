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

func (d *sekolahDomain) CreateStudent(ctx context.Context, claims model.AuthClaims, input model.CreateStudentInput) (model.Student, error) {
	if err := d.requireAdmin(claims); err != nil {
		return model.Student{}, err
	}
	if input.NISN == "" || input.Nama == "" || input.Kelas == "" || input.Walas == "" || input.Password == "" {
		return model.Student{}, stacktrace.NewError("nisn, nama, kelas, walas, dan password wajib diisi")
	}

	existing, err := d.databasePort.Auth().FindStudentByNISN(input.NISN)
	if err != nil {
		return model.Student{}, stacktrace.Propagate(err, "find student by nisn error")
	}
	if existing.ID != "" {
		return model.Student{}, stacktrace.NewError("nisn siswa sudah terdaftar")
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(input.Password), 10)
	if err != nil {
		return model.Student{}, stacktrace.Propagate(err, "hash password error")
	}

	now := time.Now().UTC()
	student := model.Student{
		ID:        uuid.NewString(),
		NISN:      input.NISN,
		Nama:      input.Nama,
		Kelas:     input.Kelas,
		Walas:     input.Walas,
		Email:     strings.ToLower(input.Email),
		Password:  string(hashed),
		IsOnline:  false,
		CreatedAt: now,
		UpdatedAt: now,
	}

	created, err := d.databasePort.Auth().CreateStudent(student)
	if err != nil {
		return model.Student{}, stacktrace.Propagate(err, "create student error")
	}
	return created, nil
}

func (d *sekolahDomain) AdminLoadStudentsFromSheet(ctx context.Context, claims model.AuthClaims, sheetID string, sheetRange string) ([][]string, error) {
	if err := d.requireAdmin(claims); err != nil {
		return nil, err
	}

	sheetID = strings.TrimSpace(sheetID)
	if sheetID == "" {
		return nil, stacktrace.NewError("sheetId wajib diisi")
	}

	sheetRange = strings.TrimSpace(sheetRange)
	if sheetRange == "" {
		sheetRange = "B6:F"
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

func (d *sekolahDomain) AdminBulkCreateStudents(ctx context.Context, claims model.AuthClaims, inputs []model.CreateStudentInput) (map[string]any, error) {
	if err := d.requireAdmin(claims); err != nil {
		return nil, err
	}
	if len(inputs) == 0 {
		return nil, stacktrace.NewError("students wajib diisi")
	}

	created := 0
	failed := 0
	errors := make([]string, 0)

	for idx, row := range inputs {
		payload := model.CreateStudentInput{
			NISN:     strings.TrimSpace(row.NISN),
			Nama:     strings.TrimSpace(row.Nama),
			Kelas:    strings.TrimSpace(row.Kelas),
			Walas:    strings.TrimSpace(row.Walas),
			Email:    strings.TrimSpace(row.Email),
			Password: strings.TrimSpace(row.Password),
		}

		if payload.NISN == "" || payload.Nama == "" || payload.Kelas == "" || payload.Walas == "" || payload.Password == "" {
			failed++
			errors = append(errors, fmt.Sprintf("baris %d: nisn, nama, kelas, walas, dan password wajib diisi", idx+1))
			continue
		}

		_, err := d.CreateStudent(ctx, claims, payload)
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
