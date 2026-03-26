package postgres_outbound_adapter

import (
	"database/sql"
	"time"

	"github.com/doug-martin/goqu/v9"
	_ "github.com/doug-martin/goqu/v9/dialect/postgres"

	"prabogo/internal/model"
	outbound_port "prabogo/internal/port/outbound"
)

const tableKehadiran = "kehadiran"

type kehadiranAdapter struct {
	db outbound_port.DatabaseExecutor
}

func NewKehadiranAdapter(db outbound_port.DatabaseExecutor) outbound_port.KehadiranDatabasePort {
	return &kehadiranAdapter{db: db}
}

func (adapter *kehadiranAdapter) UpsertByNISNAndTanggal(data model.Kehadiran) (model.Kehadiran, bool, error) {
	record := goqu.Record{
		"nisn":               data.NISN,
		"nama":               data.Nama,
		"kelas":              data.Kelas,
		"tanggal":            data.Tanggal,
		"hari":               data.Hari,
		"status":             data.Status,
		"waktu_absen":        data.WaktuAbsen,
		"alasan_tidak_hadir": data.AlasanTidakHadir,
		"jarak":              data.Jarak,
		"akurasi":            data.Akurasi,
		"updated_by":         data.UpdatedBy,
		"updated_at":         goqu.L("NOW()"),
	}
	if data.Koordinat != nil {
		record["koordinat_lat"] = data.Koordinat.Lat
		record["koordinat_lng"] = data.Koordinat.Lng
	} else {
		record["koordinat_lat"] = nil
		record["koordinat_lng"] = nil
	}
	if data.VerifiedAt != nil {
		record["verified_at"] = *data.VerifiedAt
	}

	insertDataset := goqu.Dialect("postgres").Insert(tableKehadiran).Rows(record)
	query, _, err := insertDataset.ToSQL()
	if err != nil {
		return model.Kehadiran{}, false, err
	}
	query += ` ON CONFLICT (nisn, tanggal) DO UPDATE SET
			nama = EXCLUDED.nama,
			kelas = EXCLUDED.kelas,
			hari = EXCLUDED.hari,
			status = EXCLUDED.status,
			waktu_absen = EXCLUDED.waktu_absen,
			alasan_tidak_hadir = EXCLUDED.alasan_tidak_hadir,
			koordinat_lat = EXCLUDED.koordinat_lat,
			koordinat_lng = EXCLUDED.koordinat_lng,
			jarak = EXCLUDED.jarak,
			akurasi = EXCLUDED.akurasi,
			verified_at = EXCLUDED.verified_at,
			updated_by = EXCLUDED.updated_by,
			updated_at = NOW();`
	if _, err := adapter.db.Exec(query); err != nil {
		return model.Kehadiran{}, false, err
	}

	result, err := adapter.FindByNISNAndTanggal(data.NISN, data.Tanggal)
	if err != nil {
		return model.Kehadiran{}, false, err
	}
	if result == nil {
		return model.Kehadiran{}, false, nil
	}

	updated := !result.CreatedAt.Equal(result.UpdatedAt)
	return *result, updated, nil
}

func (adapter *kehadiranAdapter) FindByNISNAndTanggal(nisn string, tanggal string) (*model.Kehadiran, error) {
	dataset := goqu.Dialect("postgres").From(tableKehadiran).
		Where(goqu.Ex{"nisn": nisn, "tanggal": tanggal}).
		Limit(1)
	query, _, err := dataset.ToSQL()
	if err != nil {
		return nil, err
	}

	records, err := adapter.queryKehadiran(query)
	if err != nil {
		return nil, err
	}
	if len(records) == 0 {
		return nil, nil
	}
	return &records[0], nil
}

func (adapter *kehadiranAdapter) FindByNISNAndDateRange(nisn string, startDate string, endDate string) ([]model.Kehadiran, error) {
	dataset := goqu.Dialect("postgres").From(tableKehadiran).
		Where(goqu.Ex{"nisn": nisn}).
		Where(goqu.C("tanggal").Gte(startDate)).
		Where(goqu.C("tanggal").Lte(endDate)).
		Order(goqu.I("tanggal").Asc())
	query, _, err := dataset.ToSQL()
	if err != nil {
		return nil, err
	}
	return adapter.queryKehadiran(query)
}

func (adapter *kehadiranAdapter) FindByFilter(filter model.KehadiranFilter) ([]model.Kehadiran, error) {
	dataset := goqu.Dialect("postgres").From(tableKehadiran)
	if filter.Tanggal != "" {
		dataset = dataset.Where(goqu.Ex{"tanggal": filter.Tanggal})
	}
	if filter.Dari != "" {
		dataset = dataset.Where(goqu.C("tanggal").Gte(filter.Dari))
	}
	if filter.Sampai != "" {
		dataset = dataset.Where(goqu.C("tanggal").Lte(filter.Sampai))
	}
	if filter.Kelas != "" {
		dataset = dataset.Where(goqu.Ex{"kelas": filter.Kelas})
	}
	if filter.NISN != "" {
		dataset = dataset.Where(goqu.Ex{"nisn": filter.NISN})
	}
	if filter.Status != "" && filter.Status != "belum" {
		dataset = dataset.Where(goqu.Ex{"status": filter.Status})
	}

	query, _, err := dataset.Order(goqu.I("tanggal").Asc(), goqu.I("kelas").Asc(), goqu.I("nama").Asc()).ToSQL()
	if err != nil {
		return nil, err
	}
	return adapter.queryKehadiran(query)
}

func (adapter *kehadiranAdapter) queryKehadiran(query string) ([]model.Kehadiran, error) {
	rows, err := adapter.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	results := make([]model.Kehadiran, 0)
	for rows.Next() {
		var item model.Kehadiran
		var koordinatLat sql.NullFloat64
		var koordinatLng sql.NullFloat64
		var verifiedAt sql.NullTime
		if err := rows.Scan(
			&item.ID,
			&item.NISN,
			&item.Nama,
			&item.Kelas,
			&item.Tanggal,
			&item.Hari,
			&item.Status,
			&item.WaktuAbsen,
			&item.AlasanTidakHadir,
			&koordinatLat,
			&koordinatLng,
			&item.Jarak,
			&item.Akurasi,
			&verifiedAt,
			&item.UpdatedBy,
			&item.CreatedAt,
			&item.UpdatedAt,
		); err != nil {
			return nil, err
		}

		if koordinatLat.Valid && koordinatLng.Valid {
			item.Koordinat = &model.Koordinat{Lat: koordinatLat.Float64, Lng: koordinatLng.Float64}
		}
		if verifiedAt.Valid {
			formatted := verifiedAt.Time.Format(time.RFC3339)
			item.VerifiedAt = &formatted
		}
		results = append(results, item)
	}
	return results, nil
}
