package mongodb_outbound_adapter

import (
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	outbound_port "prabogo/internal/port/outbound"
)

type adapter struct {
	endpoint   string
	token      string
	keyspace   string
	httpClient *http.Client
}

func NewAdapter() outbound_port.DatabasePort {
	keyspace := strings.Trim(os.Getenv("ASTRA_DB_KEYSPACE"), "\"")
	if keyspace == "" {
		keyspace = "smkn31jkt"
	}

	return &adapter{
		endpoint: strings.Trim(os.Getenv("ASTRA_DB_ENDPOINT"), "\""),
		token:    strings.Trim(os.Getenv("ASTRA_DB_TOKEN"), "\""),
		keyspace: keyspace,
		httpClient: &http.Client{
			Timeout: 20 * time.Second,
		},
	}
}

func (s *adapter) validateConfig() error {
	if s.endpoint == "" {
		return fmt.Errorf("ASTRA_DB_ENDPOINT is empty")
	}
	if s.token == "" {
		return fmt.Errorf("ASTRA_DB_TOKEN is empty")
	}
	if s.keyspace == "" {
		return fmt.Errorf("ASTRA_DB_KEYSPACE is empty")
	}
	return nil
}

func (s *adapter) DoInTransaction(txFunc outbound_port.InTransaction) (out interface{}, err error) {
	return txFunc(s)
}

func (s *adapter) Client() outbound_port.ClientDatabasePort {
	return NewClientAdapter()
}

func (s *adapter) Auth() outbound_port.AuthDatabasePort {
	return NewAuthAdapter(s)
}

func (s *adapter) Kehadiran() outbound_port.KehadiranDatabasePort {
	return NewKehadiranAdapter(s)
}

func (s *adapter) Sekolah() outbound_port.SekolahDatabasePort {
	return NewSekolahAdapter(s)
}
