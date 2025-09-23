import React from 'react';
import { useCamera } from '../contexts/CameraContext';
import { useSettings } from '../contexts/SettingsContext';
import { useSignLanguageRecognition } from '../hooks/useSignLanguageRecognition';
import WordAnalysisPanel from './WordAnalysisPanel';
import { Hand, Brain, Zap, RotateCcw, Space, Delete, Copy, Download, Database, RefreshCw } from 'lucide-react';

const SignLanguageRecognizer: React.FC = () => {
  const { isActive, videoRef } = useCamera();
  const { signLanguageEnabled, confidenceThreshold } = useSettings();
  const {
    currentPrediction,
    isProcessing,
    modelLoaded,
    recognizedText,
    lastLetter,
    letterConfidence,
    wordRecognition,
    clearText,
    addSpace,
    deleteLetter
  } = useSignLanguageRecognition(
    videoRef.current,
    isActive && signLanguageEnabled,
    confidenceThreshold
  );

  const [datasetInfo, setDatasetInfo] = React.useState<{
    totalSamples: number;
    lettersAvailable: string[];
  } | null>(null);

  // Load dataset info
  React.useEffect(() => {
    import('../models/SignLanguageModel').then(({ SignLanguageModel }) => {
      const model = new SignLanguageModel();
      setDatasetInfo(model.getDatasetInfo());
    });
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(recognizedText);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const downloadText = () => {
    const blob = new Blob([recognizedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sign-language-text-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center">
            <Hand className="w-5 h-5 mr-2 text-blue-600" />
            Sign Language Recognition
          </h2>
          <div className="flex items-center space-x-2">
            {modelLoaded ? (
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                <Brain className="w-4 h-4" />
                <span>AI Ready</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                <Zap className="w-4 h-4 animate-pulse" />
                <span>Loading AI...</span>
              </div>
            )}
            {datasetInfo && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                <Database className="w-4 h-4" />
                <span>{datasetInfo.totalSamples} samples</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Current Prediction Display */}
        {signLanguageEnabled && isActive && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-700">Live Detection</h3>
              {isProcessing && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <Zap className="w-4 h-4 animate-pulse" />
                  <span className="text-xs">Processing...</span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Current Letter */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {currentPrediction?.letter || '?'}
                  </div>
                  <div className="text-xs text-slate-600">
                    {currentPrediction ? `${Math.round(currentPrediction.confidence * 100)}% confident` : 'No detection'}
                  </div>
                </div>
              </div>
              
              {/* Last Confirmed Letter */}
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {lastLetter || '-'}
                  </div>
                  <div className="text-xs text-slate-600">
                    {lastLetter ? `${Math.round(letterConfidence * 100)}% confirmed` : 'No letter yet'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recognized Text Output */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-700">Recognized Text</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={copyToClipboard}
                disabled={!recognizedText}
                className="p-2 text-slate-500 hover:text-blue-500 disabled:text-slate-300 transition-colors"
                title="Copy text"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={downloadText}
                disabled={!recognizedText}
                className="p-2 text-slate-500 hover:text-blue-500 disabled:text-slate-300 transition-colors"
                title="Download text"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="min-h-[120px] p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-lg text-slate-800 leading-relaxed">
              {recognizedText || (
                <span className="text-slate-400 italic">
                  {signLanguageEnabled && isActive 
                    ? 'Start signing to see text appear here...' 
                    : 'Enable sign language recognition and start camera to begin'}
                </span>
              )}
              {isProcessing && <span className="animate-pulse">|</span>}
            </div>
          </div>
        </div>

        {/* Manual Controls */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={addSpace}
            className="flex items-center justify-center space-x-2 p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
          >
            <Space className="w-4 h-4" />
            <span className="text-sm font-medium">Space</span>
          </button>
          
          <button
            onClick={deleteLetter}
            disabled={!recognizedText}
            className="flex items-center justify-center space-x-2 p-3 bg-red-50 hover:bg-red-100 text-red-700 disabled:bg-slate-50 disabled:text-slate-400 rounded-lg transition-colors"
          >
            <Delete className="w-4 h-4" />
            <span className="text-sm font-medium">Delete</span>
          </button>
          
          <button
            onClick={clearText}
            disabled={!recognizedText}
            className="flex items-center justify-center space-x-2 p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 disabled:bg-slate-50 disabled:text-slate-400 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm font-medium">Clear</span>
          </button>
        </div>

        {/* Recognition Status */}
        <div className="mt-6 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Recognition Status:</span>
            <div className={`flex items-center space-x-2 ${
              signLanguageEnabled && isActive && modelLoaded
                ? 'text-green-600'
                : 'text-slate-500'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                signLanguageEnabled && isActive && modelLoaded
                  ? 'bg-green-500 animate-pulse'
                  : 'bg-slate-400'
              }`}></div>
              <span className="font-medium">
                {!signLanguageEnabled ? 'Disabled' :
                 !isActive ? 'Camera Inactive' :
                 !modelLoaded ? 'Loading AI Model...' :
                 'Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">How to Use:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Position your hand clearly in front of the camera</li>
            <li>• Make clear ASL alphabet signs</li>
            <li>• Hold each letter for 1-2 seconds for recognition</li>
            <li>• Use manual controls for space, delete, and clear</li>
          </ul>
          
          {datasetInfo && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <h5 className="text-xs font-medium text-blue-800 mb-1">Dataset Info:</h5>
              <div className="text-xs text-blue-600 space-y-1">
                <p>• {datasetInfo.totalSamples} training samples loaded</p>
                <p>• Supports letters: {datasetInfo.lettersAvailable.join(', ')}</p>
                <p>• Model trained on real ASL hand positions</p>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
      
      {/* Word Analysis Panel */}
      <WordAnalysisPanel
        analysis={wordRecognition.analysis}
        currentWord={wordRecognition.currentWord}
        isAnalyzing={wordRecognition.isAnalyzing}
        onClearHistory={wordRecognition.clearHistory}
        onExportAnalysis={wordRecognition.exportAnalysis}
      />
    </>
  );
};

export default SignLanguageRecognizer;