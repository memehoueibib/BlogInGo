package handlers

import (
	"blog-api/db"
	"blog-api/models"
	"database/sql"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func CreateUser(c *fiber.Ctx) error {
	user := new(models.User)
	if err := c.BodyParser(user); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if user.Email == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Email is required",
		})
	}

	user.ID = uuid.New().String()

	tx, err := db.DB.Begin()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Could not start transaction",
		})
	}
	defer tx.Rollback()

	var existingID string
	err = tx.QueryRow("SELECT id FROM users WHERE email = $1", user.Email).Scan(&existingID)
	if err != nil && err != sql.ErrNoRows {
		return c.Status(500).JSON(fiber.Map{
			"error": "Database error",
		})
	}
	if existingID != "" {
		return c.Status(409).JSON(fiber.Map{
			"error": "Email already exists",
		})
	}

	_, err = tx.Exec(`
		INSERT INTO users (id, email, firstname, lastname)
		VALUES ($1, $2, $3, $4)
	`, user.ID, user.Email, user.FirstName, user.LastName)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Could not create user",
		})
	}

	if err = tx.Commit(); err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Could not commit transaction",
		})
	}

	return c.Status(201).JSON(user)
}

func GetUser(c *fiber.Ctx) error {
	id := c.Params("id")
	user := new(models.User)

	err := db.DB.QueryRow(`
		SELECT id, email, firstname, lastname, created_at
		FROM users
		WHERE id = $1
	`, id).Scan(&user.ID, &user.Email, &user.FirstName, &user.LastName, &user.CreatedAt)

	if err == sql.ErrNoRows {
		return c.Status(404).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Database error",
		})
	}

	return c.JSON(user)
}

func UpdateUser(c *fiber.Ctx) error {
	id := c.Params("id")
	user := new(models.User)
	if err := c.BodyParser(user); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	result, err := db.DB.Exec(`
		UPDATE users
		SET firstname = $1, lastname = $2
		WHERE id = $3
	`, user.FirstName, user.LastName, id)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Could not update user",
		})
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Could not get affected rows",
		})
	}

	if rowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	return c.JSON(fiber.Map{
		"message": "User updated successfully",
	})
}
