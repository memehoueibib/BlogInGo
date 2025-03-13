package handlers

import (
	"blog-api/db"
	"blog-api/models"
	"database/sql"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// GET /api/articles
func GetArticles(c *fiber.Ctx) error {
	rows, err := db.DB.Query(`
		SELECT a.id, a.user_id, a.content, a.likes, a.created_at,
		       u.email, u.firstname, u.lastname, u.created_at
		FROM articles a
		LEFT JOIN users u ON a.user_id = u.id
		ORDER BY a.created_at DESC
		LIMIT 5
	`)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Database error: " + err.Error()})
	}
	defer rows.Close()

	var articles []models.Article
	for rows.Next() {
		var article models.Article
		var author models.Profile
		var firstName, lastName sql.NullString

		err := rows.Scan(
			&article.ID,
			&article.UserID, 
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
		articles = append(articles, article)
	}

	return c.JSON(articles)
}

// GET /api/articles/:id
func GetArticle(c *fiber.Ctx) error {
	id := c.Params("id")
	var article models.Article
	var author models.Profile
	var firstName, lastName sql.NullString

	err := db.DB.QueryRow(`
		SELECT a.id, a.user_id, a.content, a.likes, a.created_at,
		       u.email, u.firstname, u.lastname, u.created_at
		FROM articles a
		LEFT JOIN users u ON a.user_id = u.id
		WHERE a.id = $1
	`, id).Scan(
		&article.ID,
		&article.UserID,
		&article.Content,
		&article.Likes,
		&article.CreatedAt,
		&author.Email,
		&firstName,
		&lastName,
		&author.CreatedAt,
	)

	if err == sql.ErrNoRows {
		return c.Status(404).JSON(fiber.Map{"error": "Article not found"})
	} else if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Database error: " + err.Error()})
	}

	author.FirstName = firstName.String
	author.LastName = lastName.String
	article.Author = &author
	return c.JSON(article)
}

// POST /api/articles
func CreateArticle(c *fiber.Ctx) error {
	article := new(models.Article)
	if err := c.BodyParser(article); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	article.ID = uuid.New().String()
	_, err := db.DB.Exec(`
		INSERT INTO articles (id, user_id, content, likes)
		VALUES ($1, $2, $3, $4)
	`, article.ID, article.UserID, article.Content, 0)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not create article: " + err.Error()})
	}

	return c.Status(201).JSON(article)
}

// PUT /api/articles/:id
func UpdateArticle(c *fiber.Ctx) error {
	id := c.Params("id")
	article := new(models.Article)
	if err := c.BodyParser(article); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	result, err := db.DB.Exec(`
		UPDATE articles
		SET content = $1
		WHERE id = $2 AND user_id = $3
	`, article.Content, id, article.UserID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not update article: " + err.Error()})
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Article not found or unauthorized"})
	}

	return c.JSON(fiber.Map{"message": "Article updated successfully"})
}

// DELETE /api/articles/:id
func DeleteArticle(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := c.Query("user_id") 

	result, err := db.DB.Exec(`
		DELETE FROM articles
		WHERE id = $1 AND user_id = $2
	`, id, userID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not delete article: " + err.Error()})
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Article not found or unauthorized"})
	}

	return c.JSON(fiber.Map{"message": "Article deleted successfully"})
}
