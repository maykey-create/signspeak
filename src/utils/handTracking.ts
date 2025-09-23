import { Hands, Results } from '@mediapipe/hands';

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface HandTrackingResult {
  landmarks: HandLandmark[][];
  handedness: string[];
}

export class HandTracker {
  private hands: Hands;
  private isInitialized = false;

  constructor() {
    this.hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });
    
    this.setupHands();
  }

  private setupHands(): void {
    this.hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    this.isInitialized = true;
  }

  public async processFrame(
    videoElement: HTMLVideoElement,
    onResults: (results: HandTrackingResult) => void
  ): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    // Check if video element is ready for processing
    if (!videoElement || 
        videoElement.readyState < 2 || 
        videoElement.videoWidth === 0 || 
        videoElement.videoHeight === 0) {
      return;
    }
    try {
      this.hands.onResults((results: Results) => {
        const handTrackingResult: HandTrackingResult = {
          landmarks: results.multiHandLandmarks || [],
          handedness: results.multiHandedness?.map(h => h.label) || []
        };
        onResults(handTrackingResult);
      });

      await this.hands.send({ image: videoElement });
    } catch (error) {
      console.error('Hand tracking error:', error);
    }
  }

  public close(): void {
    if (this.hands) {
      this.hands.close();
    }
  }
}