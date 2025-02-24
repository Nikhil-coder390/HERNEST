import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuthStore } from '../lib/store';

export default function Navbar() {
  const { user } = useAuthStore();

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-rose-500" />
            <span className="text-2xl font-bold text-rose-500">HerNest</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-md bg-rose-500 text-white hover:bg-rose-600 transition"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/auth"
                className="px-4 py-2 rounded-md bg-rose-500 text-white hover:bg-rose-600 transition"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}