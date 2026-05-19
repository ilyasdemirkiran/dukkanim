package main

import (
	"github.com/ilyasdemirkiran/dukkanim/internal/app"
	"log"
)

func main() {
	application, err := app.New()
	if err != nil {
		log.Fatalf("Uygulama başlatılamadı: %v", err)
	}

	application.Start()
}
