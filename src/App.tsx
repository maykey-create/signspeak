import React from 'react';
import { Hand, MessageSquare, Accessibility, User, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onAuthModalOpen: () => void;
  onProfileModalOpen: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAuthModalOpen, onProfileModalOpen }) => {

const Header: React.FC = () => {
    <AuthProvider>
      <SettingsProvider>
        <CameraProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Header />
            <main className="container mx-auto px-4 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Camera and Caption Area */}
                <div className="lg:col-span-2 space-y-6">
                  <CameraView />
                  <CaptionOverlay />
                </div>
                
                {/* Control Panels */}
                <div className="space-y-6">
                  <ControlPanel />
                  <SettingsPanel />
                </div>
            <Accessibility className="w-6 h-6 text-purple-600" />
            </main>
          </div>
        </CameraProvider>
      </SettingsProvider>
    </AuthProvider>
  );
};

export default Header;