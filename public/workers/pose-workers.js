// Pose processing worker for background computation
let poseService = null;

// Import Azure pose detection (simplified for worker environment)
class WorkerPoseDetectionService {
  constructor(endpoint, apiKey) {
    this.endpoint = endpoint;
    this.apiKey = apiKey;
    this.cache = new Map();
    this.cacheTimeout = 500;
  }

  async detectPose(imageData) {
    try {
      // Call Azure API from worker
      const result = await this.callAzureAPI(imageData);
      return this.processPoseData(result);
    } catch (error) {
      console.error('Worker pose detection failed:', error);
      return this.generateMockPoseData();
    }
  }

  async callAzureAPI(imageData) {
    const response = await fetch(`${this.endpoint}/vision/v3.2/detect`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': this.apiKey,
        'Content-Type': 'application/octet-stream'
      },
      body: imageData
    });

    if (!response.ok) {
      throw new Error(`Azure API error: ${response.status}`);
    }

    return await response.json();
  }

  processPoseData(azureResult) {
    const keyPoints = {
      leftShoulder: null,
      rightShoulder: null,
      leftHip: null,
      rightHip: null
    };

    const personObjects = azureResult.objects?.filter(obj => 
      obj.object?.toLowerCase().includes('person') && obj.confidence > 0.5
    ) || [];

    if (personObjects.length === 0) {
      return null;
    }

    const person = personObjects.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );

    const rect = person.rectangle;
    const centerX = rect.x + rect.w / 2;
    const centerY = rect.y + rect.h / 2;
    
    const shoulderY = rect.y + rect.h * 0.25;
    const shoulderOffset = rect.w * 0.3;
    
    keyPoints.leftShoulder = {
      x: centerX - shoulderOffset,
      y: shoulderY,
      confidence: person.confidence * 0.8
    };
    
    keyPoints.rightShoulder = {
      x: centerX + shoulderOffset,
      y: shoulderY,
      confidence: person.confidence * 0.8
    };

    const hipY = rect.y + rect.h * 0.65;
    const hipOffset = rect.w * 0.25;
    
    keyPoints.leftHip = {
      x: centerX - hipOffset,
      y: hipY,
      confidence: person.confidence * 0.7
    };
    
    keyPoints.rightHip = {
      x: centerX + hipOffset,
      y: hipY,
      confidence: person.confidence * 0.7
    };

    return keyPoints;
  }

  generateMockPoseData() {
    const centerX = 0.5 + (Math.random() - 0.5) * 0.1;
    const centerY = 0.4 + (Math.random() - 0.5) * 0.05;
    
    return {
      leftShoulder: {
        x: centerX - 0.1,
        y: centerY,
        confidence: 0.85 + Math.random() * 0.1
      },
      rightShoulder: {
        x: centerX + 0.1,
        y: centerY,
        confidence: 0.85 + Math.random() * 0.1
      },
      leftHip: {
        x: centerX - 0.08,
        y: centerY + 0.3,
        confidence: 0.8 + Math.random() * 0.1
      },
      rightHip: {
        x: centerX + 0.08,
        y: centerY + 0.3,
        confidence: 0.8 + Math.random() * 0.1
      }
    };
  }
}

// Worker message handling
self.onmessage = async function(e) {
  const { type, data } = e.data;

  try {
    switch (type) {
      case 'INIT':
        // Initialize pose service with Azure credentials
        poseService = new WorkerPoseDetectionService(data.endpoint, data.apiKey);
        self.postMessage({ type: 'INIT_SUCCESS' });
        break;

      case 'DETECT_POSE':
        if (!poseService) {
          throw new Error('Pose service not initialized');
        }

        const poseData = await poseService.detectPose(data.imageData);
        
        self.postMessage({
          type: 'POSE_DETECTED',
          data: {
            poseData,
            timestamp: data.timestamp,
            frameId: data.frameId
          }
        });
        break;

      case 'CLEANUP':
        // Clean up resources
        poseService = null;
        self.postMessage({ type: 'CLEANUP_SUCCESS' });
        break;

      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      data: {
        message: error.message,
        timestamp: data?.timestamp,
        frameId: data?.frameId
      }
    });
  }
};

// Handle worker errors
self.onerror = function(error) {
  self.postMessage({
    type: 'ERROR',
    data: {
      message: error.message || 'Worker error occurred'
    }
  });
};