// frontend/src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import CreateArticle from './pages/CreateArticle';
import Article from './pages/Article';
import Favorites from './pages/Favorites';
import MyPosts from './pages/MyPosts';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/create-article" element={<CreateArticle />} />
            <Route path="/article/:articleId" element={<Article />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/my-posts" element={<MyPosts />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;