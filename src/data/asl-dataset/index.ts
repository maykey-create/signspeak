// ASL Dataset Index
// This file exports all the ASL alphabet datasets for training and recognition

import letterA from './letterA.json';
import letterB from './letterB.json';
import letterC from './letterC.json';
import letterD from './letterD.json';
import letterE from './letterE.json';
import letterF from './letterF.json';
import letterG from './letterG.json';
import letterH from './letterH.json';
import letterI from './letterI.json';
import letterJ from './letterJ.json';
import letterK from './letterK.json';
import letterL from './letterL.json';
import letterM from './letterM.json';
import letterN from './letterN.json';
import letterO from './letterO.json';
import letterP from './letterP.json';
import letterQ from './letterQ.json';
import letterR from './letterR.json';
import letterS from './letterS.json';
import letterT from './letterT.json';
import letterU from './letterU.json';
import letterV from './letterV.json';
import letterW from './letterW.json';
import letterX from './letterX.json';
import letterY from './letterY.json';
import letterZ from './letterZ.json';

export interface ASLSample {
  landmarks: number[][];
  confidence: number;
}

export interface ASLLetterData {
  letter: string;
  samples: ASLSample[];
}

export const aslDataset: Record<string, ASLLetterData> = {
  A: letterA,
  B: letterB,
  C: letterC,
  D: letterD,
  E: letterE,
  F: letterF,
  G: letterG,
  H: letterH,
  I: letterI,
  J: letterJ,
  K: letterK,
  L: letterL,
  M: letterM,
  N: letterN,
  O: letterO,
  P: letterP,
  Q: letterQ,
  R: letterR,
  S: letterS,
  T: letterT,
  U: letterU,
  V: letterV,
  W: letterW,
  X: letterX,
  Y: letterY,
  Z: letterZ
};

export const getAllLetters = (): string[] => {
  return Object.keys(aslDataset).sort();
};

export const getLetterData = (letter: string): ASLLetterData | null => {
  return aslDataset[letter.toUpperCase()] || null;
};

export const getAllSamples = (): Array<{ letter: string; landmarks: number[][]; confidence: number }> => {
  const samples: Array<{ letter: string; landmarks: number[][]; confidence: number }> = [];
  
  Object.entries(aslDataset).forEach(([letter, data]) => {
    data.samples.forEach(sample => {
      samples.push({
        letter,
        landmarks: sample.landmarks,
        confidence: sample.confidence
      });
    });
  });
  
  return samples;
};

export const getTrainingData = () => {
  const samples = getAllSamples();
  const letters = getAllLetters();
  
  // Convert to training format
  const features: number[][] = [];
  const labels: number[][] = [];
  
  samples.forEach(sample => {
    // Flatten landmarks to feature vector
    const featureVector = sample.landmarks.flat();
    features.push(featureVector);
    
    // Create one-hot encoded label
    const labelVector = new Array(letters.length).fill(0);
    const letterIndex = letters.indexOf(sample.letter);
    if (letterIndex !== -1) {
      labelVector[letterIndex] = 1;
    }
    labels.push(labelVector);
  });
  
  return { features, labels, letters };
};