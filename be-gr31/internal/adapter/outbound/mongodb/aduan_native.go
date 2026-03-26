package mongodb_outbound_adapter

import (
	"context"
	"fmt"
	"reflect"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"prabogo/internal/model"
)

// ─── Aduan operations via native MongoDB Atlas driver ───

func (a *sekolahAdapter) CreateAduan(data model.Aduan) (model.Aduan, error) {
	coll, err := getAduanCollection()
	if err != nil {
		return model.Aduan{}, fmt.Errorf("mongo native: %w", err)
	}
	if coll == nil {
		return a.createAduanAstra(data)
	}

	doc := bson.M{
		"ticketId":      data.TicketID,
		"nisn":          data.NISN,
		"namaSiswa":     data.NamaSiswa,
		"kelas":         data.Kelas,
		"walas":         data.Walas,
		"messages":      nativeMsgsToBson(data.Messages),
		"status":        data.Status,
		"statusHistory": nativeHistToBson(data.StatusHistory),
		"createdAt":     data.CreatedAt,
		"updatedAt":     data.UpdatedAt,
	}
	if data.DiteruskanKe != nil {
		doc["diteruskanKe"] = *data.DiteruskanKe
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_, err = coll.InsertOne(ctx, doc)
	if err != nil {
		return model.Aduan{}, err
	}

	stored, err := a.FindAduanByTicketID(data.TicketID)
	if err != nil {
		return model.Aduan{}, err
	}
	if stored == nil {
		return data, nil
	}
	return *stored, nil
}

func (a *sekolahAdapter) AppendAduanMessage(ticketID string, message model.AduanMessage, updatedAt string) (model.Aduan, error) {
	coll, err := getAduanCollection()
	if err != nil {
		return model.Aduan{}, fmt.Errorf("mongo native: %w", err)
	}
	if coll == nil {
		return a.appendAduanMessageAstra(ticketID, message, updatedAt)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{"ticketId": ticketID}
	update := bson.M{
		"$push": bson.M{"messages": bson.M{
			"id":        message.ID,
			"from":      message.From,
			"role":      message.Role,
			"message":   message.Message,
			"timestamp": message.Timestamp,
		}},
		"$set": bson.M{"updatedAt": updatedAt},
	}

	_, err = coll.UpdateOne(ctx, filter, update)
	if err != nil {
		return model.Aduan{}, err
	}

	stored, err := a.FindAduanByTicketID(ticketID)
	if err != nil {
		return model.Aduan{}, err
	}
	if stored == nil {
		return model.Aduan{}, fmt.Errorf("aduan tidak ditemukan")
	}
	return *stored, nil
}

func (a *sekolahAdapter) UpdateAduanStatus(ticketID string, status string, diteruskanKe *string, history model.AduanStatusHistory) (model.Aduan, error) {
	coll, err := getAduanCollection()
	if err != nil {
		return model.Aduan{}, fmt.Errorf("mongo native: %w", err)
	}
	if coll == nil {
		return a.updateAduanStatusAstra(ticketID, status, diteruskanKe, history)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	setData := bson.M{"status": status, "updatedAt": history.UpdatedAt}
	if diteruskanKe != nil {
		setData["diteruskanKe"] = *diteruskanKe
	}

	histDoc := bson.M{
		"status":    history.Status,
		"updatedBy": history.UpdatedBy,
		"role":      history.Role,
		"updatedAt": history.UpdatedAt,
		"note":      history.Note,
	}

	filter := bson.M{"ticketId": ticketID}
	update := bson.M{
		"$set":  setData,
		"$push": bson.M{"statusHistory": histDoc},
	}

	_, err = coll.UpdateOne(ctx, filter, update)
	if err != nil {
		return model.Aduan{}, err
	}

	stored, err := a.FindAduanByTicketID(ticketID)
	if err != nil {
		return model.Aduan{}, err
	}
	if stored == nil {
		return model.Aduan{}, fmt.Errorf("aduan tidak ditemukan")
	}
	return *stored, nil
}

func (a *sekolahAdapter) FindAduanByFilter(filter model.AduanFilter) ([]model.Aduan, error) {
	coll, err := getAduanCollection()
	if err != nil {
		return nil, fmt.Errorf("mongo native: %w", err)
	}
	if coll == nil {
		return a.findAduanByFilterAstra(filter)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	where := bson.M{}
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
		where["walas"] = bson.M{"$regex": "(?i)^" + strings.TrimSpace(filter.Walas) + "$"}
	}

	limit := int64(filter.Limit)
	if limit <= 0 {
		limit = 200
	}

	opts := options.Find().SetLimit(limit).SetSort(bson.M{"createdAt": -1})
	cursor, err := coll.Find(ctx, where, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []bson.M
	if err := cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	out := make([]model.Aduan, 0, len(results))
	for _, doc := range results {
		out = append(out, bsonToAduan(doc))
	}
	return out, nil
}

func (a *sekolahAdapter) FindAduanByTicketID(ticketID string) (*model.Aduan, error) {
	coll, err := getAduanCollection()
	if err != nil {
		return nil, fmt.Errorf("mongo native: %w", err)
	}
	if coll == nil {
		return a.findAduanByTicketIDAstra(ticketID)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var doc bson.M
	err = coll.FindOne(ctx, bson.M{"ticketId": ticketID}).Decode(&doc)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}

	parsed := bsonToAduan(doc)
	return &parsed, nil
}

func (a *sekolahAdapter) CountAduanByTicketPrefix(prefix string) (int, error) {
	coll, err := getAduanCollection()
	if err != nil {
		return 0, fmt.Errorf("mongo native: %w", err)
	}
	if coll == nil {
		return a.countAduanByTicketPrefixAstra(prefix)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{"ticketId": bson.M{"$regex": "^" + strings.TrimSpace(prefix)}}
	count, err := coll.CountDocuments(ctx, filter)
	if err != nil {
		return 0, err
	}
	return int(count), nil
}

// ─── BSON helpers ───

func bsonToAduan(doc bson.M) model.Aduan {
	out := model.Aduan{
		TicketID:  bsonStr(doc["ticketId"]),
		NISN:      bsonStr(doc["nisn"]),
		NamaSiswa: bsonStr(doc["namaSiswa"]),
		Kelas:     bsonStr(doc["kelas"]),
		Walas:     bsonStr(doc["walas"]),
		Status:    bsonStr(doc["status"]),
		CreatedAt: bsonDateStr(doc["createdAt"]),
		UpdatedAt: bsonDateStr(doc["updatedAt"]),
	}

	if v := bsonStr(doc["diteruskanKe"]); v != "" {
		out.DiteruskanKe = &v
	}

	rawMessages := asAnySlice(doc["messages"])
	if len(rawMessages) > 0 {
		messages := make([]model.AduanMessage, 0, len(rawMessages))
		for _, item := range rawMessages {
			m := asStringMap(item)
			if m == nil {
				continue
			}
			messages = append(messages, model.AduanMessage{
				ID:        bsonStr(m["id"]),
				From:      bsonStr(m["from"]),
				Role:      bsonStr(m["role"]),
				Message:   bsonStr(m["message"]),
				Timestamp: bsonDateStr(m["timestamp"]),
			})
		}
		out.Messages = messages
	}

	rawHistory := asAnySlice(doc["statusHistory"])
	if len(rawHistory) > 0 {
		history := make([]model.AduanStatusHistory, 0, len(rawHistory))
		for _, item := range rawHistory {
			m := asStringMap(item)
			if m == nil {
				continue
			}
			history = append(history, model.AduanStatusHistory{
				Status:    bsonStr(m["status"]),
				UpdatedBy: bsonStr(m["updatedBy"]),
				Role:      bsonStr(m["role"]),
				UpdatedAt: bsonDateStr(m["updatedAt"]),
				Note:      bsonStr(m["note"]),
			})
		}
		out.StatusHistory = history
	}

	return out
}

func asAnySlice(v any) []any {
	switch items := v.(type) {
	case nil:
		return nil
	case []any:
		return items
	case []bson.M:
		out := make([]any, 0, len(items))
		for _, item := range items {
			out = append(out, item)
		}
		return out
	case []map[string]any:
		out := make([]any, 0, len(items))
		for _, item := range items {
			out = append(out, item)
		}
		return out
	case bson.A:
		return []any(items)
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

func asStringMap(v any) map[string]any {
	switch m := v.(type) {
	case nil:
		return nil
	case map[string]any:
		return m
	case bson.M:
		return map[string]any(m)
	case bson.D:
		out := map[string]any{}
		for _, item := range m {
			out[item.Key] = item.Value
		}
		return out
	default:
		return nil
	}
}

func bsonStr(v any) string {
	if v == nil {
		return ""
	}
	if s, ok := v.(string); ok {
		return s
	}
	return fmt.Sprintf("%v", v)
}

func bsonDateStr(v any) string {
	if v == nil {
		return ""
	}
	if s, ok := v.(string); ok {
		return s
	}
	if t, ok := v.(time.Time); ok {
		return t.UTC().Format(time.RFC3339)
	}
	// bson.DateTime / primitive.DateTime
	if t, ok := v.(bson.DateTime); ok {
		return t.Time().UTC().Format(time.RFC3339)
	}
	return fmt.Sprintf("%v", v)
}

func nativeMsgsToBson(messages []model.AduanMessage) bson.A {
	out := bson.A{}
	for _, msg := range messages {
		out = append(out, bson.M{
			"id":        msg.ID,
			"from":      msg.From,
			"role":      msg.Role,
			"message":   msg.Message,
			"timestamp": msg.Timestamp,
		})
	}
	return out
}

func nativeHistToBson(histories []model.AduanStatusHistory) bson.A {
	out := bson.A{}
	for _, h := range histories {
		out = append(out, bson.M{
			"status":    h.Status,
			"updatedBy": h.UpdatedBy,
			"role":      h.Role,
			"updatedAt": h.UpdatedAt,
			"note":      h.Note,
		})
	}
	return out
}
