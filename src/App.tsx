import React from 'react';
import { CameraProvider } from './contexts/CameraContext';
import { SettingsProvider } from './contexts/SettingsContext';
import Header from './components/Header';
import CameraView from './components/CameraView';
import CaptionOverlay from './components/CaptionOverlay';
import ControlPanel from './components/ControlPanel';
import SettingsPanel from './components/SettingsPanel';

function App() {
  return (
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
            </div>
          </main>
        </div>
      </CameraProvider>
    </SettingsProvider>
  );
}

export default App;