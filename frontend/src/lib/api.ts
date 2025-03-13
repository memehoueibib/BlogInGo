import { Article, Comment, Favorite } from '../types';
import { supabase } from './supabase';

export const api = {
  articles: {
    getAll: async (): Promise<Article[]> => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          author:user_id (id, email, firstname, lastname)
        `)
        .order('created_at', { ascending: false });

      if (error) throw new Error('Failed to fetch articles');
      return data || [];
    },

    get: async (id: string): Promise<Article> => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          author:user_id (id, email, firstname, lastname)
        `)
        .eq('id', id)
        .single();

      if (error) throw new Error('Failed to fetch article');
      return data;
    },

    create: async (content: string, userId: string): Promise<Article> => {
      const { data, error } = await supabase
        .from('articles')
        .insert({ content, user_id: userId })
        .select()
        .single();

      if (error) throw new Error('Failed to create article');
      return data;
    },

    update: async (id: string, content: string, userId: string): Promise<void> => {
      const { error } = await supabase
        .from('articles')
        .update({ content })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw new Error('Failed to update article');
    },

    delete: async (id: string, userId: string): Promise<void> => {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw new Error('Failed to delete article');
    },
  },

  comments: {
    getByArticle: async (articleId: string): Promise<Comment[]> => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          author:user_id (id, email, firstname, lastname)
        `)
        .eq('article_id', articleId)
        .order('created_at', { ascending: true });

      if (error) throw new Error('Failed to fetch comments');
      return data || [];
    },

    create: async (articleId: string, content: string, userId: string): Promise<Comment> => {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          article_id: articleId,
          user_id: userId,
          content,
        })
        .select()
        .single();

      if (error) throw new Error('Failed to create comment');
      return data;
    },

    update: async (id: string, content: string, userId: string): Promise<void> => {
      const { error } = await supabase
        .from('comments')
        .update({ content })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw new Error('Failed to update comment');
    },

    delete: async (id: string, userId: string): Promise<void> => {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw new Error('Failed to delete comment');
    },
  },

  likes: {
    add: async (articleId: string, userId: string): Promise<{ likes: number }> => {
      const { error: insertError } = await supabase
        .from('likes')
        .insert({ article_id: articleId, user_id: userId });

      if (insertError) throw new Error('Failed to like article');

      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('article_id', articleId);

      const { error: updateError } = await supabase
        .from('articles')
        .update({ likes: count })
        .eq('id', articleId);

      if (updateError) throw new Error('Failed to update article likes count');

      return { likes: count || 0 };
    },

    remove: async (articleId: string, userId: string): Promise<{ likes: number }> => {
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('article_id', articleId)
        .eq('user_id', userId);

      if (deleteError) throw new Error('Failed to unlike article');

      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('article_id', articleId);

      const { error: updateError } = await supabase
        .from('articles')
        .update({ likes: count })
        .eq('id', articleId);

      if (updateError) throw new Error('Failed to update article likes count');

      return { likes: count || 0 };
    },

    checkStatus: async (articleId: string, userId: string): Promise<boolean> => {
      const { data, error } = await supabase
        .from('likes')
        .select()
        .eq('article_id', articleId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    },

    getCount: async (articleId: string): Promise<number> => {
      const { count, error } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('article_id', articleId);

      if (error) throw new Error('Failed to get likes count');
      return count || 0;
    },
  },

  favorites: {
    getByUser: async (userId: string): Promise<Favorite[]> => {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          article:article_id (
            *,
            author:user_id (id, email, firstname, lastname)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw new Error('Failed to fetch favorites');
      return data || [];
    },

    add: async (articleId: string, userId: string): Promise<void> => {
      const { error } = await supabase
        .from('favorites')
        .insert({
          article_id: articleId,
          user_id: userId
        });

      if (error) throw new Error('Failed to add favorite');
    },

    remove: async (articleId: string, userId: string): Promise<void> => {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('article_id', articleId)
        .eq('user_id', userId);

      if (error) throw new Error('Failed to remove favorite');
    },
  },
};