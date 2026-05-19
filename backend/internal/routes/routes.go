package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/ilyasdemirkiran/dukkanim/internal/handlers"
	"go.mongodb.org/mongo-driver/mongo"
)

func Setup(r *gin.Engine, db *mongo.Database) {
	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	userHandler := handlers.NewUserHandler(db)

	// API v1
	v1 := r.Group("/api/v1")
	{
		users := v1.Group("/users")
		{
			users.GET("", userHandler.GetUsers)
			users.GET("/:id", userHandler.GetUser)
			users.POST("", userHandler.CreateUser)
			users.PUT("/:id", userHandler.UpdateUser)
			users.DELETE("/:id", userHandler.DeleteUser)
		}
	}
}
