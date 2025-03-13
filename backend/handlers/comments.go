package handlers

import (
	"blog-api/db"
	"blog-api/models"
	"database/sql"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// GetArticleComments - GET /api/comments/article/:id
func GetArticleComments(c *fiber.Ctx) error {
	articleID := c.Params("id")

	rows, err := db.DB.Query(`
		SELECT c.id, c.article_id, c.user_id, c.content, c.created_at,
		       u.email, u.firstname, u.lastname, u.created_at
		FROM comments c
		LEFT JOIN users u ON c.user_id = u.id
		WHERE c.article_id = $1
		ORDER BY c.created_at ASC
	`, articleID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Database error: " + err.Error()})
	}
	defer rows.Close()

	var comments []models.Comment
	for rows.Next() {
		var comment models.Comment
		var author models.Profile
		var firstName, lastName sql.NullString

		err := rows.Scan(
			&comment.ID,
			&comment.ArticleID,
			&comment.UserID,
			&comment.Content,
			&comment.CreatedAt,
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
		comment.Author = &author
		comments = append(comments, comment)
	}

	return c.JSON(comments)
}

// CreateComment - POST /api/comments
func CreateComment(c *fiber.Ctx) error {
	comment := new(models.Comment)
	if err := c.BodyParser(comment); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	comment.ID = uuid.New().String()

	_, err := db.DB.Exec(`
		INSERT INTO comments (id, article_id, user_id, content)
		VALUES ($1, $2, $3, $4)
	`, comment.ID, comment.ArticleID, comment.UserID, comment.Content)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not create comment: " + err.Error()})
	}

	return c.Status(201).JSON(comment)
}

// UpdateComment - PUT /api/comments/:id
func UpdateComment(c *fiber.Ctx) error {
	id := c.Params("id")
	comment := new(models.Comment)
	if err := c.BodyParser(comment); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	result, err := db.DB.Exec(`
		UPDATE comments
		SET content = $1
		WHERE id = $2 AND user_id = $3
	`, comment.Content, id, comment.UserID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not update comment: " + err.Error()})
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Comment not found or unauthorized"})
	}

	return c.JSON(fiber.Map{"message": "Comment updated successfully"})
}

// DeleteComment - DELETE /api/comments/:id
func DeleteComment(c *fiber.Ctx) error {
	id := c.Params("id")
	// On attend que l'id de l'utilisateur soit passé en query string, par exemple ?user_id=xxx
	userID := c.Query("user_id")

	result, err := db.DB.Exec(`
		DELETE FROM comments
		WHERE id = $1 AND user_id = $2
	`, id, userID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not delete comment: " + err.Error()})
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Comment not found or unauthorized"})
	}

	return c.JSON(fiber.Map{"message": "Comment deleted successfully"})
}
