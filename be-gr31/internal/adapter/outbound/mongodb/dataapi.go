package mongodb_outbound_adapter

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"
)

func (s *adapter) runCommand(collection string, command map[string]any) (map[string]any, error) {
	if err := s.validateConfig(); err != nil {
		return nil, err
	}

	url := fmt.Sprintf("%s/api/json/v1/%s/%s", s.endpoint, s.keyspace, collection)
	body, err := json.Marshal(command)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Token", s.token)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	payload, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("astra data api status %d: %s", resp.StatusCode, string(payload))
	}

	var out map[string]any
	if err := json.Unmarshal(payload, &out); err != nil {
		return nil, err
	}
	return out, nil
}

func mapFrom(m map[string]any, keys ...string) map[string]any {
	cur := m
	for _, key := range keys {
		next, ok := cur[key].(map[string]any)
		if !ok {
			return nil
		}
		cur = next
	}
	return cur
}

func listFrom(m map[string]any, keys ...string) []any {
	if len(keys) == 0 {
		return nil
	}
	cur := m
	for i := 0; i < len(keys)-1; i++ {
		next, ok := cur[keys[i]].(map[string]any)
		if !ok {
			return nil
		}
		cur = next
	}
	arr, _ := cur[keys[len(keys)-1]].([]any)
	return arr
}

func asString(v any) string {
	s, ok := v.(string)
	if ok {
		return s
	}

	switch n := v.(type) {
	case json.Number:
		return n.String()
	case float64:
		return strconv.FormatInt(int64(n), 10)
	case float32:
		return strconv.FormatInt(int64(n), 10)
	case int:
		return strconv.Itoa(n)
	case int8:
		return strconv.FormatInt(int64(n), 10)
	case int16:
		return strconv.FormatInt(int64(n), 10)
	case int32:
		return strconv.FormatInt(int64(n), 10)
	case int64:
		return strconv.FormatInt(n, 10)
	case uint:
		return strconv.FormatUint(uint64(n), 10)
	case uint8:
		return strconv.FormatUint(uint64(n), 10)
	case uint16:
		return strconv.FormatUint(uint64(n), 10)
	case uint32:
		return strconv.FormatUint(uint64(n), 10)
	case uint64:
		return strconv.FormatUint(n, 10)
	default:
		return ""
	}
}

func asBool(v any) bool {
	b, ok := v.(bool)
	if !ok {
		return false
	}
	return b
}

func parseDate(v any) time.Time {
	m, ok := v.(map[string]any)
	if !ok {
		return time.Time{}
	}
	raw, ok := m["$date"]
	if !ok {
		return time.Time{}
	}
	f, ok := raw.(float64)
	if !ok {
		return time.Time{}
	}
	return time.UnixMilli(int64(f))
}

func parseFloatPointer(v any) *float64 {
	if v == nil {
		return nil
	}

	switch n := v.(type) {
	case float64:
		return &n
	case float32:
		out := float64(n)
		return &out
	case int:
		out := float64(n)
		return &out
	case int8:
		out := float64(n)
		return &out
	case int16:
		out := float64(n)
		return &out
	case int32:
		out := float64(n)
		return &out
	case int64:
		out := float64(n)
		return &out
	case uint:
		out := float64(n)
		return &out
	case uint8:
		out := float64(n)
		return &out
	case uint16:
		out := float64(n)
		return &out
	case uint32:
		out := float64(n)
		return &out
	case uint64:
		out := float64(n)
		return &out
	case json.Number:
		parsed, err := n.Float64()
		if err != nil {
			return nil
		}
		return &parsed
	default:
		return nil
	}
}
