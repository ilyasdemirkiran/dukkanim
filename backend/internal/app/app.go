package app

import (
	"context"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/ilyasdemirkiran/dukkanim/internal/config"
	"github.com/ilyasdemirkiran/dukkanim/internal/routes"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"

	firebase "firebase.google.com/go"
	"google.golang.org/api/option"
)

type App struct {
	Router   *gin.Engine
	DB       *mongo.Database
	Firebase *firebase.App
}

func New() (*App, error) {
	// .env yükle
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️  .env dosyası bulunamadı, sistem ortam değişkenleri kullanılıyor")
	}

	// MongoDB bağlantısı
	db, err := config.ConnectDB()
	if err != nil {
		return nil, err
	}

	// Firebase bağlantısı
	ctx := context.Background()
	var firebaseApp *firebase.App

	credsFile := os.Getenv("GOOGLE_APPLICATION_CREDENTIALS")
	if credsFile != "" {
		firebaseApp, err = firebase.NewApp(ctx, nil)
	} else {
		// Fallback for local development
		b, readErr := os.ReadFile("google-services.json")
		if readErr != nil {
			return nil, readErr
		}
		opt := option.WithCredentialsJSON(b)
		firebaseApp, err = firebase.NewApp(ctx, nil, opt)
	}

	if err != nil {
		return nil, err
	}

	// Gin modu
	if os.Getenv("APP_ENV") == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.Default()

	// CORS middleware (basit)
	router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	app := &App{
		Router:   router,
		DB:       db,
		Firebase: firebaseApp,
	}

	routes.Setup(app.Router, app.DB)

	return app, nil
}

func (a *App) Start() {
	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "3001"
	}

	log.Printf("🚀 Sunucu başlatılıyor → http://localhost:%s", port)
	if err := a.Router.Run(":" + port); err != nil {
		log.Fatalf("Sunucu başlatılamadı: %v", err)
	}
}
