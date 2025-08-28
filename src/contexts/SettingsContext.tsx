import React, { createContext, useContext, useState } from 'react';

interface SettingsContextType {
  signLanguageEnabled: boolean;
  lipReadingEnabled: boolean;
  speechSynthesisEnabled: boolean;
  voiceAssistantEnabled: boolean;
  voiceSpeed: number;
  voicePitch: number;
  selectedVoice: string;
  captionSize: 'small' | 'medium' | 'large';
  captionPosition: 'top' | 'bottom' | 'floating';
  highContrast: boolean;
  confidenceThreshold: number;
  updateSetting: (key: string, value: any) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState({
    signLanguageEnabled: true,
    lipReadingEnabled: true,
    speechSynthesisEnabled: false,
    voiceAssistantEnabled: true,
    voiceSpeed: 1.0,
    voicePitch: 1.0,
    selectedVoice: '',
    captionSize: 'medium' as const,
    captionPosition: 'bottom' as const,
    highContrast: false,
    confidenceThreshold: 0.7
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const value = {
    ...settings,
    updateSetting
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};