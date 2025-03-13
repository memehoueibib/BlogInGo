import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Bookmark, ArrowLeft, User } from 'lucide-react';
import { Article } from '../types';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';

interface ArticleCardProps {
  article: Article;
  showBackButton?: boolean;
  onUpdate?: () => void;
  onLike?: (articleId: string) => Promise<void>;
  onFavorite?: (articleId: string) => Promise<void>;
}

export default function ArticleCard({ 
  article, 
  showBackButton = false, 
  onUpdate,
  onLike: externalOnLike,
  onFavorite: externalOnFavorite 
}: ArticleCardProps) {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = React.useState(false);
  const [isFavorited, setIsFavorited] = React.useState(false);
  const [likesCount, setLikesCount] = React.useState(article.likes || 0);
  const [commentsCount, setCommentsCount] = React.useState(0);

  React.useEffect(() => {
    if (user) {
      checkLikeStatus();
      checkFavoriteStatus();
    }
    fetchCommentsCount();
    fetchLikesCount();
  }, [article.id, user]);

  const fetchCommentsCount = async () => {
    const comments = await api.comments.getByArticle(article.id);
    setCommentsCount(comments.length);
  };

  const fetchLikesCount = async () => {
    try {
      const count = await api.likes.getCount(article.id);
      setLikesCount(count);
    } catch (error) {
      console.error('Error fetching likes count:', error);
    }
  };

  const checkLikeStatus = async () => {
    if (!user) return;
    try {
      const isLiked = await api.likes.checkStatus(article.id, user.id);
      setIsLiked(isLiked);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const checkFavoriteStatus = async () => {
    if (!user) return;
    const favorites = await api.favorites.getByUser(user.id);
    setIsFavorited(favorites.some(fav => fav.article_id === article.id));
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (externalOnLike) {
        await externalOnLike(article.id);
      } else {
        let response;
        if (isLiked) {
          response = await api.likes.remove(article.id, user.id);
        } else {
          response = await api.likes.add(article.id, user.id);
        }
        setLikesCount(response.likes);
        setIsLiked(!isLiked);
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const handleFavorite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (externalOnFavorite) {
        await externalOnFavorite(article.id);
      } else {
        if (isFavorited) {
          await api.favorites.remove(article.id, user.id);
        } else {
          await api.favorites.add(article.id, user.id);
        }
        setIsFavorited(!isFavorited);
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Error handling favorite:', error);
    }
  };

  return (
    <article className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg">
      {showBackButton && (
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour
        </button>
      )}
      
      <div className="flex items-center space-x-4 mb-4">
        <Link
          to={`/profile/${article.author?.id}`}
          className="flex items-center space-x-2 hover:text-blue-600 transition-colors"
        >
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <User size={20} className="text-gray-500" />
          </div>
          <div>
            <span className="font-medium">
              {article.author?.firstname && article.author?.lastname
                ? `${article.author.firstname} ${article.author.lastname}`
                : article.author?.email}
            </span>
            <p className="text-sm text-gray-500">
              {new Date(article.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </Link>
      </div>

      <Link to={`/article/${article.id}`}>
        <p className="text-gray-700 mb-4 line-clamp-3 hover:text-gray-900 transition-colors">
          {article.content}
        </p>
      </Link>

      <div className="flex items-center space-x-6 text-gray-500">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-1 transition-colors ${
            isLiked ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'
          }`}
        >
          <Heart
            size={20}
            className={isLiked ? 'fill-current' : ''}
          />
          <span>{likesCount}</span>
        </button>

        <Link
          to={`/article/${article.id}`}
          className="flex items-center space-x-1 hover:text-blue-500 transition-colors"
        >
          <MessageCircle size={20} />
          <span>{commentsCount}</span>
        </Link>

        {user && (
          <button
            onClick={handleFavorite}
            className={`flex items-center space-x-1 transition-colors ${
              isFavorited ? 'text-yellow-500 hover:text-yellow-600' : 'hover:text-yellow-500'
            }`}
          >
            <Bookmark
              size={20}
              className={isFavorited ? 'fill-current' : ''}
            />
            <span>{isFavorited ? 'Sauvegardé' : 'Sauvegarder'}</span>
          </button>
        )}
      </div>
    </article>
  );
}