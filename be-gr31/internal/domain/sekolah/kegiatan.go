package sekolah

import (
	"context"
	"sort"
	"strings"
	"time"

	"github.com/palantir/stacktrace"

	"prabogo/internal/model"
)

func (d *sekolahDomain) StudentUpsertKegiatan(ctx context.Context, claims model.AuthClaims, input model.KegiatanInput) (map[string]any, bool, error) {
	if claims.NISN == "" {
		return nil, false, stacktrace.NewError("nisn tidak ditemukan pada token")
	}
	if input.Tanggal == "" {
		return nil, false, stacktrace.NewError("tanggal wajib diisi")
	}
	if input.Section == "" {
		return nil, false, stacktrace.NewError("section wajib diisi")
	}
	if len(input.Data) == 0 {
		return nil, false, stacktrace.NewError("data kegiatan wajib diisi")
	}

	student, err := d.databasePort.Auth().FindStudentByNISN(claims.NISN)
	if err != nil {
		return nil, false, stacktrace.Propagate(err, "find student by nisn error")
	}
	if student.ID == "" {
		return nil, false, stacktrace.NewError("student not found")
	}

	data, updated, err := d.databasePort.Sekolah().UpsertKegiatanByNISNAndTanggal(student, input)
	if err != nil {
		return nil, false, stacktrace.Propagate(err, "upsert kegiatan error")
	}
	return data, updated, nil
}

func (d *sekolahDomain) StudentGetKegiatan(ctx context.Context, claims model.AuthClaims, tanggal string) (map[string]any, error) {
	if claims.NISN == "" {
		return nil, stacktrace.NewError("nisn tidak ditemukan pada token")
	}
	if tanggal == "" {
		return nil, stacktrace.NewError("tanggal wajib diisi")
	}

	data, err := d.databasePort.Sekolah().FindKegiatanByNISNAndTanggal(claims.NISN, tanggal)
	if err != nil {
		return nil, stacktrace.Propagate(err, "find kegiatan by tanggal error")
	}
	return data, nil
}

func (d *sekolahDomain) StudentUpdateKegiatan(ctx context.Context, claims model.AuthClaims, input model.KegiatanInput) (map[string]any, error) {
	if claims.NISN == "" {
		return nil, stacktrace.NewError("nisn tidak ditemukan pada token")
	}
	if input.Tanggal == "" {
		return nil, stacktrace.NewError("tanggal wajib diisi")
	}
	if input.Section == "" {
		return nil, stacktrace.NewError("section wajib diisi")
	}
	if len(input.Data) == 0 {
		return nil, stacktrace.NewError("data kegiatan wajib diisi")
	}

	student, err := d.databasePort.Auth().FindStudentByNISN(claims.NISN)
	if err != nil {
		return nil, stacktrace.Propagate(err, "find student by nisn error")
	}
	if student.ID == "" {
		return nil, stacktrace.NewError("student not found")
	}

	data, err := d.databasePort.Sekolah().UpdateKegiatanByNISNAndTanggal(student, input)
	if err != nil {
		return nil, stacktrace.Propagate(err, "update kegiatan error")
	}
	return data, nil
}

func (d *sekolahDomain) StudentDeleteKegiatan(ctx context.Context, claims model.AuthClaims, tanggal string, section string) error {
	if claims.NISN == "" {
		return stacktrace.NewError("nisn tidak ditemukan pada token")
	}
	if tanggal == "" {
		return stacktrace.NewError("tanggal wajib diisi")
	}

	err := d.databasePort.Sekolah().DeleteKegiatanByNISNAndTanggal(claims.NISN, tanggal, section)
	if err != nil {
		return stacktrace.Propagate(err, "delete kegiatan error")
	}
	return nil
}

func (d *sekolahDomain) StudentUpsertBukti(ctx context.Context, claims model.AuthClaims, foto string, linkYouTube string) (map[string]any, error) {
	if claims.NISN == "" {
		return nil, stacktrace.NewError("nisn tidak ditemukan pada token")
	}
	if strings.TrimSpace(foto) == "" {
		return nil, stacktrace.NewError("foto bukti wajib diisi")
	}

	student, err := d.databasePort.Auth().FindStudentByNISN(claims.NISN)
	if err != nil {
		return nil, stacktrace.Propagate(err, "find student by nisn error")
	}
	if student.ID == "" {
		return nil, stacktrace.NewError("student not found")
	}

	month := currentJakartaMonth()
	data, err := d.databasePort.Sekolah().UpsertBuktiByNISNAndBulan(student, month, foto, strings.TrimSpace(linkYouTube))
	if err != nil {
		return nil, stacktrace.Propagate(err, "upsert bukti error")
	}

	return data, nil
}

func (d *sekolahDomain) StudentGetBukti(ctx context.Context, claims model.AuthClaims, bulan string) (map[string]any, error) {
	if claims.NISN == "" {
		return nil, stacktrace.NewError("nisn tidak ditemukan pada token")
	}

	filter := model.BuktiFilter{
		NISN:  claims.NISN,
		Bulan: bulan,
	}

	rows, err := d.databasePort.Sekolah().FindBuktiByFilter(filter)
	if err != nil {
		return nil, stacktrace.Propagate(err, "find bukti by filter error")
	}

	return map[string]any{"data": rows, "total": len(rows)}, nil
}

func (d *sekolahDomain) AdminGetKegiatan(ctx context.Context, claims model.AuthClaims, filter model.KegiatanFilter) (map[string]any, error) {
	if err := d.requireAdmin(claims); err != nil {
		return nil, err
	}
	if filter.Tanggal == "" && filter.Dari == "" && filter.Sampai == "" {
		filter.Tanggal = currentJakartaDate()
	}
	if filter.Tanggal == "" && (filter.Dari == "" || filter.Sampai == "") {
		return nil, stacktrace.NewError("parameter tanggal atau dari/sampai harus diisi")
	}

	isSuperAdmin := strings.EqualFold(strings.TrimSpace(claims.Role), "super_admin")
	if !isSuperAdmin && d.requireSuperAdmin(claims) == nil {
		isSuperAdmin = true
	}

	studentFilter := model.StudentFilter{Kelas: filter.Kelas, NISN: filter.NISN}
	if !isSuperAdmin {
		admin, err := d.databasePort.Auth().FindAdminByID(claims.ID)
		if err != nil {
			return nil, stacktrace.Propagate(err, "find admin by id error")
		}
		if admin.ID == "" {
			return nil, stacktrace.NewError("admin tidak ditemukan")
		}

		studentFilter.Walas = strings.TrimSpace(admin.Nama)
	}

	students, err := d.databasePort.Auth().FindStudentsByFilter(studentFilter)
	if err != nil {
		return nil, stacktrace.Propagate(err, "find students by filter error")
	}

	studentByNISN := map[string]model.Student{}
	for _, student := range students {
		studentByNISN[student.NISN] = student
	}

	rows, err := d.databasePort.Sekolah().FindKegiatanByFilter(filter)
	if err != nil {
		return nil, stacktrace.Propagate(err, "find kegiatan by filter error")
	}

	visibleRows := make([]map[string]any, 0, len(rows))
	for _, row := range rows {
		nisn, _ := row["nisn"].(string)
		student, ok := studentByNISN[nisn]
		if !ok {
			continue
		}

		copyRow := map[string]any{}
		for k, v := range row {
			copyRow[k] = v
		}

		copyRow["nisn"] = student.NISN
		copyRow["nama"] = student.Nama
		copyRow["kelas"] = student.Kelas
		copyRow["walas"] = student.Walas

		visibleRows = append(visibleRows, copyRow)
	}

	if filter.Tanggal != "" {
		byNISN := map[string]map[string]any{}
		for _, row := range visibleRows {
			nisn, _ := row["nisn"].(string)
			if nisn == "" {
				continue
			}

			copyRow := map[string]any{}
			for k, v := range row {
				copyRow[k] = v
			}
			byNISN[nisn] = copyRow
		}

		result := make([]map[string]any, 0, len(students))
		for _, student := range students {
			row, ok := byNISN[student.NISN]
			if !ok {
				row = map[string]any{
					"nisn":          student.NISN,
					"nama":          student.Nama,
					"kelas":         student.Kelas,
					"walas":         student.Walas,
					"tanggal":       filter.Tanggal,
					"bangunPagi":    map[string]any{},
					"beribadah":     map[string]any{},
					"makanSehat":    map[string]any{},
					"olahraga":      map[string]any{},
					"belajar":       map[string]any{},
					"bermasyarakat": map[string]any{},
					"tidur":         map[string]any{},
				}
			} else {
				row["nisn"] = student.NISN
				row["nama"] = student.Nama
				row["kelas"] = student.Kelas
				row["walas"] = student.Walas
				if _, exists := row["tanggal"]; !exists {
					row["tanggal"] = filter.Tanggal
				}
			}
			result = append(result, row)
		}

		return map[string]any{"data": result, "total": len(result)}, nil
	}

	return map[string]any{"data": visibleRows, "total": len(visibleRows)}, nil
}

func (d *sekolahDomain) AdminGetBukti(ctx context.Context, claims model.AuthClaims, filter model.BuktiFilter) (map[string]any, error) {
	if err := d.requireAdmin(claims); err != nil {
		return nil, err
	}

	rows, err := d.databasePort.Sekolah().FindBuktiByFilter(filter)
	if err != nil {
		return nil, stacktrace.Propagate(err, "find bukti by filter error")
	}

	return map[string]any{"data": rows, "total": len(rows)}, nil
}

func (d *sekolahDomain) AdminGetDeleteMonths(ctx context.Context, claims model.AuthClaims, nisn string) ([]map[string]any, error) {
	if err := d.requireAdmin(claims); err != nil {
		return nil, err
	}
	if strings.TrimSpace(nisn) == "" {
		return nil, stacktrace.NewError("nisn wajib diisi")
	}

	rows, err := d.databasePort.Sekolah().FindKegiatanByFilter(model.KegiatanFilter{NISN: nisn})
	if err != nil {
		return nil, stacktrace.Propagate(err, "find kegiatan months by nisn error")
	}

	counts := map[string]int{}
	for _, row := range rows {
		tanggal, _ := row["tanggal"].(string)
		if len(tanggal) < 7 {
			continue
		}
		bulan := tanggal[:7]
		counts[bulan]++
	}

	months := make([]string, 0, len(counts))
	for key := range counts {
		months = append(months, key)
	}
	sort.Sort(sort.Reverse(sort.StringSlice(months)))

	out := make([]map[string]any, 0, len(months))
	for _, monthKey := range months {
		out = append(out, map[string]any{
			"key":        monthKey,
			"entryCount": counts[monthKey],
		})
	}

	return out, nil
}

func (d *sekolahDomain) AdminDeleteKegiatanByMonth(ctx context.Context, claims model.AuthClaims, nisn string, bulan string) (int, error) {
	if err := d.requireAdmin(claims); err != nil {
		return 0, err
	}
	if strings.TrimSpace(nisn) == "" {
		return 0, stacktrace.NewError("nisn wajib diisi")
	}
	if !isValidMonthFormat(bulan) {
		return 0, stacktrace.NewError("format month harus YYYY-MM")
	}

	deletedCount, err := d.databasePort.Sekolah().DeleteKegiatanByNISNAndMonth(nisn, bulan)
	if err != nil {
		return 0, stacktrace.Propagate(err, "delete kegiatan by month error")
	}

	return deletedCount, nil
}

func isValidMonthFormat(value string) bool {
	if len(value) != 7 || value[4] != '-' {
		return false
	}
	_, err := time.Parse("2006-01", value)
	return err == nil
}

func currentJakartaDate() string {
	loc, err := time.LoadLocation("Asia/Jakarta")
	if err != nil {
		return time.Now().UTC().Format("2006-01-02")
	}
	return time.Now().In(loc).Format("2006-01-02")
}

func currentJakartaMonth() string {
	loc, err := time.LoadLocation("Asia/Jakarta")
	if err != nil {
		return time.Now().UTC().Format("2006-01")
	}
	return time.Now().In(loc).Format("2006-01")
}
