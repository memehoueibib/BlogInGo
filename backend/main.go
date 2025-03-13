package main

import (
	"blog-api/db"
	"blog-api/handlers"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}

	db.Init()

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	api := app.Group("/api")

	// Users routes
	users := api.Group("/users")
	users.Post("/", handlers.CreateUser)
	users.Get("/:id", handlers.GetUser)
	users.Put("/:id", handlers.UpdateUser)


	// Articles routes
	articles := api.Group("/articles")
	articles.Get("/", handlers.GetArticles)
	articles.Get("/:id", handlers.GetArticle)
	articles.Post("/", handlers.CreateArticle)
	articles.Put("/:id", handlers.UpdateArticle)
	articles.Delete("/:id", handlers.DeleteArticle)

	// Comments routes
	comments := api.Group("/comments")
	comments.Get("/article/:id", handlers.GetArticleComments)
	comments.Post("/", handlers.CreateComment)
	comments.Put("/:id", handlers.UpdateComment)
	comments.Delete("/:id", handlers.DeleteComment)

	// Favorites routes
	favorites := api.Group("/favorites")
	favorites.Get("/user/:id", handlers.GetUserFavorites)
	favorites.Post("/", handlers.AddFavorite)
	favorites.Delete("/:id", handlers.RemoveFavorite)

	// Followers routes
	followers := api.Group("/followers")
	followers.Get("/:userId", handlers.GetUserFollowers)
	followers.Get("/following/:userId", handlers.GetUserFollowing)
	followers.Post("/", handlers.Follow)
	followers.Delete("/", handlers.Unfollow)

	// Likes routes
	likes := api.Group("/likes")
	likes.Get("/status", handlers.GetLikeStatus)
	likes.Get("/count/:id", handlers.GetLikesCount)
	likes.Post("/", handlers.AddLike)
	likes.Delete("/", handlers.RemoveLike)

	port := os.Getenv("PORT")
	if port == "" {
		port = "4000"
	}

	log.Fatal(app.Listen(":" + port))
}