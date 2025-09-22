import { useState, useEffect, useRef, useCallback } from 'react';
import { SignLanguageModel, PredictionResult } from '../models/SignLanguageModel';
import { HandTracker, HandTrackingResult } from '../utils/handTracking';
import { useWordRecognition } from './useWordRecognition';

interface RecognitionState {
  currentPrediction: PredictionResult | null;
  isProcessing: boolean;
  modelLoaded: boolean;
  recognizedText: string;
  lastLetter: string | null;
  letterConfidence: number;
}

export const useSignLanguageRecognition = (
  videoElement: HTMLVideoElement | null,
  isActive: boolean,
  confidenceThreshold: number = 0.7
) => {
  const [state, setState] = useState<RecognitionState>({
    currentPrediction: null,
    isProcessing: false,
    modelLoaded: false,
    recognizedText: '',
    lastLetter: null,
    letterConfidence: 0
  });

  const modelRef = useRef<SignLanguageModel | null>(null);
  const handTrackerRef = useRef<HandTracker | null>(null);
  const processingRef = useRef(false);
  const lastPredictionTimeRef = useRef(0);
  const stableLetterRef = useRef<{ letter: string; count: number; startTime: number } | null>(null);

  // Initialize word recognition
  const wordRecognition = useWordRecognition(modelRef.current, isActive);

  // Initialize model and hand tracker
  useEffect(() => {
    modelRef.current = new SignLanguageModel();
    handTrackerRef.current = new HandTracker();

    // Check if model is loaded
    const checkModelLoaded = () => {
      if (modelRef.current?.isModelLoaded()) {
        setState(prev => ({ ...prev, modelLoaded: true }));
      } else {
        setTimeout(checkModelLoaded, 100);
      }
    };
    checkModelLoaded();

    return () => {
      if (handTrackerRef.current) {
        handTrackerRef.current.close();
      }
    };
  }, []);

  const processHandLandmarks = useCallback(async (results: HandTrackingResult) => {
    if (!modelRef.current || processingRef.current || !results.landmarks.length) {
      return;
    }

    processingRef.current = true;
    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      // Use the first detected hand
      const handLandmarks = results.landmarks[0];
      
      // Convert 3D landmarks to 2D for the model
      const landmarks2D = handLandmarks.map(landmark => [landmark.x, landmark.y]);
      
      const prediction = await modelRef.current.predict(landmarks2D);
      
      if (prediction && prediction.confidence >= confidenceThreshold) {
        const currentTime = Date.now();
        
        // Implement letter stability check (letter must be stable for 1 second)
        if (stableLetterRef.current?.letter === prediction.letter) {
          stableLetterRef.current.count++;
          
          // If letter has been stable for 1 second (assuming 30fps = 30 frames)
          if (stableLetterRef.current.count >= 30) {
            const timeSinceLastPrediction = currentTime - lastPredictionTimeRef.current;
            
            // Only add letter if enough time has passed since last prediction
            if (timeSinceLastPrediction > 1500) {
              setState(prev => {
                let newText = prev.recognizedText;
                
                if (prediction.letter === 'SPACE') {
                  newText += ' ';
                } else if (prediction.letter === 'DELETE') {
                  newText = newText.slice(0, -1);
                } else {
                  newText += prediction.letter;
                }
                
                return {
                  ...prev,
                  recognizedText: newText,
                  lastLetter: prediction.letter,
                  letterConfidence: prediction.confidence
                };
              });
              
              lastPredictionTimeRef.current = currentTime;
              stableLetterRef.current = null;
              
              // Add letter to word recognition
              wordRecognition.addLetter(prediction);
            }
          }
        } else {
          // New letter detected, start stability counter
          stableLetterRef.current = {
            letter: prediction.letter,
            count: 1,
            startTime: currentTime
          };
        }
        
        setState(prev => ({
          ...prev,
          currentPrediction: prediction
        }));
      } else {
        setState(prev => ({
          ...prev,
          currentPrediction: null
        }));
        stableLetterRef.current = null;
      }
    } catch (error) {
      console.error('Sign language recognition error:', error);
    } finally {
      processingRef.current = false;
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [confidenceThreshold]);

  // Main processing loop
  useEffect(() => {
    if (!isActive || !videoElement || !handTrackerRef.current || !state.modelLoaded) {
      return;
    }

    let animationFrameId: number;

    const processFrame = async () => {
      if (videoElement && handTrackerRef.current) {
        await handTrackerRef.current.processFrame(videoElement, processHandLandmarks);
      }
      animationFrameId = requestAnimationFrame(processFrame);
    };

    processFrame();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isActive, videoElement, state.modelLoaded, processHandLandmarks]);

  const clearText = useCallback(() => {
    setState(prev => ({
      ...prev,
      recognizedText: '',
      lastLetter: null,
      letterConfidence: 0
    }));
    stableLetterRef.current = null;
  }, []);

  const addSpace = useCallback(() => {
    setState(prev => ({
      ...prev,
      recognizedText: prev.recognizedText + ' '
    }));
    wordRecognition.addSpace();
  }, []);

  const deleteLetter = useCallback(() => {
    setState(prev => ({
      ...prev,
      recognizedText: prev.recognizedText.slice(0, -1)
    }));
    wordRecognition.deleteLastLetter();
  }, []);

  return {
    ...state,
    wordRecognition,
    clearText,
    addSpace,
    deleteLetter
  };
};