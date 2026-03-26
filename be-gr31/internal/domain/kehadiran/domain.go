package kehadiran

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/palantir/stacktrace"

	"prabogo/internal/model"
	outbound_port "prabogo/internal/port/outbound"
)

var hariIndonesia = []string{"Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"}

type KehadiranDomain interface {
	StudentUpsert(ctx context.Context, claims model.AuthClaims, input model.KehadiranInput) (model.Kehadiran, bool, error)
	StudentGet(ctx context.Context, claims model.AuthClaims, tanggal string, bulan string) (any, error)
	AdminGet(ctx context.Context, filter model.KehadiranFilter) (map[string]any, error)
}

type kehadiranDomain struct {
	databasePort outbound_port.DatabasePort
}

func NewKehadiranDomain(databasePort outbound_port.DatabasePort) KehadiranDomain {
	return &kehadiranDomain{databasePort: databasePort}
}

func (d *kehadiranDomain) StudentUpsert(ctx context.Context, claims model.AuthClaims, input model.KehadiranInput) (model.Kehadiran, bool, error) {
	if claims.NISN == "" {
		return model.Kehadiran{}, false, stacktrace.NewError("nisn tidak ditemukan pada token")
	}

	todayJakarta := currentJakartaDate()
	input.Tanggal = strings.TrimSpace(input.Tanggal)
	if input.Tanggal == "" {
		input.Tanggal = todayJakarta
	} else if input.Tanggal != todayJakarta {
		// Prevent UTC/client timezone skew from saving yesterday's date after midnight WIB.
		input.Tanggal = todayJakarta
	}

	if isWeekend(input.Tanggal) {
		return model.Kehadiran{}, false, stacktrace.NewError("Kehadiran tidak dapat dicatat pada hari Sabtu dan Minggu")
	}
	if input.Kehadiran.Status == "" {
		return model.Kehadiran{}, false, stacktrace.NewError("Data kehadiran tidak valid")
	}

	student, err := d.databasePort.Auth().FindStudentByNISN(claims.NISN)
	if err != nil {
		return model.Kehadiran{}, false, stacktrace.Propagate(err, "find student by nisn error")
	}
	if student.ID == "" {
		return model.Kehadiran{}, false, stacktrace.NewError("Student not found")
	}

	now := time.Now()
	waktuAbsen := now.In(jakartaLocation()).Format("15:04:05")
	verifiedAt := input.Kehadiran.VerifiedAt
	if verifiedAt == "" {
		verifiedAt = now.Format(time.RFC3339)
	}

	doc := model.Kehadiran{
		NISN:             student.NISN,
		Nama:             student.Nama,
		Kelas:            student.Kelas,
		Tanggal:          input.Tanggal,
		Hari:             getHariName(input.Tanggal),
		Status:           input.Kehadiran.Status,
		WaktuAbsen:       waktuAbsen,
		AlasanTidakHadir: input.Kehadiran.AlasanTidakHadir,
		Koordinat:        input.Kehadiran.Koordinat,
		Jarak:            input.Kehadiran.Jarak,
		Akurasi:          input.Kehadiran.Akurasi,
		VerifiedAt:       &verifiedAt,
		UpdatedBy:        "student",
	}

	result, updated, err := d.databasePort.Kehadiran().UpsertByNISNAndTanggal(doc)
	if err != nil {
		return model.Kehadiran{}, false, stacktrace.Propagate(err, "upsert kehadiran error")
	}
	return result, updated, nil
}

func (d *kehadiranDomain) StudentGet(ctx context.Context, claims model.AuthClaims, tanggal string, bulan string) (any, error) {
	if claims.NISN == "" {
		return nil, stacktrace.NewError("nisn tidak ditemukan pada token")
	}

	if tanggal != "" {
		record, err := d.databasePort.Kehadiran().FindByNISNAndTanggal(claims.NISN, tanggal)
		if err != nil {
			return nil, stacktrace.Propagate(err, "find kehadiran by date error")
		}
		return map[string]any{"kehadiran": record}, nil
	}

	if bulan == "" {
		return nil, stacktrace.NewError("Parameter tanggal atau bulan harus diisi")
	}

	startDate, endDate, weekdays, err := monthRangeAndWeekdays(bulan)
	if err != nil {
		return nil, err
	}

	records, err := d.databasePort.Kehadiran().FindByNISNAndDateRange(claims.NISN, startDate, endDate)
	if err != nil {
		return nil, stacktrace.Propagate(err, "find monthly kehadiran error")
	}

	hadir, tidakHadir := countStatus(records)
	return map[string]any{
		"records": records,
		"summary": map[string]int{
			"totalWeekdays": weekdays,
			"hadir":         hadir,
			"tidakHadir":    tidakHadir,
			"belumAbsen":    weekdays - hadir - tidakHadir,
		},
	}, nil
}

func (d *kehadiranDomain) AdminGet(ctx context.Context, filter model.KehadiranFilter) (map[string]any, error) {
	if filter.Tanggal == "" && (filter.Dari == "" || filter.Sampai == "") {
		return nil, stacktrace.NewError("Parameter tanggal atau dari/sampai harus diisi")
	}

	normalizedStatusFilter := normalizeAttendanceStatusFilter(filter.Status)
	queryFilter := filter
	queryFilter.Status = normalizedStatusFilter

	records, err := d.databasePort.Kehadiran().FindByFilter(queryFilter)
	if err != nil {
		return nil, stacktrace.Propagate(err, "find kehadiran by filter error")
	}

	if filter.Tanggal != "" {
		fallbackRows, fallbackErr := d.fetchMidnightTidakHadirFallback(filter)
		if fallbackErr != nil {
			return nil, fallbackErr
		}
		records = append(records, fallbackRows...)
	}

	if filter.Tanggal == "" {
		if normalizedStatusFilter == "izin" || normalizedStatusFilter == "sakit" || normalizedStatusFilter == "alpa" {
			filtered := make([]model.Kehadiran, 0, len(records))
			for _, rec := range records {
				if rec.Status != "tidak_hadir" {
					continue
				}
				if classifyTidakHadir(rec.AlasanTidakHadir) == normalizedStatusFilter {
					filtered = append(filtered, rec)
				}
			}
			records = filtered
		}

		return map[string]any{
			"data":  records,
			"total": len(records),
		}, nil
	}

	students, err := d.databasePort.Auth().FindStudentsByFilter(model.StudentFilter{Kelas: filter.Kelas, NISN: filter.NISN})
	if err != nil {
		return nil, stacktrace.Propagate(err, "find students by filter error")
	}

	byKey := map[string]model.Kehadiran{}
	for _, rec := range records {
		effectiveDate := rec.Tanggal
		if filter.Tanggal != "" && rec.Tanggal != filter.Tanggal {
			if verifiedDate, ok := verifiedAtDate(rec.VerifiedAt); ok && verifiedDate == filter.Tanggal {
				effectiveDate = filter.Tanggal
			}
		}

		byKey[fmt.Sprintf("%s_%s", rec.NISN, effectiveDate)] = rec
	}

	result := make([]map[string]any, 0, len(students))
	summary := map[string]int{
		"hadir":      0,
		"izin":       0,
		"sakit":      0,
		"alpa":       0,
		"tidakHadir": 0,
		"belum":      0,
	}
	for _, student := range students {
		key := fmt.Sprintf("%s_%s", student.NISN, filter.Tanggal)
		rec, ok := byKey[key]
		status := "belum"
		tidakHadirKategori := ""
		if ok {
			status = rec.Status
			if status == "tidak_hadir" {
				tidakHadirKategori = classifyTidakHadir(rec.AlasanTidakHadir)
			}
		}

		if !matchesStatusFilter(normalizedStatusFilter, status, tidakHadirKategori) {
			continue
		}

		switch status {
		case "hadir":
			summary["hadir"]++
		case "tidak_hadir":
			summary["tidakHadir"]++
			summary[tidakHadirKategori]++
		default:
			summary["belum"]++
		}

		row := map[string]any{
			"nisn":            student.NISN,
			"nama":            student.Nama,
			"kelas":           student.Kelas,
			"tanggal":         filter.Tanggal,
			"hari":            getHariName(filter.Tanggal),
			"status":          status,
			"kategoriTidakHadir": nil,
			"waktuAbsen":      nil,
			"alasanTidakHadir": nil,
			"koordinat":       nil,
			"jarak":           nil,
			"akurasi":         nil,
			"verifiedAt":      nil,
		}
		if ok {
			row["waktuAbsen"] = rec.WaktuAbsen
			row["alasanTidakHadir"] = rec.AlasanTidakHadir
			row["koordinat"] = rec.Koordinat
			row["jarak"] = rec.Jarak
			row["akurasi"] = rec.Akurasi
			row["verifiedAt"] = rec.VerifiedAt
			if status == "tidak_hadir" {
				row["kategoriTidakHadir"] = tidakHadirKategori
			}
		}
		result = append(result, row)
	}

	return map[string]any{
		"data":    result,
		"total":   len(result),
		"summary": summary,
	}, nil
}

func normalizeAttendanceStatusFilter(raw string) string {
	status := strings.ToLower(strings.TrimSpace(raw))
	if status == "" {
		return ""
	}

	switch status {
	case "tanpa keterangan", "tanpa ket", "tanpa_keterangan", "tanpa_ket", "tanpa-keterangan":
		return "alpa"
	default:
		return status
	}
}

func classifyTidakHadir(alasan string) string {
	reason := strings.ToLower(strings.TrimSpace(alasan))
	if reason == "" {
		return "alpa"
	}

	sakitKeywords := []string{"sakit", "demam", "flu", "batuk", "pusing", "rawat", "klinik", "dokter", "rumah sakit"}
	for _, keyword := range sakitKeywords {
		if strings.Contains(reason, keyword) {
			return "sakit"
		}
	}

	izinKeywords := []string{"izin", "ijin", "acara", "keluarga", "keperluan", "urusan", "lomba", "kegiatan", "mabar"}
	for _, keyword := range izinKeywords {
		if strings.Contains(reason, keyword) {
			return "izin"
		}
	}

	return "alpa"
}

func matchesStatusFilter(filterStatus string, status string, tidakHadirKategori string) bool {
	if filterStatus == "" {
		return true
	}

	switch filterStatus {
	case "hadir", "tidak_hadir", "belum":
		return status == filterStatus
	case "izin", "sakit", "alpa":
		return status == "tidak_hadir" && tidakHadirKategori == filterStatus
	default:
		return status == filterStatus
	}
}

func isWeekend(dateStr string) bool {
	t, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return false
	}
	weekday := t.Weekday()
	return weekday == time.Saturday || weekday == time.Sunday
}

func getHariName(dateStr string) string {
	t, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return ""
	}
	return hariIndonesia[t.Weekday()]
}

func monthRangeAndWeekdays(bulan string) (string, string, int, error) {
	t, err := time.Parse("2006-01", bulan)
	if err != nil {
		return "", "", 0, stacktrace.NewError("format bulan harus YYYY-MM")
	}
	start := time.Date(t.Year(), t.Month(), 1, 0, 0, 0, 0, time.UTC)
	end := start.AddDate(0, 1, -1)
	weekdays := 0
	for d := start; !d.After(end); d = d.AddDate(0, 0, 1) {
		if d.Weekday() != time.Saturday && d.Weekday() != time.Sunday {
			weekdays++
		}
	}
	return start.Format("2006-01-02"), end.Format("2006-01-02"), weekdays, nil
}

func countStatus(records []model.Kehadiran) (int, int) {
	hadir := 0
	tidakHadir := 0
	for _, r := range records {
		if r.Status == "hadir" {
			hadir++
		}
		if r.Status == "tidak_hadir" {
			tidakHadir++
		}
	}
	return hadir, tidakHadir
}

func jakartaLocation() *time.Location {
	loc, err := time.LoadLocation("Asia/Jakarta")
	if err != nil {
		return time.FixedZone("WIB", 7*60*60)
	}
	return loc
}

func currentJakartaDate() string {
	return time.Now().In(jakartaLocation()).Format("2006-01-02")
}

func verifiedAtDate(value *string) (string, bool) {
	if value == nil || strings.TrimSpace(*value) == "" {
		return "", false
	}

	parsed, err := time.Parse(time.RFC3339, strings.TrimSpace(*value))
	if err != nil {
		return "", false
	}

	return parsed.In(jakartaLocation()).Format("2006-01-02"), true
}

func (d *kehadiranDomain) fetchMidnightTidakHadirFallback(filter model.KehadiranFilter) ([]model.Kehadiran, error) {
	selected, err := time.Parse("2006-01-02", filter.Tanggal)
	if err != nil {
		return nil, stacktrace.Propagate(err, "parse selected tanggal error")
	}

	previous := selected.AddDate(0, 0, -1).Format("2006-01-02")
	rows, err := d.databasePort.Kehadiran().FindByFilter(model.KehadiranFilter{
		Tanggal: previous,
		Kelas:   filter.Kelas,
		NISN:    filter.NISN,
		Status:  "tidak_hadir",
	})
	if err != nil {
		return nil, stacktrace.Propagate(err, "find fallback tidak hadir error")
	}

	fallback := make([]model.Kehadiran, 0, len(rows))
	for _, row := range rows {
		verifiedDate, ok := verifiedAtDate(row.VerifiedAt)
		if !ok || verifiedDate != filter.Tanggal {
			continue
		}
		fallback = append(fallback, row)
	}

	return fallback, nil
}
