package sekolah

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/palantir/stacktrace"

	"prabogo/internal/model"
)

func (d *sekolahDomain) StudentCreateOrReplyAduan(ctx context.Context, claims model.AuthClaims, input model.AduanInput) (model.Aduan, bool, error) {
	if claims.NISN == "" {
		return model.Aduan{}, false, stacktrace.NewError("nisn tidak ditemukan pada token")
	}
	if strings.TrimSpace(input.Message) == "" {
		return model.Aduan{}, false, stacktrace.NewError("pesan tidak boleh kosong")
	}

	student, err := d.databasePort.Auth().FindStudentByNISN(claims.NISN)
	if err != nil {
		return model.Aduan{}, false, stacktrace.Propagate(err, "find student by nisn error")
	}
	if student.ID == "" {
		return model.Aduan{}, false, stacktrace.NewError("student not found")
	}

	now := time.Now().UTC().Format(time.RFC3339)
	message := model.AduanMessage{
		ID:        uuid.NewString(),
		From:      student.Nama,
		Role:      "student",
		Message:   strings.TrimSpace(input.Message),
		Timestamp: now,
	}

	if input.TicketID != "" {
		updated, appendErr := d.databasePort.Sekolah().AppendAduanMessage(input.TicketID, message, now)
		if appendErr != nil {
			return model.Aduan{}, false, stacktrace.Propagate(appendErr, "append aduan message error")
		}
		return updated, true, nil
	}

	prefix := fmt.Sprintf("ADU-%s", time.Now().UTC().Format("20060102"))
	count, err := d.databasePort.Sekolah().CountAduanByTicketPrefix(prefix)
	if err != nil {
		return model.Aduan{}, false, stacktrace.Propagate(err, "count aduan error")
	}
	ticketID := fmt.Sprintf("%s-%03d", prefix, count+1)

	newAduan := model.Aduan{
		TicketID:  ticketID,
		NISN:      student.NISN,
		NamaSiswa: student.Nama,
		Kelas:     student.Kelas,
		Walas:     student.Walas,
		Messages:  []model.AduanMessage{message},
		Status:    "pending",
		StatusHistory: []model.AduanStatusHistory{{
			Status:    "pending",
			UpdatedBy: student.Nama,
			Role:      "student",
			UpdatedAt: now,
		}},
		CreatedAt: now,
		UpdatedAt: now,
	}

	created, err := d.databasePort.Sekolah().CreateAduan(newAduan)
	if err != nil {
		return model.Aduan{}, false, stacktrace.Propagate(err, "create aduan error")
	}
	return created, false, nil
}

func (d *sekolahDomain) StudentGetAduan(ctx context.Context, claims model.AuthClaims) ([]model.Aduan, error) {
	if claims.NISN == "" {
		return nil, stacktrace.NewError("nisn tidak ditemukan pada token")
	}
	return d.databasePort.Sekolah().FindAduanByFilter(model.AduanFilter{NISN: claims.NISN, Limit: 200})
}

func (d *sekolahDomain) AdminGetAduan(ctx context.Context, claims model.AuthClaims, filter model.AduanFilter) ([]model.Aduan, model.AdminAduanMeta, error) {
	if err := d.requireAdmin(claims); err != nil {
		return nil, model.AdminAduanMeta{}, err
	}
	if filter.Limit <= 0 {
		filter.Limit = 200
	}

	admin, err := d.databasePort.Auth().FindAdminByID(claims.ID)
	if err != nil {
		return nil, model.AdminAduanMeta{}, stacktrace.Propagate(err, "find admin by id error")
	}
	if admin.ID == "" {
		return nil, model.AdminAduanMeta{}, stacktrace.NewError("admin tidak ditemukan")
	}

	dbRole := strings.ToLower(strings.TrimSpace(admin.Role))
	isSuperAdmin := dbRole == "super_admin" || d.requireSuperAdmin(claims) == nil

	meta := model.AdminAduanMeta{
		AdminNama:    strings.TrimSpace(admin.Nama),
		IsSuperAdmin: isSuperAdmin,
	}

	if isSuperAdmin {
		filter.DiteruskanKe = "super_admin"
		items, err := d.databasePort.Sekolah().FindAduanByFilter(filter)
		return items, meta, err
	}

	if dbRole == "guru_bk" {
		filter.DiteruskanKe = "guru_bk"
		items, err := d.databasePort.Sekolah().FindAduanByFilter(filter)
		return items, meta, err
	}

	adminNama := strings.TrimSpace(admin.Nama)

	students, err := d.databasePort.Auth().FindStudentsByFilter(model.StudentFilter{})
	if err != nil {
		return nil, meta, stacktrace.Propagate(err, "find students error")
	}

	isGuruWali := false
	for _, s := range students {
		if strings.EqualFold(strings.TrimSpace(s.Walas), adminNama) {
			isGuruWali = true
			break
		}
	}

	meta.IsGuruWali = isGuruWali

	if isGuruWali {
		filter.Walas = adminNama
	} else {
		filter.DiteruskanKe = "guru_bk"
	}

	items, err := d.databasePort.Sekolah().FindAduanByFilter(filter)
	return items, meta, err
}

func (d *sekolahDomain) AdminGetAduanRoom(ctx context.Context, claims model.AuthClaims, ticketID string) (model.Aduan, model.AdminAduanMeta, error) {
	if strings.TrimSpace(ticketID) == "" {
		return model.Aduan{}, model.AdminAduanMeta{}, stacktrace.NewError("ticketId wajib diisi")
	}

	items, meta, err := d.AdminGetAduan(ctx, claims, model.AduanFilter{
		TicketID: strings.TrimSpace(ticketID),
		Limit:    1,
	})
	if err != nil {
		return model.Aduan{}, meta, err
	}
	if len(items) == 0 {
		return model.Aduan{}, meta, stacktrace.NewError("room chat aduan tidak ditemukan atau tidak memiliki akses")
	}

	return items[0], meta, nil
}

func (d *sekolahDomain) AdminUpdateAduanStatus(ctx context.Context, claims model.AuthClaims, ticketID string, action string, note string) (model.Aduan, error) {
	if err := d.requireAdmin(claims); err != nil {
		return model.Aduan{}, err
	}
	if ticketID == "" || action == "" {
		return model.Aduan{}, stacktrace.NewError("ticketId dan action wajib diisi")
	}

	validActions := map[string]bool{
		"teruskan_bk":         true,
		"teruskan_superadmin": true,
		"tindaklanjuti":       true,
		"selesai":             true,
	}
	if !validActions[action] {
		return model.Aduan{}, stacktrace.NewError("action tidak valid")
	}

	existingAduan, err := d.databasePort.Sekolah().FindAduanByTicketID(ticketID)
	if err != nil {
		return model.Aduan{}, stacktrace.Propagate(err, "find aduan error")
	}
	if existingAduan == nil {
		return model.Aduan{}, stacktrace.NewError("aduan tidak ditemukan")
	}

	admin, err := d.databasePort.Auth().FindAdminByID(claims.ID)
	if err != nil {
		return model.Aduan{}, stacktrace.Propagate(err, "find admin by id error")
	}
	if admin.ID == "" {
		return model.Aduan{}, stacktrace.NewError("admin tidak ditemukan")
	}

	dbRole := strings.ToLower(strings.TrimSpace(admin.Role))
	adminRole := dbRole
	if adminRole != "super_admin" && adminRole != "guru_bk" {
		if strings.EqualFold(strings.TrimSpace(admin.Nama), strings.TrimSpace(existingAduan.Walas)) {
			adminRole = "guru_wali"
		} else {
			adminRole = "guru_bk"
		}
	}

	var status string
	var diteruskanKe *string
	var statusNote string

	switch action {
	case "teruskan_bk":
		status = "diteruskan"
		bk := "guru_bk"
		diteruskanKe = &bk
		if note != "" {
			statusNote = note
		} else {
			statusNote = "Diteruskan ke Guru BK"
		}
	case "teruskan_superadmin":
		status = "diteruskan"
		sa := "super_admin"
		diteruskanKe = &sa
		if note != "" {
			statusNote = note
		} else {
			statusNote = "Diteruskan ke Super Admin"
		}
	case "tindaklanjuti":
		status = "ditindaklanjuti"
		if note != "" {
			statusNote = note
		} else {
			statusNote = "Laporan sedang ditindaklanjuti"
		}
	case "selesai":
		status = "selesai"
		if note != "" {
			statusNote = note
		} else {
			statusNote = "Laporan selesai ditangani"
		}
	}

	history := model.AduanStatusHistory{
		Status:    status,
		UpdatedBy: admin.Nama,
		Role:      adminRole,
		UpdatedAt: time.Now().UTC().Format(time.RFC3339),
		Note:      statusNote,
	}
	return d.databasePort.Sekolah().UpdateAduanStatus(ticketID, status, diteruskanKe, history)
}

func (d *sekolahDomain) AdminReplyAduan(ctx context.Context, claims model.AuthClaims, ticketID string, message string) (model.Aduan, error) {
	if err := d.requireAdmin(claims); err != nil {
		return model.Aduan{}, err
	}
	if ticketID == "" || strings.TrimSpace(message) == "" {
		return model.Aduan{}, stacktrace.NewError("ticketId dan message wajib diisi")
	}

	admin, err := d.databasePort.Auth().FindAdminByID(claims.ID)
	if err != nil {
		return model.Aduan{}, stacktrace.Propagate(err, "find admin by id error")
	}
	if admin.ID == "" {
		return model.Aduan{}, stacktrace.NewError("admin tidak ditemukan")
	}

	existingAduan, err := d.databasePort.Sekolah().FindAduanByTicketID(ticketID)
	if err != nil {
		return model.Aduan{}, stacktrace.Propagate(err, "find aduan error")
	}
	if existingAduan == nil {
		return model.Aduan{}, stacktrace.NewError("aduan tidak ditemukan")
	}

	dbRole := strings.ToLower(strings.TrimSpace(admin.Role))
	adminRole := dbRole
	if adminRole != "super_admin" && adminRole != "guru_bk" {
		if strings.EqualFold(strings.TrimSpace(admin.Nama), strings.TrimSpace(existingAduan.Walas)) {
			adminRole = "guru_wali"
		} else {
			adminRole = "guru_bk"
		}
	}

	now := time.Now().UTC().Format(time.RFC3339)
	msg := model.AduanMessage{
		ID:        uuid.NewString(),
		From:      admin.Nama,
		Role:      adminRole,
		Message:   strings.TrimSpace(message),
		Timestamp: now,
	}
	return d.databasePort.Sekolah().AppendAduanMessage(ticketID, msg, now)
}
