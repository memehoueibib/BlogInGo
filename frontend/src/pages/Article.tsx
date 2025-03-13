
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Article as ArticleType, Comment } from '../types';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import ArticleCard from '../components/ArticleCard';
import { Pencil, Trash2, X } from 'lucide-react';

export default function Article() {
  const { articleId } = useParams<{ articleId: string }>();
  const [article, setArticle] = useState<ArticleType | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (articleId) {
      loadArticle();
      loadComments();
    }
  }, [articleId]);

  async function loadArticle() {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        author:user_id(id, email, firstname, lastname)
      `)
      .eq('id', articleId)
      .single();

    if (error) {
      console.error('Error loading article:', error);
      return;
    }

    setArticle(data);
  }

  async function loadComments() {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:user_id(id, email, firstname, lastname)
      `)
      .eq('article_id', articleId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading comments:', error);
      return;
    }

    setComments(data || []);
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !articleId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          content: newComment,
          article_id: articleId,
          user_id: user.id
        });

      if (error) throw error;

      setNewComment('');
      await loadComments();
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleEditComment = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const handleUpdateComment = async () => {
    if (!editingComment) return;

    try {
      const { error } = await supabase
        .from('comments')
        .update({ content: editContent })
        .eq('id', editingComment)
        .eq('user_id', user?.id);

      if (error) throw error;

      setEditingComment(null);
      await loadComments();
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user?.id);

      if (error) throw error;

      await loadComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  if (!article) return <div>Chargement...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <ArticleCard
        article={article}
        showBackButton
        onUpdate={loadArticle}
      />

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-6">Commentaires</h2>
        
        {user ? (
          <form onSubmit={handleComment} className="space-y-4 mb-8">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 min-h-[100px]"
              placeholder="Ajouter un commentaire..."
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Envoi...' : 'Publier'}
            </button>
          </form>
        ) : (
          <p className="text-gray-600 mb-6">
            Connectez-vous pour ajouter un commentaire
          </p>
        )}

        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
              {editingComment === comment.id ? (
                <div className="space-y-4">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setEditingComment(null)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <X size={20} />
                    </button>
                    <button
                      onClick={handleUpdateComment}
                      className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                    >
                      Sauvegarder
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium">
                        {comment.author?.firstname && comment.author?.lastname
                          ? `${comment.author.firstname} ${comment.author.lastname}`
                          : comment.author?.email}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        {new Date(comment.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {user && comment.user_id === user.id && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditComment(comment)}
                          className="text-gray-600 hover:text-blue-600"
                          title="Modifier"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-gray-600 hover:text-red-600"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </>
              )}
            </div>
          ))}
          
          {comments.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              Aucun commentaire pour le moment
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 