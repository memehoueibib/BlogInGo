
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Article } from '../types';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import ArticleCard from '../components/ArticleCard';
import { User as UserIcon, Users, Pencil, X } from 'lucide-react';

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<User | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstname: '',
    lastname: '',
    email: ''
  });
  const currentUser = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      loadProfile();
      loadArticles();
      if (currentUser && userId !== currentUser.id) {
        checkFollowStatus();
      }
      loadFollowCounts();
    }
  }, [userId, currentUser]);

  async function loadProfile() {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error loading profile:', error);
      return;
    }

    setProfile(data);
    setEditForm({
      firstname: data.firstname || '',
      lastname: data.lastname || '',
      email: data.email
    });
  }

  async function loadArticles() {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        author:user_id(id, email, firstname, lastname)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading articles:', error);
      return;
    }

    setArticles(data || []);
  }

  async function loadFollowCounts() {
    const { count: followers } = await supabase
      .from('followers')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);

    const { count: following } = await supabase
      .from('followers')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);

    setFollowersCount(followers || 0);
    setFollowingCount(following || 0);
  }

  async function checkFollowStatus() {
    if (!currentUser || userId === currentUser.id) return;

    const { data, error } = await supabase
      .from('followers')
      .select()
      .eq('follower_id', currentUser.id)
      .eq('following_id', userId)
      .single();

    if (!error) {
      setIsFollowing(true);
    }
  }

  async function handleFollow() {
    if (!currentUser || !userId || userId === currentUser.id) return;

    try {
      if (isFollowing) {
        await supabase
          .from('followers')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', userId);
        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
      } else {
        await supabase
          .from('followers')
          .insert({ follower_id: currentUser.id, following_id: userId });
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
    }
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser || !profile) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          firstname: editForm.firstname,
          lastname: editForm.lastname
        })
        .eq('id', currentUser.id);

      if (error) throw error;

      await loadProfile();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  }

  if (!profile) return <div>Chargement...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {isEditing ? (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Prénom
              </label>
              <input
                type="text"
                value={editForm.firstname}
                onChange={(e) => setEditForm({ ...editForm, firstname: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nom
              </label>
              <input
                type="text"
                value={editForm.lastname}
                onChange={(e) => setEditForm({ ...editForm, lastname: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={editForm.email}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Sauvegarder
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <UserIcon size={32} className="text-gray-500" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold">
                    {profile.firstname && profile.lastname
                      ? `${profile.firstname} ${profile.lastname}`
                      : profile.email}
                  </h1>
                  {currentUser && currentUser.id === userId && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-gray-500 hover:text-gray-700"
                      title="Modifier le profil"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                </div>
                <p className="text-gray-500">{profile.email}</p>
              </div>
            </div>
            {currentUser && currentUser.id !== userId && (
              <button
                onClick={handleFollow}
                className={`${
                  isFollowing ? 'bg-gray-500' : 'bg-blue-500'
                } text-white py-2 px-6 rounded-full hover:opacity-90 transition-all flex items-center space-x-2`}
              >
                <Users size={20} />
                <span>{isFollowing ? 'Ne plus suivre' : 'Suivre'}</span>
              </button>
            )}
          </div>
        )}

        <div className="flex space-x-8 border-t border-gray-200 pt-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{articles.length}</div>
            <div className="text-gray-600">Articles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{followersCount}</div>
            <div className="text-gray-600">Abonnés</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{followingCount}</div>
            <div className="text-gray-600">Abonnements</div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            onUpdate={loadArticles}
          />
        ))}
        
        {articles.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">Aucun article publié</p>
            {currentUser && currentUser.id === userId && (
              <button
                onClick={() => navigate('/create-article')}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Écrire un article
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}