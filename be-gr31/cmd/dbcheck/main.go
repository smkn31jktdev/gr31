package main

import (
	"archive/zip"
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gocql/gocql"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func main() {
	_ = godotenv.Load(".env")

	fmt.Println("=== DB Connectivity Check ===")

	mongoErr := checkMongo()
	if mongoErr != nil {
		fmt.Printf("[FAIL] MongoDB: %v\n", mongoErr)
	} else {
		fmt.Println("[OK]   MongoDB connected")
	}

	astraErr := checkAstraCQLWithGocql()
	if astraErr != nil {
		fmt.Printf("[FAIL] AstraDB (gocql/CQL): %v\n", astraErr)
	} else {
		fmt.Println("[OK]   AstraDB (gocql/CQL) connected")
	}

	astraDataAPIErr := checkAstraDataAPI()
	if astraDataAPIErr != nil {
		fmt.Printf("[WARN] AstraDB Data API HTTP check: %v\n", astraDataAPIErr)
	} else {
		fmt.Println("[OK]   AstraDB Data API endpoint reachable")
	}
}

func checkMongo() error {
	uri := os.Getenv("MONGODB_URI")
	if uri == "" {
		return fmt.Errorf("MONGODB_URI is empty")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	client, err := mongo.Connect(options.Client().ApplyURI(uri))
	if err != nil {
		return err
	}
	defer func() {
		_ = client.Disconnect(context.Background())
	}()

	if err := client.Ping(ctx, nil); err != nil {
		return err
	}

	return nil
}

func checkAstraCQLWithGocql() error {
	scbPath := strings.Trim(os.Getenv("ASTRA_SCB_PATH"), "\"")
	if scbPath == "" {
		scbPath = "./secure-connect-smkn31jkt.zip"
	}

	keyspace := strings.Trim(os.Getenv("ASTRA_DB_KEYSPACE"), "\"")
	if keyspace == "" {
		keyspace = "smkn31jkt"
	}

	token := strings.Trim(os.Getenv("ASTRA_DB_TOKEN"), "\"")
	if token == "" {
		return fmt.Errorf("ASTRA_DB_TOKEN is empty")
	}

	extractDir, err := extractSCB(scbPath)
	if err != nil {
		return err
	}
	defer func() {
		_ = os.RemoveAll(extractDir)
	}()

	confPath := filepath.Join(extractDir, "config.json")
	b, err := os.ReadFile(confPath)
	if err != nil {
		return fmt.Errorf("read scb config failed: %w", err)
	}

	var scb scbConfig
	if err := json.Unmarshal(b, &scb); err != nil {
		return fmt.Errorf("parse scb config failed: %w", err)
	}
	if scb.Host == "" || scb.CQLPort == 0 {
		return fmt.Errorf("invalid scb config: host/cql_port missing")
	}

	cluster := gocql.NewCluster(scb.Host)
	cluster.Port = scb.CQLPort
	cluster.Keyspace = keyspace
	cluster.DisableInitialHostLookup = true
	cluster.ConnectTimeout = 15 * time.Second
	cluster.Timeout = 15 * time.Second
	cluster.Authenticator = gocql.PasswordAuthenticator{Username: "token", Password: token}
	cluster.SslOpts = &gocql.SslOptions{
		Config: &tls.Config{ServerName: scb.Host},
		CaPath:                 filepath.Join(extractDir, "ca.crt"),
		CertPath:               filepath.Join(extractDir, "cert"),
		KeyPath:                filepath.Join(extractDir, "key"),
		EnableHostVerification: true,
	}

	session, err := cluster.CreateSession()
	if err != nil {
		return fmt.Errorf("session create failed: %w", err)
	}
	defer session.Close()

	var version string
	if err := session.Query("SELECT release_version FROM system.local").Scan(&version); err != nil {
		return fmt.Errorf("query failed: %w", err)
	}

	return nil
}

type scbConfig struct {
	Host     string `json:"host"`
	CQLPort  int    `json:"cql_port"`
	Keyspace string `json:"keyspace"`
}

func extractSCB(zipPath string) (string, error) {
	if _, err := os.Stat(zipPath); err != nil {
		return "", fmt.Errorf("secure connect bundle not found at %s", zipPath)
	}

	r, err := zip.OpenReader(zipPath)
	if err != nil {
		return "", fmt.Errorf("open scb zip failed: %w", err)
	}
	defer r.Close()

	dst, err := os.MkdirTemp("", "astra-scb-*")
	if err != nil {
		return "", err
	}

	for _, f := range r.File {
		target := filepath.Join(dst, f.Name)
		if f.FileInfo().IsDir() {
			if err := os.MkdirAll(target, 0o755); err != nil {
				return "", err
			}
			continue
		}

		if err := os.MkdirAll(filepath.Dir(target), 0o755); err != nil {
			return "", err
		}

		rc, err := f.Open()
		if err != nil {
			return "", err
		}

		out, err := os.Create(target)
		if err != nil {
			_ = rc.Close()
			return "", err
		}

		_, copyErr := io.Copy(out, rc)
		_ = out.Close()
		_ = rc.Close()
		if copyErr != nil {
			return "", copyErr
		}
	}

	return dst, nil
}

func checkAstraDataAPI() error {
	endpoint := strings.Trim(os.Getenv("ASTRA_DB_ENDPOINT"), "\"")
	token := strings.Trim(os.Getenv("ASTRA_DB_TOKEN"), "\"")
	if endpoint == "" || token == "" {
		return fmt.Errorf("ASTRA_DB_ENDPOINT or ASTRA_DB_TOKEN is empty")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return err
	}
	req.Header.Set("Token", token)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 500 {
		return fmt.Errorf("status code %d", resp.StatusCode)
	}
	return nil
}
