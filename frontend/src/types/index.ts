// frontend/src/types/index.ts

export interface User {
  id: string;
  email: string;
  firstname: string | null;
  lastname: string | null;
  created_at: string;
}

export interface Article {
  id: string;
  user_id: string;
  content: string;
  likes: number;
  created_at: string;
  author?: User;
}

export interface Comment {
  id: string;
  article_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author?: User;
}

export interface Favorite {
  id: string;
  user_id: string;
  article_id: string;
  created_at: string;
  article?: Article;
}