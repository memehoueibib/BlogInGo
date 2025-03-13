
import React from 'react';
import { Link } from 'react-router-dom';
import { PenSquare, User, LogOut, Bookmark, FileText } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-gray-800">
            Les Anciens du GO
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/create-article"
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                >
                  <PenSquare size={20} />
                  <span>Écrire</span>
                </Link>
                <Link
                  to="/my-posts"
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                >
                  <FileText size={20} />
                  <span>Mes Posts</span>
                </Link>
                <Link
                  to="/favorites"
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                >
                  <Bookmark size={20} />
                  <span>Favoris</span>
                </Link>
                <Link
                  to={`/profile/${user.id}`}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                >
                  <User size={20} />
                  <span>Profil</span>
                </Link>
                <button
                  onClick={() => logout()}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                >
                  <LogOut size={20} />
                  <span>Déconnexion</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}