import * as tf from '@tensorflow/tfjs';

export interface PredictionResult {
  letter: string;
  confidence: number;
}

export class SignLanguageModel {
  private model: tf.LayersModel | null = null;
  private isLoaded = false;
  
  // ASL alphabet labels (A-Z, plus space and delete)
  private readonly labels = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    'SPACE', 'DELETE'
  ];

  constructor() {
    this.loadModel();
  }

  private async loadModel(): Promise<void> {
    try {
      // For demo purposes, we'll create a simple model structure
      // In production, you would load a pre-trained model
      this.model = await this.createDemoModel();
      this.isLoaded = true;
      console.log('Sign language model loaded successfully');
    } catch (error) {
      console.error('Failed to load sign language model:', error);
    }
  }

  private async createDemoModel(): Promise<tf.LayersModel> {
    // Create a simple demo model for demonstration
    // In production, replace this with your trained model
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [21 * 2], units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: this.labels.length, activation: 'softmax' })
      ]
    });

    // Compile the model
    model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  public async predict(landmarks: number[][]): Promise<PredictionResult | null> {
    if (!this.isLoaded || !this.model || !landmarks || landmarks.length === 0) {
      return null;
    }

    try {
      // Flatten landmarks to match model input shape
      const flatLandmarks = landmarks.flat();
      
      // Ensure we have the expected number of features (21 landmarks * 2 coordinates = 42)
      if (flatLandmarks.length !== 42) {
        return null;
      }

      // Convert to tensor and normalize
      const inputTensor = tf.tensor2d([flatLandmarks], [1, 42]);
      const normalizedInput = inputTensor.div(tf.scalar(640)); // Normalize by image width
      
      // Make prediction
      const prediction = this.model.predict(normalizedInput) as tf.Tensor;
      const probabilities = await prediction.data();
      
      // Find the class with highest probability
      let maxIndex = 0;
      let maxConfidence = probabilities[0];
      
      for (let i = 1; i < probabilities.length; i++) {
        if (probabilities[i] > maxConfidence) {
          maxConfidence = probabilities[i];
          maxIndex = i;
        }
      }

      // Clean up tensors
      inputTensor.dispose();
      normalizedInput.dispose();
      prediction.dispose();

      // Return result if confidence is above threshold
      if (maxConfidence > 0.3) {
        return {
          letter: this.labels[maxIndex],
          confidence: maxConfidence
        };
      }

      return null;
    } catch (error) {
      console.error('Prediction error:', error);
      return null;
    }
  }

  public isModelLoaded(): boolean {
    return this.isLoaded;
  }

  public getLabels(): string[] {
    return [...this.labels];
  }
}