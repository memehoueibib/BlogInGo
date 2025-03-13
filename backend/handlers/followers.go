package handlers

import (
	"blog-api/db"
	"blog-api/models"
	"database/sql"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// GET /api/followers/:userId
func GetUserFollowers(c *fiber.Ctx) error {
	userID := c.Params("userId")

	rows, err := db.DB.Query(`
		SELECT f.id, f.follower_id, f.following_id, f.created_at,
		       u.email, u.firstname, u.lastname, u.created_at
		FROM followers f
		LEFT JOIN users u ON f.follower_id = u.id
		WHERE f.following_id = $1
		ORDER BY f.created_at DESC
	`, userID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Database error: " + err.Error()})
	}
	defer rows.Close()

	var followers []models.Follower
	for rows.Next() {
		var follower models.Follower
		var profile models.Profile
		var firstName, lastName sql.NullString

		err := rows.Scan(
			&follower.ID,
			&follower.FollowerID,
			&follower.FollowingID,
			&follower.CreatedAt,
			&profile.Email,
			&firstName,
			&lastName,
			&profile.CreatedAt,
		)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Scan error: " + err.Error()})
		}

		profile.FirstName = firstName.String
		profile.LastName = lastName.String
		follower.Follower = &profile
		followers = append(followers, follower)
	}

	return c.JSON(followers)
}

// GET /api/following/:userId
func GetUserFollowing(c *fiber.Ctx) error {
	userID := c.Params("userId")

	rows, err := db.DB.Query(`
		SELECT f.id, f.follower_id, f.following_id, f.created_at,
		       u.email, u.firstname, u.lastname, u.created_at
		FROM followers f
		LEFT JOIN users u ON f.following_id = u.id
		WHERE f.follower_id = $1
		ORDER BY f.created_at DESC
	`, userID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Database error: " + err.Error()})
	}
	defer rows.Close()

	var following []models.Follower
	for rows.Next() {
		var follow models.Follower
		var profile models.Profile
		var firstName, lastName sql.NullString

		err := rows.Scan(
			&follow.ID,
			&follow.FollowerID,
			&follow.FollowingID,
			&follow.CreatedAt,
			&profile.Email,
			&firstName,
			&lastName,
			&profile.CreatedAt,
		)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Scan error: " + err.Error()})
		}

		profile.FirstName = firstName.String
		profile.LastName = lastName.String
		follow.Following = &profile
		following = append(following, follow)
	}

	return c.JSON(following)
}

// POST /api/followers
func Follow(c *fiber.Ctx) error {
	follower := new(models.Follower)
	if err := c.BodyParser(follower); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	follower.ID = uuid.New().String()

	_, err := db.DB.Exec(`
		INSERT INTO followers (id, follower_id, following_id)
		VALUES ($1, $2, $3)
	`, follower.ID, follower.FollowerID, follower.FollowingID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not follow user: " + err.Error()})
	}

	return c.Status(201).JSON(follower)
}

// DELETE /api/followers/:id
func Unfollow(c *fiber.Ctx) error {
	followerID := c.Query("follower_id")
	followingID := c.Query("following_id")

	result, err := db.DB.Exec(`
		DELETE FROM followers
		WHERE follower_id = $1 AND following_id = $2
	`, followerID, followingID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not unfollow user: " + err.Error()})
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Follow relationship not found"})
	}

	return c.JSON(fiber.Map{"message": "Unfollowed successfully"})
}