package handlers

import (
	"blog-api/db"
	"github.com/gofiber/fiber/v2"
)

func GetLikeStatus(c *fiber.Ctx) error {
	articleID := c.Query("article_id")
	userID := c.Query("user_id")

	var exists bool
	err := db.DB.QueryRow(`
		SELECT EXISTS(
			SELECT 1 FROM likes 
			WHERE article_id = $1 AND user_id = $2
		)
	`, articleID, userID).Scan(&exists)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Database error"})
	}

	return c.JSON(fiber.Map{"liked": exists})
}

func GetLikesCount(c *fiber.Ctx) error {
	articleID := c.Params("id")

	var count int
	err := db.DB.QueryRow(`
		SELECT COUNT(*) FROM likes 
		WHERE article_id = $1
	`, articleID).Scan(&count)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Database error"})
	}

	return c.JSON(fiber.Map{"count": count})
}

func AddLike(c *fiber.Ctx) error {
	type LikeRequest struct {
		ArticleID string `json:"article_id"`
		UserID    string `json:"user_id"`
	}

	var req LikeRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	tx, err := db.DB.Begin()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not start transaction"})
	}
	defer tx.Rollback()

	_, err = tx.Exec(`
		INSERT INTO likes (article_id, user_id)
		VALUES ($1, $2)
		ON CONFLICT (user_id, article_id) DO NOTHING
	`, req.ArticleID, req.UserID)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not add like"})
	}

	var count int
	err = tx.QueryRow(`
		SELECT COUNT(*) FROM likes 
		WHERE article_id = $1
	`, req.ArticleID).Scan(&count)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not get like count"})
	}

	_, err = tx.Exec(`
		UPDATE articles 
		SET likes = $1 
		WHERE id = $2
	`, count, req.ArticleID)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not update article"})
	}

	if err = tx.Commit(); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not commit transaction"})
	}

	return c.JSON(fiber.Map{"likes": count})
}

func RemoveLike(c *fiber.Ctx) error {
	type LikeRequest struct {
		ArticleID string `json:"article_id"`
		UserID    string `json:"user_id"`
	}

	var req LikeRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	tx, err := db.DB.Begin()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not start transaction"})
	}
	defer tx.Rollback()

	result, err := tx.Exec(`
		DELETE FROM likes 
		WHERE article_id = $1 AND user_id = $2
	`, req.ArticleID, req.UserID)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not remove like"})
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not get affected rows"})
	}

	if rowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Like not found"})
	}

	var count int
	err = tx.QueryRow(`
		SELECT COUNT(*) FROM likes 
		WHERE article_id = $1
	`, req.ArticleID).Scan(&count)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not get like count"})
	}

	_, err = tx.Exec(`
		UPDATE articles 
		SET likes = $1 
		WHERE id = $2
	`, count, req.ArticleID)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not update article"})
	}

	if err = tx.Commit(); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not commit transaction"})
	}

	return c.JSON(fiber.Map{"likes": count})
}