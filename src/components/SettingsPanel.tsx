import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { Sliders, Type, Monitor, Eye, Volume, Zap } from 'lucide-react';

const SettingsPanel: React.FC = () => {
  const {
    captionSize,
    captionPosition,
    highContrast,
    confidenceThreshold,
    voiceAssistantEnabled,
    voiceSpeed,
    voicePitch,
    selectedVoice,
    updateSetting
  } = useSettings();

  const [availableVoices, setAvailableVoices] = React.useState<SpeechSynthesisVoice[]>([]);

  React.useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      // Set default voice if none selected
      if (!selectedVoice && voices.length > 0) {
        const defaultVoice = voices.find(voice => voice.default) || voices[0];
        updateSetting('selectedVoice', defaultVoice.name);
      }
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [selectedVoice, updateSetting]);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center">
          <Sliders className="w-5 h-5 mr-2" />
          Display Settings
        </h2>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Caption Size */}
        <div>
          <label className="flex items-center space-x-2 mb-3">
            <Type className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Caption Size</span>
          </label>
          <select
            value={captionSize}
            onChange={(e) => updateSetting('captionSize', e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
        
        {/* Caption Position */}
        <div>
          <label className="flex items-center space-x-2 mb-3">
            <Monitor className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Caption Position</span>
          </label>
          <select
            value={captionPosition}
            onChange={(e) => updateSetting('captionPosition', e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="floating">Floating</option>
          </select>
        </div>
        
        {/* High Contrast */}
        <div>
          <label className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">High Contrast Mode</span>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => updateSetting('highContrast', e.target.checked)}
                className="sr-only"
              />
              <div 
                className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${
                  highContrast ? 'bg-yellow-500' : 'bg-slate-300'
                }`}
                onClick={() => updateSetting('highContrast', !highContrast)}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                  highContrast ? 'translate-x-5' : 'translate-x-0'
                } mt-0.5 ml-0.5`}></div>
              </div>
            </div>
          </label>
        </div>
        
        {/* Confidence Threshold */}
        <div>
          <label className="block mb-3">
            <span className="text-sm font-medium text-slate-700">
              Confidence Threshold ({Math.round(confidenceThreshold * 100)}%)
            </span>
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="0.3"
              max="1.0"
              step="0.05"
              value={confidenceThreshold}
              onChange={(e) => updateSetting('confidenceThreshold', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>Low (30%)</span>
              <span>Medium (65%)</span>
              <span>High (100%)</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Higher values show only high-confidence recognitions
          </p>
        </div>
        
        {/* Voice Assistant Settings */}
        {voiceAssistantEnabled && (
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-sm font-medium text-slate-700 mb-4 flex items-center">
              <Volume className="w-4 h-4 mr-2" />
              Voice Assistant Settings
            </h3>
            
            {/* Voice Selection */}
            <div className="mb-4">
              <label className="block mb-2">
                <span className="text-sm font-medium text-slate-700">Voice</span>
              </label>
              <select
                value={selectedVoice}
                onChange={(e) => updateSetting('selectedVoice', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {availableVoices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Voice Speed */}
            <div className="mb-4">
              <label className="block mb-2">
                <span className="text-sm font-medium text-slate-700">
                  Speech Speed ({voiceSpeed.toFixed(1)}x)
                </span>
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={voiceSpeed}
                onChange={(e) => updateSetting('voiceSpeed', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Slow</span>
                <span>Normal</span>
                <span>Fast</span>
              </div>
            </div>
            
            {/* Voice Pitch */}
            <div className="mb-4">
              <label className="block mb-2">
                <span className="text-sm font-medium text-slate-700">
                  Voice Pitch ({voicePitch.toFixed(1)})
                </span>
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={voicePitch}
                onChange={(e) => updateSetting('voicePitch', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Low</span>
                <span>Normal</span>
                <span>High</span>
              </div>
            </div>
            
            {/* Test Voice Button */}
            <button
              onClick={() => {
                const utterance = new SpeechSynthesisUtterance("Hello, this is a test of the voice assistant feature.");
                utterance.rate = voiceSpeed;
                utterance.pitch = voicePitch;
                if (selectedVoice && availableVoices.length > 0) {
                  const voice = availableVoices.find(v => v.name === selectedVoice);
                  if (voice) utterance.voice = voice;
                }
                speechSynthesis.speak(utterance);
              }}
              className="w-full px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>Test Voice</span>
            </button>
          </div>
        )}
        
        {/* Integration Help */}
        <div className="pt-4 border-t border-slate-200">
          <h3 className="text-sm font-medium text-slate-700 mb-2">Video Call Integration</h3>
          <p className="text-xs text-slate-500 mb-3">
            To use with video calls, position this window alongside your video conferencing app. 
            {voiceAssistantEnabled && ' Click any caption to speak it to other participants.'}
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-slate-50 rounded text-center">
              <div className="font-medium text-slate-700">Google Meet</div>
              <div className="text-slate-500">Supported</div>
            </div>
            <div className="p-2 bg-slate-50 rounded text-center">
              <div className="font-medium text-slate-700">Zoom</div>
              <div className="text-slate-500">Supported</div>
            </div>
            <div className="p-2 bg-slate-50 rounded text-center">
              <div className="font-medium text-slate-700">Teams</div>
              <div className="text-slate-500">Supported</div>
            </div>
            <div className="p-2 bg-slate-50 rounded text-center">
              <div className="font-medium text-slate-700">Discord</div>
              <div className="text-slate-500">Supported</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;