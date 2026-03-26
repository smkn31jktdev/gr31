package mongodb_outbound_adapter

import (
	"fmt"
	"reflect"
	"strings"
	"time"

	"prabogo/internal/model"
	outbound_port "prabogo/internal/port/outbound"
)

type sekolahAdapter struct {
	s *adapter
}

func NewSekolahAdapter(s *adapter) outbound_port.SekolahDatabasePort {
	return &sekolahAdapter{s: s}
}

func (a *sekolahAdapter) UpsertKegiatanByNISNAndTanggal(student model.Student, input model.KegiatanInput) (map[string]any, bool, error) {
	existing, err := a.FindKegiatanByNISNAndTanggal(student.NISN, input.Tanggal)
	if err != nil {
		return nil, false, err
	}

	now := time.Now().UTC()
	setData := map[string]any{
		"nisn":      student.NISN,
		"nama":      student.Nama,
		"kelas":     student.Kelas,
		"tanggal":   input.Tanggal,
		"updatedAt": map[string]any{"$date": now.UnixMilli()},
	}
	setData[input.Section] = input.Data

	_, err = a.s.runCommand("kebiasaan_hebat", map[string]any{
		"findOneAndUpdate": map[string]any{
			"filter": map[string]any{"nisn": student.NISN, "tanggal": input.Tanggal},
			"update": map[string]any{
				"$set":         setData,
				"$setOnInsert": map[string]any{"createdAt": map[string]any{"$date": now.UnixMilli()}},
			},
			"options": map[string]any{"upsert": true},
		},
	})
	if err != nil {
		return nil, false, err
	}

	out, err := a.FindKegiatanByNISNAndTanggal(student.NISN, input.Tanggal)
	if err != nil {
		return nil, false, err
	}
	return out, existing != nil, nil
}

func (a *sekolahAdapter) UpdateKegiatanByNISNAndTanggal(student model.Student, input model.KegiatanInput) (map[string]any, error) {
	existing, err := a.FindKegiatanByNISNAndTanggal(student.NISN, input.Tanggal)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		return nil, fmt.Errorf("data kegiatan tidak ditemukan")
	}

	now := time.Now().UTC()
	setData := map[string]any{
		"nisn":      student.NISN,
		"nama":      student.Nama,
		"kelas":     student.Kelas,
		"tanggal":   input.Tanggal,
		"updatedAt": map[string]any{"$date": now.UnixMilli()},
	}
	setData[input.Section] = input.Data

	_, err = a.s.runCommand("kebiasaan_hebat", map[string]any{
		"findOneAndUpdate": map[string]any{
			"filter": map[string]any{"nisn": student.NISN, "tanggal": input.Tanggal},
			"update": map[string]any{"$set": setData},
		},
	})
	if err != nil {
		return nil, err
	}

	out, err := a.FindKegiatanByNISNAndTanggal(student.NISN, input.Tanggal)
	if err != nil {
		return nil, err
	}
	if out == nil {
		return nil, fmt.Errorf("data kegiatan tidak ditemukan")
	}
	return out, nil
}

func (a *sekolahAdapter) FindKegiatanByNISNAndTanggal(nisn string, tanggal string) (map[string]any, error) {
	res, err := a.s.runCommand("kebiasaan_hebat", map[string]any{
		"findOne": map[string]any{"filter": map[string]any{"nisn": nisn, "tanggal": tanggal}},
	})
	if err != nil {
		return nil, err
	}
	doc := mapFrom(res, "data", "document")
	if doc == nil {
		return nil, nil
	}
	return sanitizeDoc(doc), nil
}

func (a *sekolahAdapter) DeleteKegiatanByNISNAndTanggal(nisn string, tanggal string, section string) error {
	existing, err := a.FindKegiatanByNISNAndTanggal(nisn, tanggal)
	if err != nil {
		return err
	}
	if existing == nil {
		return fmt.Errorf("data kegiatan tidak ditemukan")
	}

	if section == "" {
		_, err = a.s.runCommand("kebiasaan_hebat", map[string]any{
			"deleteOne": map[string]any{
				"filter": map[string]any{"nisn": nisn, "tanggal": tanggal},
			},
		})
		return err
	}

	if isReservedKegiatanField(section) {
		return fmt.Errorf("section tidak valid")
	}
	if _, ok := existing[section]; !ok {
		return fmt.Errorf("section kegiatan tidak ditemukan")
	}

	_, err = a.s.runCommand("kebiasaan_hebat", map[string]any{
		"findOneAndUpdate": map[string]any{
			"filter": map[string]any{"nisn": nisn, "tanggal": tanggal},
			"update": map[string]any{
				"$unset": map[string]any{section: ""},
				"$set":   map[string]any{"updatedAt": map[string]any{"$date": time.Now().UTC().UnixMilli()}},
			},
		},
	})
	return err
}

func (a *sekolahAdapter) DeleteKegiatanByNISNAndMonth(nisn string, bulan string) (int, error) {
	res, err := a.s.runCommand("kebiasaan_hebat", map[string]any{
		"deleteMany": map[string]any{
			"filter": map[string]any{
				"nisn":    nisn,
				"tanggal": map[string]any{"$regex": "^" + bulan + "-"},
			},
		},
	})
	if err != nil {
		return 0, err
	}

	data := mapFrom(res, "data")
	if data == nil {
		return 0, nil
	}
	if n, ok := data["deletedCount"].(float64); ok {
		return int(n), nil
	}
	return 0, nil
}

func (a *sekolahAdapter) FindKegiatanByFilter(filter model.KegiatanFilter) ([]map[string]any, error) {
	where := map[string]any{}
	if filter.NISN != "" {
		where["nisn"] = filter.NISN
	}
	if filter.Kelas != "" {
		where["kelas"] = filter.Kelas
	}
	if filter.Tanggal != "" {
		where["tanggal"] = filter.Tanggal
	}
	if filter.Tanggal == "" && (filter.Dari != "" || filter.Sampai != "") {
		r := map[string]any{}
		if filter.Dari != "" {
			r["$gte"] = filter.Dari
		}
		if filter.Sampai != "" {
			r["$lte"] = filter.Sampai
		}
		where["tanggal"] = r
	}

	out := make([]map[string]any, 0)
	var pageState string

	for {
		options := map[string]any{"limit": 1000}
		if pageState != "" {
			options["pageState"] = pageState
		}

		res, err := a.s.runCommand("kebiasaan_hebat", map[string]any{
			"find": map[string]any{
				"filter":  where,
				"options": options,
			},
		})
		if err != nil {
			return nil, err
		}

		raw := listFrom(res, "data", "documents")
		for _, item := range raw {
			doc, ok := item.(map[string]any)
			if !ok {
				continue
			}
			out = append(out, sanitizeDoc(doc))
		}

		dataMap, ok := res["data"].(map[string]any)
		if !ok {
			break
		}
		nextState, ok := dataMap["nextPageState"].(string)
		if !ok || nextState == "" {
			break
		}
		pageState = nextState
	}

	return out, nil
}

func (a *sekolahAdapter) FindBuktiByFilter(filter model.BuktiFilter) ([]map[string]any, error) {
	where := map[string]any{}
	if filter.NISN != "" {
		where["nisn"] = filter.NISN
	}
	if filter.Kelas != "" {
		where["kelas"] = filter.Kelas
	}
	if filter.Bulan != "" {
		where["bulan"] = filter.Bulan
	}

	out := make([]map[string]any, 0)
	var pageState string

	for {
		options := map[string]any{"limit": 1000}
		if pageState != "" {
			options["pageState"] = pageState
		}

		res, err := a.s.runCommand("bukti", map[string]any{
			"find": map[string]any{
				"filter":  where,
				"options": options,
			},
		})
		if err != nil {
			return nil, err
		}

		raw := listFrom(res, "data", "documents")
		for _, item := range raw {
			doc, ok := item.(map[string]any)
			if !ok {
				continue
			}
			normalized := sanitizeDoc(doc)

			if _, ok := normalized["linkYouTube"]; !ok {
				if legacy, exists := normalized["linkYoutube"]; exists {
					normalized["linkYouTube"] = legacy
				}
			}

			out = append(out, normalized)
		}

		dataMap, ok := res["data"].(map[string]any)
		if !ok {
			break
		}
		nextState, ok := dataMap["nextPageState"].(string)
		if !ok || nextState == "" {
			break
		}
		pageState = nextState
	}

	return out, nil
}

func (a *sekolahAdapter) UpsertBuktiByNISNAndBulan(student model.Student, bulan string, foto string, linkYouTube string) (map[string]any, error) {
	now := time.Now().UTC()
	setData := map[string]any{
		"nisn":        student.NISN,
		"nama":        student.Nama,
		"kelas":       student.Kelas,
		"bulan":       bulan,
		"foto":        foto,
		"linkYouTube": linkYouTube,
		"updatedAt":   map[string]any{"$date": now.UnixMilli()},
	}

	_, err := a.s.runCommand("bukti", map[string]any{
		"findOneAndUpdate": map[string]any{
			"filter": map[string]any{"nisn": student.NISN, "bulan": bulan},
			"update": map[string]any{
				"$set":         setData,
				"$setOnInsert": map[string]any{"createdAt": map[string]any{"$date": now.UnixMilli()}},
			},
			"options": map[string]any{"upsert": true},
		},
	})
	if err != nil {
		return nil, err
	}

	res, err := a.s.runCommand("bukti", map[string]any{
		"findOne": map[string]any{"filter": map[string]any{"nisn": student.NISN, "bulan": bulan}},
	})
	if err != nil {
		return nil, err
	}

	doc := mapFrom(res, "data", "document")
	if doc == nil {
		return nil, nil
	}
	normalized := sanitizeDoc(doc)
	if _, ok := normalized["linkYouTube"]; !ok {
		if legacy, exists := normalized["linkYoutube"]; exists {
			normalized["linkYouTube"] = legacy
		}
	}

	return normalized, nil
}

func (a *sekolahAdapter) createAduanAstra(data model.Aduan) (model.Aduan, error) {
	doc := map[string]any{
		"ticketId":      data.TicketID,
		"nisn":          data.NISN,
		"namaSiswa":     data.NamaSiswa,
		"kelas":         data.Kelas,
		"walas":         data.Walas,
		"messages":      messagesToDoc(data.Messages),
		"status":        data.Status,
		"statusHistory": statusHistoryToDoc(data.StatusHistory),
		"diteruskanKe":  data.DiteruskanKe,
		"createdAt":     data.CreatedAt,
		"updatedAt":     data.UpdatedAt,
	}

	_, err := a.s.runCommand("aduan_siswa", map[string]any{"insertOne": map[string]any{"document": doc}})
	if err != nil {
		return model.Aduan{}, err
	}

	stored, err := a.findAduanByTicketIDAstra(data.TicketID)
	if err != nil {
		return model.Aduan{}, err
	}
	if stored == nil {
		return model.Aduan{}, nil
	}
	return *stored, nil
}

func (a *sekolahAdapter) appendAduanMessageAstra(ticketID string, message model.AduanMessage, updatedAt string) (model.Aduan, error) {
	_, err := a.s.runCommand("aduan_siswa", map[string]any{
		"findOneAndUpdate": map[string]any{
			"filter": map[string]any{"ticketId": ticketID},
			"update": map[string]any{
				"$push": map[string]any{"messages": map[string]any{"id": message.ID, "from": message.From, "role": message.Role, "message": message.Message, "timestamp": message.Timestamp}},
				"$set":  map[string]any{"updatedAt": updatedAt},
			},
		},
	})
	if err != nil {
		return model.Aduan{}, err
	}

	stored, err := a.findAduanByTicketIDAstra(ticketID)
	if err != nil {
		return model.Aduan{}, err
	}
	if stored == nil {
		return model.Aduan{}, fmt.Errorf("aduan tidak ditemukan")
	}
	return *stored, nil
}

func (a *sekolahAdapter) updateAduanStatusAstra(ticketID string, status string, diteruskanKe *string, history model.AduanStatusHistory) (model.Aduan, error) {
	setData := map[string]any{"status": status, "updatedAt": history.UpdatedAt}
	if diteruskanKe != nil {
		setData["diteruskanKe"] = *diteruskanKe
	}

	_, err := a.s.runCommand("aduan_siswa", map[string]any{
		"findOneAndUpdate": map[string]any{
			"filter": map[string]any{"ticketId": ticketID},
			"update": map[string]any{
				"$set":  setData,
				"$push": map[string]any{"statusHistory": map[string]any{"status": history.Status, "updatedBy": history.UpdatedBy, "role": history.Role, "updatedAt": history.UpdatedAt, "note": history.Note}},
			},
		},
	})
	if err != nil {
		return model.Aduan{}, err
	}

	stored, err := a.findAduanByTicketIDAstra(ticketID)
	if err != nil {
		return model.Aduan{}, err
	}
	if stored == nil {
		return model.Aduan{}, fmt.Errorf("aduan tidak ditemukan")
	}
	return *stored, nil
}

func (a *sekolahAdapter) findAduanByFilterAstra(filter model.AduanFilter) ([]model.Aduan, error) {
	where := map[string]any{}
	if filter.TicketID != "" {
		where["ticketId"] = filter.TicketID
	}
	if filter.NISN != "" {
		where["nisn"] = filter.NISN
	}
	if filter.Kelas != "" {
		where["kelas"] = filter.Kelas
	}
	if filter.Status != "" {
		where["status"] = filter.Status
	}
	if filter.DiteruskanKe != "" {
		where["diteruskanKe"] = filter.DiteruskanKe
	}
	if filter.Walas != "" {
		where["walas"] = filter.Walas
	}

	limit := filter.Limit
	if limit <= 0 {
		limit = 200
	}

	res, err := a.s.runCommand("aduan_siswa", map[string]any{
		"find": map[string]any{
			"filter": where,
			"options": map[string]any{
				"limit": limit,
			},
		},
	})
	if err != nil {
		return nil, err
	}

	raw := listFrom(res, "data", "documents")
	out := make([]model.Aduan, 0, len(raw))
	for _, item := range raw {
		doc, ok := item.(map[string]any)
		if !ok {
			continue
		}
		out = append(out, toAduan(doc))
	}
	return out, nil
}

func (a *sekolahAdapter) findAduanByTicketIDAstra(ticketID string) (*model.Aduan, error) {
	res, err := a.s.runCommand("aduan_siswa", map[string]any{
		"findOne": map[string]any{"filter": map[string]any{"ticketId": ticketID}},
	})
	if err != nil {
		return nil, err
	}
	doc := mapFrom(res, "data", "document")
	if doc == nil {
		return nil, nil
	}
	parsed := toAduan(doc)
	return &parsed, nil
}

func (a *sekolahAdapter) countAduanByTicketPrefixAstra(prefix string) (int, error) {
	res, err := a.s.runCommand("aduan_siswa", map[string]any{
		"countDocuments": map[string]any{
			"filter": map[string]any{"ticketId": map[string]any{"$regex": "^" + strings.TrimSpace(prefix)}},
		},
	})
	if err != nil {
		return 0, err
	}

	data := mapFrom(res, "data")
	if data == nil {
		return 0, nil
	}
	if n, ok := data["count"].(float64); ok {
		return int(n), nil
	}
	if n, ok := data["matchedCount"].(float64); ok {
		return int(n), nil
	}
	return 0, nil
}

func messagesToDoc(messages []model.AduanMessage) []map[string]any {
	out := make([]map[string]any, 0, len(messages))
	for _, msg := range messages {
		out = append(out, map[string]any{
			"id":        msg.ID,
			"from":      msg.From,
			"role":      msg.Role,
			"message":   msg.Message,
			"timestamp": msg.Timestamp,
		})
	}
	return out
}

func statusHistoryToDoc(histories []model.AduanStatusHistory) []map[string]any {
	out := make([]map[string]any, 0, len(histories))
	for _, h := range histories {
		out = append(out, map[string]any{
			"status":    h.Status,
			"updatedBy": h.UpdatedBy,
			"role":      h.Role,
			"updatedAt": h.UpdatedAt,
			"note":      h.Note,
		})
	}
	return out
}

func toAduan(doc map[string]any) model.Aduan {
	out := model.Aduan{
		TicketID:  asString(doc["ticketId"]),
		NISN:      asString(doc["nisn"]),
		NamaSiswa: asString(doc["namaSiswa"]),
		Kelas:     asString(doc["kelas"]),
		Walas:     asString(doc["walas"]),
		Status:    asString(doc["status"]),
		CreatedAt: asString(doc["createdAt"]),
		UpdatedAt: asString(doc["updatedAt"]),
	}

	if out.CreatedAt == "" {
		if t := parseDate(doc["createdAt"]); !t.IsZero() {
			out.CreatedAt = t.UTC().Format(time.RFC3339)
		}
	}
	if out.UpdatedAt == "" {
		if t := parseDate(doc["updatedAt"]); !t.IsZero() {
			out.UpdatedAt = t.UTC().Format(time.RFC3339)
		}
	}

	if v, ok := doc["diteruskanKe"].(string); ok {
		out.DiteruskanKe = &v
	}

	rawMessages := asAnySliceAstra(doc["messages"])
	if len(rawMessages) > 0 {
		messages := make([]model.AduanMessage, 0, len(rawMessages))
		for _, item := range rawMessages {
			m := asStringMapAstra(item)
			if m == nil {
				continue
			}
			messages = append(messages, model.AduanMessage{
				ID:        asString(m["id"]),
				From:      asString(m["from"]),
				Role:      asString(m["role"]),
				Message:   asString(m["message"]),
				Timestamp: asString(m["timestamp"]),
			})
		}
		out.Messages = messages
	}

	rawHistory := asAnySliceAstra(doc["statusHistory"])
	if len(rawHistory) > 0 {
		history := make([]model.AduanStatusHistory, 0, len(rawHistory))
		for _, item := range rawHistory {
			m := asStringMapAstra(item)
			if m == nil {
				continue
			}
			history = append(history, model.AduanStatusHistory{
				Status:    asString(m["status"]),
				UpdatedBy: asString(m["updatedBy"]),
				Role:      asString(m["role"]),
				UpdatedAt: asString(m["updatedAt"]),
				Note:      asString(m["note"]),
			})
		}
		out.StatusHistory = history
	}

	return out
}

func asAnySliceAstra(v any) []any {
	switch items := v.(type) {
	case nil:
		return nil
	case []any:
		return items
	case []map[string]any:
		out := make([]any, 0, len(items))
		for _, item := range items {
			out = append(out, item)
		}
		return out
	default:
		rv := reflect.ValueOf(v)
		if rv.IsValid() && rv.Kind() == reflect.Slice {
			out := make([]any, 0, rv.Len())
			for i := 0; i < rv.Len(); i++ {
				out = append(out, rv.Index(i).Interface())
			}
			return out
		}
		return nil
	}
}

func asStringMapAstra(v any) map[string]any {
	switch m := v.(type) {
	case nil:
		return nil
	case map[string]any:
		return m
	default:
		return nil
	}
}

func sanitizeDoc(doc map[string]any) map[string]any {
	out := map[string]any{}
	for k, v := range doc {
		if k == "_id" {
			continue
		}
		if t := parseDate(v); !t.IsZero() {
			out[k] = t.UTC().Format(time.RFC3339)
			continue
		}
		out[k] = v
	}

	// Backward compatibility for legacy documents that used "ibadah"
	// before the field was standardized to "beribadah".
	if _, ok := out["beribadah"]; !ok {
		if legacy, exists := out["ibadah"]; exists {
			out["beribadah"] = legacy
		}
	}

	return out
}

func isReservedKegiatanField(field string) bool {
	switch field {
	case "_id", "nisn", "nama", "kelas", "tanggal", "createdAt", "updatedAt":
		return true
	default:
		return false
	}
}
