import { useState, useEffect, useRef, useCallback } from 'react';
import { WordRecognitionModel, WordAnalysis } from '../models/WordRecognitionModel';
import { SignLanguageModel, PredictionResult } from '../models/SignLanguageModel';

interface WordRecognitionState {
  currentWord: string;
  analysis: WordAnalysis;
  isAnalyzing: boolean;
  modelReady: boolean;
}

export const useWordRecognition = (
  signLanguageModel: SignLanguageModel | null,
  isActive: boolean
) => {
  const [state, setState] = useState<WordRecognitionState>({
    currentWord: '',
    analysis: {
      recognizedWords: [],
      totalLetters: 0,
      averageConfidence: 0,
      recognitionSpeed: 0,
      commonWords: [],
      suggestions: [],
      grammarCorrections: []
    },
    isAnalyzing: false,
    modelReady: false
  });

  const wordModelRef = useRef<WordRecognitionModel | null>(null);

  // Initialize word recognition model
  useEffect(() => {
    if (signLanguageModel && signLanguageModel.isModelLoaded()) {
      wordModelRef.current = new WordRecognitionModel(signLanguageModel);
      setState(prev => ({ ...prev, modelReady: true }));
    }
  }, [signLanguageModel]);

  // Update analysis periodically
  useEffect(() => {
    if (!wordModelRef.current || !isActive) return;

    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        currentWord: wordModelRef.current?.getCurrentWord() || '',
        analysis: wordModelRef.current?.getWordAnalysis() || prev.analysis
      }));
    }, 500);

    return () => clearInterval(interval);
  }, [isActive]);

  const addLetter = useCallback((prediction: PredictionResult) => {
    if (wordModelRef.current) {
      setState(prev => ({ ...prev, isAnalyzing: true }));
      wordModelRef.current.addLetter(prediction);
      
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          isAnalyzing: false,
          currentWord: wordModelRef.current?.getCurrentWord() || '',
          analysis: wordModelRef.current?.getWordAnalysis() || prev.analysis
        }));
      }, 100);
    }
  }, []);

  const addSpace = useCallback(() => {
    if (wordModelRef.current) {
      wordModelRef.current.addSpace();
      setState(prev => ({
        ...prev,
        currentWord: '',
        analysis: wordModelRef.current?.getWordAnalysis() || prev.analysis
      }));
    }
  }, []);

  const deleteLastLetter = useCallback(() => {
    if (wordModelRef.current) {
      wordModelRef.current.deleteLastLetter();
      setState(prev => ({
        ...prev,
        currentWord: wordModelRef.current?.getCurrentWord() || '',
        analysis: wordModelRef.current?.getWordAnalysis() || prev.analysis
      }));
    }
  }, []);

  const clearHistory = useCallback(() => {
    if (wordModelRef.current) {
      wordModelRef.current.clearHistory();
      setState(prev => ({
        ...prev,
        currentWord: '',
        analysis: {
          recognizedWords: [],
          totalLetters: 0,
          averageConfidence: 0,
          recognitionSpeed: 0,
          commonWords: [],
          suggestions: [],
          grammarCorrections: []
        }
      }));
    }
  }, []);

  const exportAnalysis = useCallback((): string => {
    return wordModelRef.current?.exportAnalysis() || '{}';
  }, []);

  return {
    ...state,
    addLetter,
    addSpace,
    deleteLastLetter,
    clearHistory,
    exportAnalysis
  };
};