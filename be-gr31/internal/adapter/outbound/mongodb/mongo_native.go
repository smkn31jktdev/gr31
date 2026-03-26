package mongodb_outbound_adapter

import (
	"context"
	"os"
	"strings"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

var (
	nativeClient *mongo.Client
	nativeOnce   sync.Once
	nativeErr    error
)

// getNativeMongoClient returns a singleton native MongoDB client connected
// to the Atlas cluster referenced by MONGODB_URI.
func getNativeMongoClient() (*mongo.Client, error) {
	nativeOnce.Do(func() {
		uri := strings.Trim(os.Getenv("MONGODB_URI"), "\"")
		if uri == "" {
			nativeErr = nil // will fall back to AstraDB
			return
		}
		ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
		defer cancel()

		client, err := mongo.Connect(options.Client().ApplyURI(uri))
		if err != nil {
			nativeErr = err
			return
		}
		if err := client.Ping(ctx, nil); err != nil {
			nativeErr = err
			return
		}
		nativeClient = client
	})
	return nativeClient, nativeErr
}

// getAduanCollection returns the aduan_siswa collection from MongoDB Atlas.
func getAduanCollection() (*mongo.Collection, error) {
	client, err := getNativeMongoClient()
	if err != nil {
		return nil, err
	}
	if client == nil {
		return nil, nil // no native mongo configured
	}
	dbName := strings.Trim(os.Getenv("MONGODB_DB"), "\"")
	if dbName == "" {
		dbName = "smkn31jkt"
	}
	return client.Database(dbName).Collection("aduan_siswa"), nil
}
