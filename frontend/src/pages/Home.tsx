import React, { useEffect, useState } from 'react';
import { Article } from '../types';
import { useAuthStore } from '../store/authStore';
import ArticleCard from '../components/ArticleCard';
import { api } from '../lib/api';

export default function Accueil() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [estChargement, setEstChargement] = useState(true);
  const utilisateur = useAuthStore((state) => state.user);

  useEffect(() => {
    chargerArticles();
  }, []);

  async function chargerArticles() {
    try {
      setEstChargement(true);
      const data = await api.articles.getAll();
      setArticles(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des articles :', error);
    } finally {
      setEstChargement(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Articles Récents</h1>
        {!utilisateur && (
          <p className="text-gray-600">
            <a href="/login" className="text-blue-500 hover:text-blue-600">Connectez-vous</a>
            {' '}pour interagir avec les articles
          </p>
        )}
      </div>

      {estChargement ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement des articles...</p>
        </div>
      ) : articles.length > 0 ? (
        <div className="space-y-6">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onUpdate={chargerArticles}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-600">Aucun article trouvé</p>
        </div>
      )}
    </div>
  );
}
