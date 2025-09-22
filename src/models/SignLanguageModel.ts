import * as tf from '@tensorflow/tfjs';
import { aslDataset, getTrainingData } from '../data/asl-dataset';

export interface PredictionResult {
  letter: string;
  confidence: number;
}

export class SignLanguageModel {
  private model: tf.LayersModel | null = null;
  private isLoaded = false;
  private isTraining = false;
  
  // ASL alphabet labels (A-Z, plus space and delete)
  private readonly labels = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    'SPACE', 'DELETE'
  ];

  constructor() {
    this.initializeModel();
  }

  private async initializeModel(): Promise<void> {
    try {
      // Try to load existing model first
      await this.loadExistingModel();
      
      if (!this.isLoaded) {
        // If no existing model, create and train a new one
        await this.createAndTrainModel();
      }
      
      console.log('Sign language model ready');
    } catch (error) {
      console.error('Failed to initialize sign language model:', error);
      // Fallback to a simple model
      await this.createFallbackModel();
    }
  }

  private async loadExistingModel(): Promise<void> {
    try {
      // Try to load from localStorage or IndexedDB
      const modelData = localStorage.getItem('asl-model');
      if (modelData) {
        const modelJson = JSON.parse(modelData);
        this.model = await tf.loadLayersModel(tf.io.fromMemory(modelJson));
        this.isLoaded = true;
        console.log('Loaded existing ASL model from storage');
      }
    } catch (error) {
      console.log('No existing model found, will create new one');
    }
  }

  private async createAndTrainModel(): Promise<void> {
    console.log('Creating and training new ASL model...');
    this.isTraining = true;

    try {
      // Get training data from dataset
      const { features, labels } = getTrainingData(this.labels);
      
      if (features.length === 0) {
        throw new Error('No training data available');
      }

      // Create model architecture
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({ 
            inputShape: [42], // 21 landmarks * 2 coordinates
            units: 128, 
            activation: 'relu',
            kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
          }),
          tf.layers.dropout({ rate: 0.3 }),
          tf.layers.dense({ 
            units: 64, 
            activation: 'relu',
            kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
          }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ 
            units: 32, 
            activation: 'relu' 
          }),
          tf.layers.dense({ 
            units: this.labels.length, 
            activation: 'softmax' 
          })
        ]
      });

      // Compile model
      this.model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
      });

      // Convert training data to tensors
      const xs = tf.tensor2d(features);
      const ys = tf.tensor2d(labels);

      // Train the model
      console.log('Training model with', features.length, 'samples...');
      await this.model.fit(xs, ys, {
        epochs: 50,
        batchSize: 8,
        validationSplit: 0.2,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (epoch % 10 === 0) {
              console.log(`Epoch ${epoch}: loss = ${logs?.loss?.toFixed(4)}, accuracy = ${logs?.acc?.toFixed(4)}`);
            }
          }
        }
      });

      // Save model to localStorage
      await this.saveModel();

      // Clean up tensors
      xs.dispose();
      ys.dispose();

      this.isLoaded = true;
      this.isTraining = false;
      console.log('ASL model training completed successfully');
    } catch (error) {
      console.error('Training failed:', error);
      this.isTraining = false;
      await this.createFallbackModel();
    }
  }

  private async createFallbackModel(): Promise<void> {
    console.log('Creating fallback ASL model...');
    
    // Create a simple model for basic functionality
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [42], units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: this.labels.length, activation: 'softmax' })
      ]
    });

    this.model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    this.isLoaded = true;
    console.log('Fallback ASL model created');
  }

  private async saveModel(): Promise<void> {
    try {
      if (this.model) {
        const modelData = await this.model.save(tf.io.withSaveHandler(async (artifacts) => {
          localStorage.setItem('asl-model', JSON.stringify(artifacts));
          return { modelArtifactsInfo: { dateSaved: new Date() } };
        }));
        console.log('Model saved to localStorage');
      }
    } catch (error) {
      console.error('Failed to save model:', error);
    }
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

      // Normalize landmarks (assuming they're already in 0-1 range from MediaPipe)
      const inputTensor = tf.tensor2d([flatLandmarks], [1, 42]);
      
      // Make prediction
      const prediction = this.model.predict(inputTensor) as tf.Tensor;
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
      prediction.dispose();

      // Return result if confidence is above threshold
      if (maxConfidence > 0.4) {
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
    return this.isLoaded && !this.isTraining;
  }

  public isModelTraining(): boolean {
    return this.isTraining;
  }

  public getLabels(): string[] {
    return [...this.labels];
  }

  public getDatasetInfo(): { totalSamples: number; lettersAvailable: string[] } {
    const letters = Object.keys(aslDataset);
    const totalSamples = Object.values(aslDataset).reduce(
      (total, letterData) => total + letterData.samples.length, 
      0
    );
    
    return {
      totalSamples,
      lettersAvailable: letters.sort()
    };
  }

  public async retrainModel(): Promise<void> {
    if (this.isTraining) {
      console.log('Model is already training');
      return;
    }

    console.log('Retraining ASL model with latest dataset...');
    this.isLoaded = false;
    await this.createAndTrainModel();
  }
}