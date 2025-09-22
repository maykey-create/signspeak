import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { CameraProvider } from './contexts/CameraContext';
import Header from './components/Header';
import CameraView from './components/CameraView';
import CaptionOverlay from './components/CaptionOverlay';
import ControlPanel from './components/ControlPanel';
import SettingsPanel from './components/SettingsPanel';
import SignLanguageRecognizer from './components/SignLanguageRecognizer';
import AuthModal from './components/AuthModal';
import UserProfile from './components/UserProfile';

const App: React.FC = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const handleAuthModalOpen = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <AuthProvider>
      <SettingsProvider>
        <CameraProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Header 
              onAuthModalOpen={handleAuthModalOpen}
              onProfileModalOpen={() => setProfileModalOpen(true)}
            />
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
              </div>
              
              {/* Sign Language Recognition - Full Width */}
              <div className="mt-6">
                <SignLanguageRecognizer />
              </div>
            </main>

            {/* Modals */}
            <AuthModal 
              isOpen={authModalOpen}
              onClose={() => setAuthModalOpen(false)}
              initialMode={authMode}
            />
            <UserProfile 
              isOpen={profileModalOpen}
              onClose={() => setProfileModalOpen(false)}
            />
          </div>
        </CameraProvider>
      </SettingsProvider>
    </AuthProvider>
  );
};

export default App;