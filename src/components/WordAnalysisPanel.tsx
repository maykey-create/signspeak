import React from 'react';
import { WordAnalysis } from '../models/WordRecognitionModel';
import { 
  BarChart3, 
  Clock, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Lightbulb, 
  CheckCircle, 
  AlertCircle,
  Download,
  RotateCcw
} from 'lucide-react';

interface WordAnalysisPanelProps {
  analysis: WordAnalysis;
  currentWord: string;
  isAnalyzing: boolean;
  onClearHistory: () => void;
  onExportAnalysis: () => string;
}

const WordAnalysisPanel: React.FC<WordAnalysisPanelProps> = ({
  analysis,
  currentWord,
  isAnalyzing,
  onClearHistory,
  onExportAnalysis
}) => {
  const downloadAnalysis = () => {
    const analysisData = onExportAnalysis();
    const blob = new Blob([analysisData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sign-language-analysis-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSpeedColor = (speed: number) => {
    if (speed >= 30) return 'text-green-600';
    if (speed >= 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
            Word Analysis
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={downloadAnalysis}
              className="p-2 text-slate-500 hover:text-blue-500 transition-colors"
              title="Download analysis"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClearHistory}
              className="p-2 text-slate-500 hover:text-red-500 transition-colors"
              title="Clear history"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Current Word */}
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center">
            <BookOpen className="w-4 h-4 mr-2" />
            Current Word
          </h3>
          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-800 mb-2">
              {currentWord || 'No word in progress'}
              {isAnalyzing && <span className="animate-pulse">|</span>}
            </div>
            <div className="text-sm text-purple-600">
              {currentWord.length} letters
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Session Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-slate-700">Accuracy</span>
              </div>
              <div className={`text-2xl font-bold px-2 py-1 rounded ${getConfidenceColor(analysis.averageConfidence)}`}>
                {Math.round(analysis.averageConfidence * 100)}%
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-slate-700">Speed</span>
              </div>
              <div className={`text-2xl font-bold ${getSpeedColor(analysis.recognitionSpeed)}`}>
                {Math.round(analysis.recognitionSpeed)}
              </div>
              <div className="text-xs text-slate-500">letters/min</div>
            </div>
          </div>
        </div>

        {/* Recent Words */}
        {analysis.recognizedWords.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3">Recent Words</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {analysis.recognizedWords.slice(-5).reverse().map((word, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <span className="font-medium text-slate-800">{word.word}</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded ${getConfidenceColor(word.confidence)}`}>
                      {Math.round(word.confidence * 100)}%
                    </span>
                    <span className="text-xs text-slate-500">
                      {Math.round(word.completionTime / 1000)}s
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Common Words */}
        {analysis.commonWords.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3">Most Used Words</h3>
            <div className="space-y-2">
              {analysis.commonWords.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <span className="font-medium text-blue-800">{item.word}</span>
                  <span className="text-sm text-blue-600">{item.count}x</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {analysis.suggestions.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center">
              <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
              Suggestions
            </h3>
            <div className="space-y-2">
              {analysis.suggestions.map((suggestion, index) => (
                <div key={index} className="p-2 bg-yellow-50 border border-yellow-200 rounded flex items-center">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                  <span className="text-sm text-yellow-800">
                    Did you mean: <strong>{suggestion}</strong>?
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grammar Corrections */}
        {analysis.grammarCorrections.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              Corrections
            </h3>
            <div className="space-y-2">
              {analysis.grammarCorrections.map((correction, index) => (
                <div key={index} className="p-2 bg-green-50 border border-green-200 rounded">
                  <div className="text-sm text-green-800">
                    <span className="line-through text-red-600">{correction.original}</span>
                    {' → '}
                    <strong className="text-green-700">{correction.suggested}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Insights */}
        <div className="pt-4 border-t border-slate-200">
          <h3 className="text-sm font-medium text-slate-700 mb-3">Performance Insights</h3>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Total Words:</span>
              <span className="font-medium">{analysis.recognizedWords.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total Letters:</span>
              <span className="font-medium">{analysis.totalLetters}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Average Word Length:</span>
              <span className="font-medium">
                {analysis.recognizedWords.length > 0 
                  ? Math.round(analysis.totalLetters / analysis.recognizedWords.length * 10) / 10
                  : 0} letters
              </span>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Tips for Better Recognition:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Hold each letter sign for 1-2 seconds</li>
            <li>• Keep your hand clearly visible to the camera</li>
            <li>• Use good lighting for better accuracy</li>
            <li>• Practice common words to improve speed</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WordAnalysisPanel;