package mongodb_outbound_adapter

import (
	"fmt"
	"strings"
	"time"

	"prabogo/internal/model"
	outbound_port "prabogo/internal/port/outbound"
)

type kehadiranAdapter struct {
	s *adapter
}

func NewKehadiranAdapter(s *adapter) outbound_port.KehadiranDatabasePort {
	return &kehadiranAdapter{s: s}
}

func (a *kehadiranAdapter) UpsertByNISNAndTanggal(data model.Kehadiran) (model.Kehadiran, bool, error) {
	filter := map[string]any{"nisn": data.NISN, "tanggal": data.Tanggal}
	setData := map[string]any{
		"nisn":             data.NISN,
		"nama":             data.Nama,
		"kelas":            data.Kelas,
		"tanggal":          data.Tanggal,
		"hari":             data.Hari,
		"status":           data.Status,
		"waktuAbsen":       data.WaktuAbsen,
		"alasanTidakHadir": data.AlasanTidakHadir,
		"jarak":            data.Jarak,
		"akurasi":          data.Akurasi,
		"updatedBy":        data.UpdatedBy,
		"updatedAt":        map[string]any{"$date": time.Now().UnixMilli()},
	}
	if data.Koordinat != nil {
		setData["koordinat"] = map[string]any{"lat": data.Koordinat.Lat, "lng": data.Koordinat.Lng}
	}
	if data.VerifiedAt != nil {
		setData["verifiedAt"] = *data.VerifiedAt
	}

	_, err := a.s.runCommand("kehadiran", map[string]any{
		"findOneAndUpdate": map[string]any{
			"filter":  filter,
			"update":  map[string]any{"$set": setData, "$setOnInsert": map[string]any{"createdAt": map[string]any{"$date": time.Now().UnixMilli()}}},
			"options": map[string]any{"upsert": true},
		},
	})
	if err != nil {
		return model.Kehadiran{}, false, err
	}

	out, err := a.FindByNISNAndTanggal(data.NISN, data.Tanggal)
	if err != nil {
		return model.Kehadiran{}, false, err
	}
	if out == nil {
		return model.Kehadiran{}, false, nil
	}
	return *out, true, nil
}

func (a *kehadiranAdapter) FindByNISNAndTanggal(nisn string, tanggal string) (*model.Kehadiran, error) {
	res, err := a.s.runCommand("kehadiran", map[string]any{"findOne": map[string]any{"filter": map[string]any{"nisn": nisn, "tanggal": tanggal}}})
	if err != nil {
		return nil, err
	}
	doc := mapFrom(res, "data", "document")
	if doc == nil {
		return nil, nil
	}
	parsed := toKehadiran(doc)
	return &parsed, nil
}

func (a *kehadiranAdapter) FindByNISNAndDateRange(nisn string, startDate string, endDate string) ([]model.Kehadiran, error) {
	filter := map[string]any{
		"nisn": nisn,
		"tanggal": map[string]any{
			"$gte": startDate,
			"$lte": endDate,
		},
	}
	return a.findMany(filter)
}

func (a *kehadiranAdapter) FindByFilter(filter model.KehadiranFilter) ([]model.Kehadiran, error) {
	where := map[string]any{}
	if filter.Tanggal != "" {
		where["tanggal"] = filter.Tanggal
	}
	if filter.Dari != "" || filter.Sampai != "" {
		rangeFilter := map[string]any{}
		if filter.Dari != "" {
			rangeFilter["$gte"] = filter.Dari
		}
		if filter.Sampai != "" {
			rangeFilter["$lte"] = filter.Sampai
		}
		where["tanggal"] = rangeFilter
	}
	if filter.Kelas != "" {
		where["kelas"] = filter.Kelas
	}
	if filter.NISN != "" {
		where["nisn"] = filter.NISN
	}
	if filter.Status != "" && filter.Status != "belum" {
		normalizedStatus := strings.ToLower(strings.TrimSpace(filter.Status))
		switch normalizedStatus {
		case "izin", "sakit", "alpa", "tanpa_keterangan", "tanpa ket", "tanpa_ket", "tanpa-keterangan":
			where["status"] = "tidak_hadir"
		default:
			where["status"] = filter.Status
		}
	}
	return a.findMany(where)
}

func (a *kehadiranAdapter) findMany(filter map[string]any) ([]model.Kehadiran, error) {
	res, err := a.s.runCommand("kehadiran", map[string]any{
		"find": map[string]any{
			"filter":  filter,
			"options": map[string]any{"limit": 5000},
		},
	})
	if err != nil {
		return nil, err
	}

	raw := listFrom(res, "data", "documents")
	out := make([]model.Kehadiran, 0, len(raw))
	for _, item := range raw {
		doc, ok := item.(map[string]any)
		if !ok {
			continue
		}
		out = append(out, toKehadiran(doc))
	}
	return out, nil
}

func toKehadiran(doc map[string]any) model.Kehadiran {
	if doc == nil {
		return model.Kehadiran{}
	}
	var koordinat *model.Koordinat
	if raw, ok := doc["koordinat"].(map[string]any); ok {
		lat, latOK := raw["lat"].(float64)
		lng, lngOK := raw["lng"].(float64)
		if latOK && lngOK {
			koordinat = &model.Koordinat{Lat: lat, Lng: lng}
		}
	}

	var verifiedAt *string
	if v, ok := doc["verifiedAt"].(string); ok {
		verifiedAt = &v
	}

	return model.Kehadiran{
		NISN:             asString(doc["nisn"]),
		Nama:             asString(doc["nama"]),
		Kelas:            asString(doc["kelas"]),
		Tanggal:          asString(doc["tanggal"]),
		Hari:             asString(doc["hari"]),
		Status:           asString(doc["status"]),
		WaktuAbsen:       asString(doc["waktuAbsen"]),
		AlasanTidakHadir: asString(doc["alasanTidakHadir"]),
		Koordinat:        koordinat,
		Jarak:            parseFloatPointer(doc["jarak"]),
		Akurasi:          parseFloatPointer(doc["akurasi"]),
		VerifiedAt:       verifiedAt,
		UpdatedBy:        asString(doc["updatedBy"]),
		CreatedAt:        parseDate(doc["createdAt"]),
		UpdatedAt:        parseDate(doc["updatedAt"]),
	}
}

var _ = fmt.Sprintf
