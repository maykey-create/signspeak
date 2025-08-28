import React from 'react';
import { Hand, MessageSquare, Accessibility } from 'lucide-react';

const Header: React.FC = () => {
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
          
          <div className="flex items-center space-x-2">
            <Accessibility className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-medium text-slate-700">Accessibility First</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;