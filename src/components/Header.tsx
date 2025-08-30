import React from 'react';
import { Hand, MessageSquare, Accessibility, User, LogIn, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

interface HeaderProps {
  onAuthModalOpen: (mode?: 'login' | 'register') => void;
  onProfileModalOpen: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAuthModalOpen, onProfileModalOpen }) => {
  const { user, profile, loading } = useAuth();

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Hand className="w-8 h-8 text-blue-600" />
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">SignSpeak</h1>
              <p className="text-sm text-slate-600">Real-time Communication Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Accessibility className="w-6 h-6 text-purple-600" />
              <span className="text-sm font-medium text-slate-700">Accessibility First</span>
            </div>

            {/* Authentication Section */}
            <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
              {!isSupabaseConfigured && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-xs text-yellow-700 font-medium">Demo Mode</span>
                </div>
              )}
              {loading ? (
                <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse"></div>
              ) : user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-slate-600">
                    Welcome, {profile?.full_name || user.email?.split('@')[0]}
                  </span>
                  <button
                    onClick={onProfileModalOpen}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                    </div>
                    <User className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onAuthModalOpen('login')}
                    className="px-4 py-2 text-slate-600 hover:text-blue-600 font-medium transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => onAuthModalOpen('register')}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Get Started</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;