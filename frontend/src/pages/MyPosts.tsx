import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Article, Comment } from '../types';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import ArticleCard from '../components/ArticleCard';

export default function MyPosts() {
  const [articles, setArticles] = useState<Article[]>([]);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadArticles();
  }, [user]);

  async function loadArticles() {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        author:user_id(id, email, firstname, lastname)
      `)
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading articles:', error);
      return;
    }

    setArticles(data || []);
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mes Articles</h1>
        <button
          onClick={() => navigate('/create-article')}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Nouvel article
        </button>
      </div>

      {articles.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">Vous n'avez pas encore écrit d'articles.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onUpdate={loadArticles}
            />
          ))}
        </div>
      )}
    </div>
  );
}