package config

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

func ConnectDB() (*mongo.Database, error) {
	uri := os.Getenv("MONGO_URI")
	if uri == "" {
		return nil, fmt.Errorf("MONGO_URI ortam değişkeni tanımlı değil")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return nil, fmt.Errorf("MongoDB bağlantı hatası: %v", err)
	}

	if err := client.Ping(ctx, readpref.Primary()); err != nil {
		return nil, fmt.Errorf("MongoDB ping hatası: %v", err)
	}

	dbName := os.Getenv("MONGO_DB")
	if dbName == "" {
		dbName = "myapp"
	}

	db := client.Database(dbName)
	log.Printf("✅ MongoDB bağlantısı başarılı → veritabanı: %s", dbName)

	return db, nil
}
