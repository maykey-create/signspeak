import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useCamera } from '../contexts/CameraContext';
import { Volume2, VolumeX, Copy, Download, Mic, Play, Pause } from 'lucide-react';

const CaptionOverlay: React.FC = () => {
  const { isActive } = useCamera();
  const { 
    captionSize, 
    captionPosition, 
    highContrast, 
    speechSynthesisEnabled,
    voiceAssistantEnabled,
    voiceSpeed,
    voicePitch,
    selectedVoice
  } = useSettings();
  const [captions, setCaptions] = useState<Array<{ id: string; text: string; timestamp: Date; confidence: number }>>([]);
  const [currentCaption, setCurrentCaption] = useState('');
  const [selectedCaptionId, setSelectedCaptionId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  // Simulate real-time caption generation
  useEffect(() => {
    if (!isActive) {
      setCaptions([]);
      setCurrentCaption('');
      return;
    }

    const simulatedCaptions = [
      { text: "Hello, how are you today?", confidence: 0.95 },
      { text: "I'm doing well, thank you for asking.", confidence: 0.87 },
      { text: "Would you like to join our meeting?", confidence: 0.92 },
      { text: "Yes, I'd be happy to participate.", confidence: 0.89 },
      { text: "Let me share my screen with you.", confidence: 0.84 },
      { text: "Perfect, I can see everything clearly.", confidence: 0.91 }
    ];

    let captionIndex = 0;
    const interval = setInterval(() => {
      if (captionIndex < simulatedCaptions.length) {
        const caption = simulatedCaptions[captionIndex];
        const newCaption = {
          id: Date.now().toString(),
          text: caption.text,
          timestamp: new Date(),
          confidence: caption.confidence
        };
        
        setCaptions(prev => [...prev, newCaption].slice(-10)); // Keep last 10 captions
        setCurrentCaption(caption.text);
        
        // Auto text-to-speech if enabled
        if (speechSynthesisEnabled && voiceAssistantEnabled && 'speechSynthesis' in window) {
          speakText(caption.text);
        }
        
        captionIndex++;
      } else {
        captionIndex = 0; // Loop back to start
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isActive, speechSynthesisEnabled, voiceAssistantEnabled, voiceSpeed, voicePitch, selectedVoice]);

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    
    // Stop any current speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = voiceSpeed;
    utterance.pitch = voicePitch;
    
    // Set selected voice if available
    if (selectedVoice && availableVoices.length > 0) {
      const voice = availableVoices.find(v => v.name === selectedVoice);
      if (voice) utterance.voice = voice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    speechSynthesis.speak(utterance);
  };

  const handleCaptionSelect = (captionId: string, text: string) => {
    setSelectedCaptionId(captionId);
    if (voiceAssistantEnabled) {
      speakText(text);
    }
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const getSizeClasses = () => {
    switch (captionSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-xl';
      default: return 'text-lg';
    }
  };

  const copyToClipboard = async () => {
    const text = captions.map(c => c.text).join('\n');
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const downloadTranscript = () => {
    const text = captions.map(c => 
      `[${c.timestamp.toLocaleTimeString()}] ${c.text} (${Math.round(c.confidence * 100)}%)`
    ).join('\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Live Captions</h2>
          <div className="flex items-center space-x-2">
            {voiceAssistantEnabled && (
              <div className="flex items-center space-x-1">
                <Mic className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-purple-600 font-medium">Voice Assistant</span>
              </div>
            )}
            {speechSynthesisEnabled ? (
              <Volume2 className="w-5 h-5 text-green-500" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-400" />
            )}
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="p-2 text-red-500 hover:text-red-600 transition-colors"
                title="Stop speaking"
              >
                <Pause className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={copyToClipboard}
              className="p-2 text-slate-500 hover:text-blue-500 transition-colors"
              title="Copy transcript"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={downloadTranscript}
              className="p-2 text-slate-500 hover:text-blue-500 transition-colors"
              title="Download transcript"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Current Caption Display */}
        {currentCaption && (
          <div className={`
            p-4 rounded-lg mb-4 transition-all duration-300 cursor-pointer hover:shadow-md
            ${highContrast 
              ? 'bg-black text-white border-2 border-yellow-400' 
              : 'bg-blue-50 text-blue-900 border border-blue-200'
            }
            ${selectedCaptionId === 'current' ? 'ring-2 ring-purple-400' : ''}
          `}
            onClick={() => handleCaptionSelect('current', currentCaption)}
          >
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium opacity-70">LIVE</span>
              {voiceAssistantEnabled && (
                <Play className="w-3 h-3 text-purple-500 ml-auto" />
              )}
            </div>
            <p className={`font-medium ${getSizeClasses()}`}>
              {currentCaption}
            </p>
          </div>
        )}
        
        {/* Caption History */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {captions.length > 0 ? (
            captions.map((caption) => (
              <div
                key={caption.id}
                onClick={() => handleCaptionSelect(caption.id, caption.text)}
                className={`
                  p-3 rounded-lg transition-all duration-200 cursor-pointer hover:shadow-md
                  ${highContrast 
                    ? 'bg-gray-900 text-white border border-gray-700' 
                    : 'bg-slate-50 text-slate-800 hover:bg-slate-100'
                  }
                  ${selectedCaptionId === caption.id ? 'ring-2 ring-purple-400' : ''}
                `}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">
                    {caption.timestamp.toLocaleTimeString()}
                  </span>
                  <div className="flex items-center space-x-2">
                    {voiceAssistantEnabled && (
                      <Play className="w-3 h-3 text-purple-500" />
                    )}
                    <div className={`
                      w-2 h-2 rounded-full
                      ${caption.confidence >= 0.9 ? 'bg-green-400' : 
                        caption.confidence >= 0.7 ? 'bg-yellow-400' : 'bg-red-400'}
                    `}></div>
                    <span className="text-xs text-slate-500">
                      {Math.round(caption.confidence * 100)}%
                    </span>
                  </div>
                </div>
                <p className={`${getSizeClasses()}`}>
                  {caption.text}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500">
                {isActive ? (
                  <>
                    Listening for speech and sign language...
                    {voiceAssistantEnabled && (
                      <span className="block text-xs mt-1 text-purple-600">
                        Click any caption to have it spoken aloud
                      </span>
                    )}
                  </>
                ) : (
                  'Start the camera to see live captions'
                )}
              </p>
            </div>
          )}
        </div>
        
        {/* Voice Assistant Status */}
        {voiceAssistantEnabled && isSpeaking && (
          <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-purple-800">Speaking to video call participants...</span>
              <button
                onClick={stopSpeaking}
                className="ml-auto px-2 py-1 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 rounded transition-colors"
              >
                Stop
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaptionOverlay;