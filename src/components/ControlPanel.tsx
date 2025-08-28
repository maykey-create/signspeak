import React from 'react';
import { useCamera } from '../contexts/CameraContext';
import { useSettings } from '../contexts/SettingsContext';
import { Hand, Mic, Volume2, Monitor, Settings, MessageSquare } from 'lucide-react';

const ControlPanel: React.FC = () => {
  const { isActive } = useCamera();
  const { 
    signLanguageEnabled, 
    lipReadingEnabled, 
    speechSynthesisEnabled, 
    voiceAssistantEnabled,
    updateSetting 
  } = useSettings();

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Quick Controls
        </h2>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Recognition Modes */}
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-3">Recognition Modes</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Hand className="w-5 h-5 text-blue-500" />
                <div>
                  <span className="text-sm font-medium text-slate-800">Sign Language</span>
                  <p className="text-xs text-slate-500">Hand gesture recognition</p>
                </div>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={signLanguageEnabled}
                  onChange={(e) => updateSetting('signLanguageEnabled', e.target.checked)}
                  className="sr-only"
                />
                <div 
                  className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${
                    signLanguageEnabled ? 'bg-blue-500' : 'bg-slate-300'
                  }`}
                  onClick={() => updateSetting('signLanguageEnabled', !signLanguageEnabled)}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                    signLanguageEnabled ? 'translate-x-5' : 'translate-x-0'
                  } mt-0.5 ml-0.5`}></div>
                </div>
              </div>
            </label>
            
            <label className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mic className="w-5 h-5 text-green-500" />
                <div>
                  <span className="text-sm font-medium text-slate-800">Lip Reading</span>
                  <p className="text-xs text-slate-500">Mouth movement analysis</p>
                </div>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={lipReadingEnabled}
                  onChange={(e) => updateSetting('lipReadingEnabled', e.target.checked)}
                  className="sr-only"
                />
                <div 
                  className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${
                    lipReadingEnabled ? 'bg-green-500' : 'bg-slate-300'
                  }`}
                  onClick={() => updateSetting('lipReadingEnabled', !lipReadingEnabled)}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                    lipReadingEnabled ? 'translate-x-5' : 'translate-x-0'
                  } mt-0.5 ml-0.5`}></div>
                </div>
              </div>
            </label>
          </div>
        </div>
        
        {/* Output Options */}
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-3">Output Options</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Volume2 className="w-5 h-5 text-purple-500" />
                <div>
                  <span className="text-sm font-medium text-slate-800">Text-to-Speech</span>
                  <p className="text-xs text-slate-500">Speak generated captions</p>
                </div>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={speechSynthesisEnabled}
                  onChange={(e) => updateSetting('speechSynthesisEnabled', e.target.checked)}
                  className="sr-only"
                />
                <div 
                  className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${
                    speechSynthesisEnabled ? 'bg-purple-500' : 'bg-slate-300'
                  }`}
                  onClick={() => updateSetting('speechSynthesisEnabled', !speechSynthesisEnabled)}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                    speechSynthesisEnabled ? 'translate-x-5' : 'translate-x-0'
                  } mt-0.5 ml-0.5`}></div>
                </div>
              </div>
            </label>
            
            <label className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-5 h-5 text-orange-500" />
                <div>
                  <span className="text-sm font-medium text-slate-800">Voice Assistant</span>
                  <p className="text-xs text-slate-500">Click captions to speak them</p>
                </div>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={voiceAssistantEnabled}
                  onChange={(e) => updateSetting('voiceAssistantEnabled', e.target.checked)}
                  className="sr-only"
                />
                <div 
                  className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${
                    voiceAssistantEnabled ? 'bg-orange-500' : 'bg-slate-300'
                  }`}
                  onClick={() => updateSetting('voiceAssistantEnabled', !voiceAssistantEnabled)}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                    voiceAssistantEnabled ? 'translate-x-5' : 'translate-x-0'
                  } mt-0.5 ml-0.5`}></div>
                </div>
              </div>
            </label>
          </div>
        </div>
        
        {/* Status Indicator */}
        <div className="pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Status</span>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
              isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-slate-100 text-slate-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-400'
              }`}></div>
              {isActive ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;