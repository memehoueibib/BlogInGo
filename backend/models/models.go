package models

import "time"


type User struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	FirstName string    `json:"firstname,omitempty"`
	LastName  string    `json:"lastname,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

type Profile struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	FirstName string    `json:"firstname,omitempty"`
	LastName  string    `json:"lastname,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

type Article struct {
	ID        string    `json:"id"`
	ProfileID string    `json:"profile_id"`
	Content   string    `json:"content"`
	UserID    string    `json:"user_id"` 
	Likes     int       `json:"likes"`
	CreatedAt time.Time `json:"created_at"`
	Author    *Profile  `json:"author,omitempty"`
}

type Comment struct {
	ID        string    `json:"id"`
	ArticleID string    `json:"article_id"`
	ProfileID string    `json:"profile_id"`
	Content   string    `json:"content"`
	UserID    string    `json:"user_id"`
	CreatedAt time.Time `json:"created_at"`
	Author    *Profile  `json:"author,omitempty"`
}

type Favorite struct {
	ID        string    `json:"id"`
	ProfileID string    `json:"profile_id"`
	ArticleID string    `json:"article_id"`
	UserID    string    `json:"user_id"` 
	CreatedAt time.Time `json:"created_at"`
	Article   *Article  `json:"article,omitempty"`
}

type Follower struct {
	ID          string    `json:"id"`
	FollowerID  string    `json:"follower_id"`
	FollowingID string    `json:"following_id"`
	CreatedAt   time.Time `json:"created_at"`
	Follower    *Profile  `json:"follower,omitempty"`
	Following   *Profile  `json:"following,omitempty"`
}