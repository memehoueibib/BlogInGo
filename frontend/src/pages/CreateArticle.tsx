
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';

export default function CreerArticle() {
  const [contenu, setContenu] = useState('');
  const [estEnSoumission, setEstEnSoumission] = useState(false);
  const navigate = useNavigate();
  const utilisateur = useAuthStore((state) => state.user);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utilisateur) {
      navigate('/login');
      return;
    }

    setEstEnSoumission(true);
    try {
      await api.articles.create(contenu, utilisateur.id);
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la création de l\'article:', error);
    } finally {
      setEstEnSoumission(false);
    }
  };

  if (!utilisateur) {
    navigate('/login');
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Créer un article</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Contenu
          </label>
          <textarea
            id="content"
            rows={8}
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Écrivez votre article ici..."
            required
          />
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={estEnSoumission}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {estEnSoumission ? 'Publication en cours...' : 'Publier'}
          </button>
        </div>
      </form>
    </div>
  );
}
