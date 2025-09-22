import { SignLanguageModel, PredictionResult } from './SignLanguageModel';

export interface WordPrediction {
  word: string;
  confidence: number;
  letters: PredictionResult[];
  completionTime: number;
  accuracy: number;
}

export interface WordAnalysis {
  recognizedWords: WordPrediction[];
  totalLetters: number;
  averageConfidence: number;
  recognitionSpeed: number; // letters per minute
  commonWords: { word: string; count: number }[];
  suggestions: string[];
  grammarCorrections: { original: string; suggested: string }[];
}

export class WordRecognitionModel {
  private signLanguageModel: SignLanguageModel;
  private currentWord: PredictionResult[] = [];
  private recognizedWords: WordPrediction[] = [];
  private wordStartTime: number = 0;
  private lastLetterTime: number = 0;
  private wordTimeout: number = 2000; // 2 seconds timeout for word completion
  private wordTimeoutId: NodeJS.Timeout | null = null;

  // Common English words for validation and suggestions
  private commonWords = [
    'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR',
    'HAD', 'BY', 'WORD', 'OIL', 'SIT', 'SET', 'RUN', 'EAT', 'FAR', 'SEA', 'EYE', 'WHO', 'ITS',
    'NOW', 'FIND', 'LONG', 'DOWN', 'DAY', 'DID', 'GET', 'HAS', 'HIM', 'HIS', 'HOW', 'ITS',
    'MAY', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WAY', 'WHO', 'BOY', 'DID', 'ITS', 'LET', 'OLD',
    'PUT', 'SAY', 'SHE', 'TOO', 'USE', 'HELLO', 'WORLD', 'LOVE', 'HELP', 'GOOD', 'TIME', 'WORK',
    'LIFE', 'HAND', 'SIGN', 'TALK', 'HEAR', 'DEAF', 'SPEAK', 'LEARN', 'TEACH', 'FRIEND'
  ];

  // Letter frequency in English for spell checking
  private letterFrequency: { [key: string]: number } = {
    'E': 12.7, 'T': 9.1, 'A': 8.2, 'O': 7.5, 'I': 7.0, 'N': 6.7, 'S': 6.3, 'H': 6.1,
    'R': 6.0, 'D': 4.3, 'L': 4.0, 'C': 2.8, 'U': 2.8, 'M': 2.4, 'W': 2.4, 'F': 2.2,
    'G': 2.0, 'Y': 2.0, 'P': 1.9, 'B': 1.3, 'V': 1.0, 'K': 0.8, 'J': 0.15, 'X': 0.15,
    'Q': 0.10, 'Z': 0.07
  };

  constructor(signLanguageModel: SignLanguageModel) {
    this.signLanguageModel = signLanguageModel;
  }

  public addLetter(prediction: PredictionResult): void {
    const currentTime = Date.now();

    // Start new word if this is the first letter
    if (this.currentWord.length === 0) {
      this.wordStartTime = currentTime;
    }

    // Add letter to current word
    this.currentWord.push(prediction);
    this.lastLetterTime = currentTime;

    // Clear existing timeout
    if (this.wordTimeoutId) {
      clearTimeout(this.wordTimeoutId);
    }

    // Set timeout to complete word
    this.wordTimeoutId = setTimeout(() => {
      this.completeCurrentWord();
    }, this.wordTimeout);
  }

  public addSpace(): void {
    if (this.currentWord.length > 0) {
      this.completeCurrentWord();
    }
  }

  public deleteLastLetter(): void {
    if (this.currentWord.length > 0) {
      this.currentWord.pop();
    }
  }

  private completeCurrentWord(): void {
    if (this.currentWord.length === 0) return;

    const word = this.currentWord.map(p => p.letter).join('');
    const averageConfidence = this.currentWord.reduce((sum, p) => sum + p.confidence, 0) / this.currentWord.length;
    const completionTime = Date.now() - this.wordStartTime;

    // Calculate accuracy based on letter confidence and word validity
    let accuracy = averageConfidence;
    if (this.isValidWord(word)) {
      accuracy = Math.min(accuracy + 0.1, 1.0); // Boost for valid words
    }

    const wordPrediction: WordPrediction = {
      word,
      confidence: averageConfidence,
      letters: [...this.currentWord],
      completionTime,
      accuracy
    };

    this.recognizedWords.push(wordPrediction);
    this.currentWord = [];

    if (this.wordTimeoutId) {
      clearTimeout(this.wordTimeoutId);
      this.wordTimeoutId = null;
    }
  }

  private isValidWord(word: string): boolean {
    return this.commonWords.includes(word.toUpperCase());
  }

  private calculateLevenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  private getSuggestions(word: string): string[] {
    const suggestions: { word: string; distance: number }[] = [];
    
    for (const commonWord of this.commonWords) {
      const distance = this.calculateLevenshteinDistance(word.toUpperCase(), commonWord);
      if (distance <= 2 && distance > 0) { // Only suggest if 1-2 character difference
        suggestions.push({ word: commonWord, distance });
      }
    }

    return suggestions
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3)
      .map(s => s.word);
  }

  private getGrammarCorrections(): { original: string; suggested: string }[] {
    const corrections: { original: string; suggested: string }[] = [];
    
    for (const wordPred of this.recognizedWords) {
      if (!this.isValidWord(wordPred.word) && wordPred.word.length > 2) {
        const suggestions = this.getSuggestions(wordPred.word);
        if (suggestions.length > 0) {
          corrections.push({
            original: wordPred.word,
            suggested: suggestions[0]
          });
        }
      }
    }

    return corrections;
  }

  public getCurrentWord(): string {
    return this.currentWord.map(p => p.letter).join('');
  }

  public getWordAnalysis(): WordAnalysis {
    const totalLetters = this.recognizedWords.reduce((sum, word) => sum + word.letters.length, 0);
    const totalConfidence = this.recognizedWords.reduce((sum, word) => sum + word.confidence, 0);
    const averageConfidence = this.recognizedWords.length > 0 ? totalConfidence / this.recognizedWords.length : 0;

    // Calculate recognition speed (letters per minute)
    const totalTime = this.recognizedWords.reduce((sum, word) => sum + word.completionTime, 0);
    const recognitionSpeed = totalTime > 0 ? (totalLetters * 60000) / totalTime : 0; // letters per minute

    // Count word frequency
    const wordCounts: { [key: string]: number } = {};
    this.recognizedWords.forEach(wordPred => {
      const word = wordPred.word.toUpperCase();
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });

    const commonWords = Object.entries(wordCounts)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Generate suggestions for the last word if it's not valid
    const suggestions: string[] = [];
    if (this.recognizedWords.length > 0) {
      const lastWord = this.recognizedWords[this.recognizedWords.length - 1];
      if (!this.isValidWord(lastWord.word)) {
        suggestions.push(...this.getSuggestions(lastWord.word));
      }
    }

    return {
      recognizedWords: [...this.recognizedWords],
      totalLetters,
      averageConfidence,
      recognitionSpeed,
      commonWords,
      suggestions,
      grammarCorrections: this.getGrammarCorrections()
    };
  }

  public clearHistory(): void {
    this.recognizedWords = [];
    this.currentWord = [];
    if (this.wordTimeoutId) {
      clearTimeout(this.wordTimeoutId);
      this.wordTimeoutId = null;
    }
  }

  public exportAnalysis(): string {
    const analysis = this.getWordAnalysis();
    const timestamp = new Date().toISOString();
    
    return JSON.stringify({
      timestamp,
      analysis,
      rawData: {
        recognizedWords: analysis.recognizedWords,
        sessionStats: {
          totalWords: analysis.recognizedWords.length,
          totalLetters: analysis.totalLetters,
          averageConfidence: analysis.averageConfidence,
          recognitionSpeed: analysis.recognitionSpeed
        }
      }
    }, null, 2);
  }
}