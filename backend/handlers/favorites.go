package handlers

import (
	"blog-api/db"
	"blog-api/models"
	"database/sql"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// GET /api/favorites/user/:id
func GetUserFavorites(c *fiber.Ctx) error {
	userID := c.Params("id")

	rows, err := db.DB.Query(`
		SELECT f.id, f.user_id, f.article_id, f.created_at,
		       a.id, a.user_id, a.content, a.likes, a.created_at,
		       u.email, u.firstname, u.lastname, u.created_at
		FROM favorites f
		LEFT JOIN articles a ON f.article_id = a.id
		LEFT JOIN users u ON a.user_id = u.id
		WHERE f.user_id = $1
		ORDER BY f.created_at DESC
	`, userID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Database error: " + err.Error()})
	}
	defer rows.Close()

	var favorites []models.Favorite
	for rows.Next() {
		var fav models.Favorite
		var article models.Article
		var author models.Profile
		var firstName, lastName sql.NullString

		err := rows.Scan(
			&fav.ID,
			&fav.ProfileID, // f.user_id
			&fav.ArticleID,
			&fav.CreatedAt,
			&article.ID,
			&article.ProfileID, // a.user_id
			&article.Content,
			&article.Likes,
			&article.CreatedAt,
			&author.Email,
			&firstName,
			&lastName,
			&author.CreatedAt,
		)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Scan error: " + err.Error()})
		}

		author.FirstName = firstName.String
		author.LastName = lastName.String
		article.Author = &author
		fav.Article = &article
		favorites = append(favorites, fav)
	}

	return c.JSON(favorites)
}

// POST /api/favorites
func AddFavorite(c *fiber.Ctx) error {
	fav := new(models.Favorite)
	if err := c.BodyParser(fav); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	fav.ID = uuid.New().String()

	_, err := db.DB.Exec(`
		INSERT INTO favorites (id, user_id, article_id)
		VALUES ($1, $2, $3)
	`, fav.ID, fav.ProfileID, fav.ArticleID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not add favorite: " + err.Error()})
	}

	return c.Status(201).JSON(fav)
}

// DELETE /api/favorites/:id
func RemoveFavorite(c *fiber.Ctx) error {
	id := c.Params("id")

	result, err := db.DB.Exec(`
		DELETE FROM favorites
		WHERE id = $1
	`, id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not remove favorite: " + err.Error()})
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Favorite not found or unauthorized"})
	}

	return c.JSON(fiber.Map{"message": "Favorite removed successfully"})
}
