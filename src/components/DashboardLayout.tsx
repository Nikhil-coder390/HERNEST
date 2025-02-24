import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, LogOut, User, Calendar, MessageCircle, Home, FileText, ClipboardList } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import NotificationBell from './NotificationBell';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, setUser, setProfile } = useAuthStore();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    navigate('/');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Health Records', href: '/health-records', icon: ClipboardList },
    { name: 'Prescriptions', href: '/prescriptions', icon: FileText },
    ...(profile?.is_doctor
      ? []
      : [
          { name: 'Book Appointment', href: '/book-appointment', icon: Calendar },
          { name: 'Chat', href: '/chat', icon: MessageCircle },
        ]),
  ];

  return (
    <div className="min-h-screen bg-rose-50">
      <nav className="bg-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-rose-500" />
              <span className="text-2xl font-bold text-rose-500">HerNest</span>
            </Link>
            
            <div className="flex items-center space-x-6">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === item.href
                        ? 'text-rose-500 bg-rose-50'
                        : 'text-gray-700 hover:text-rose-500 hover:bg-rose-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              <NotificationBell />
              
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 px-4 py-2 rounded-md hover:bg-rose-50 text-gray-700"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}