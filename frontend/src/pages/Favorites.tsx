import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Favorite } from '../types';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import ArticleCard from '../components/ArticleCard';

export default function Favoris() {
  const [favoris, setFavoris] = useState<Favorite[]>([]);
  const [estChargement, setEstChargement] = useState(true);
  const utilisateur = useAuthStore((state) => state.user);

  useEffect(() => {
    if (utilisateur) {
      chargerFavoris();
    }
  }, [utilisateur]);

  async function chargerFavoris() {
    try {
      setEstChargement(true);
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          article:article_id(
            *,
            author:user_id(id, email, firstname, lastname)
          )
        `)
        .eq('user_id', utilisateur?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des favoris:', error);
        return;
      }

      setFavoris(data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setEstChargement(false);
    }
  }

  if (!utilisateur) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-xl text-gray-600 mb-4">Veuillez vous connecter pour voir Mes Favoris</p>
        <Link
          to="/login"
          className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mes Favoris</h1>
        <Link
          to="/"
          className="text-blue-500 hover:text-blue-600 transition-colors"
        >
          Voir Articles
        </Link>
      </div>

      {estChargement ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Chargement de Mes Favoris...</p>
        </div>
      ) : favoris.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 mb-4">Vous n'avez pas encore enregistré d'articles.</p>
          <Link
            to="/"
            className="inline-block bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Voir Articles
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {favoris.map((favori) => (
            favori.article && (
              <ArticleCard
                key={favori.id}
                article={favori.article}
                onUpdate={chargerFavoris}
              />
            )
          ))}
        </div>
      )}
    </div>
  );
}
