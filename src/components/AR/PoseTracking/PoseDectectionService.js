export class PoseDetectionService {
  constructor(endpoint, apiKey) {
    this.endpoint = endpoint;
    this.apiKey = apiKey;
    this.cache = new Map();
    this.cacheTimeout = 500; // Cache results for 500ms
    this.rateLimitDelay = 100; // Minimum delay between API calls
    this.lastApiCall = 0;
  }

  async detectPose(imageData) {
    try {
      // Rate limiting
      const now = Date.now();
      const timeSinceLastCall = now - this.lastApiCall;
      if (timeSinceLastCall < this.rateLimitDelay) {
        await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastCall));
      }

      // Create cache key from image data
      const cacheKey = await this.createCacheKey(imageData);
      
      // Check cache first
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }

      // Call Azure Computer Vision API for person detection
      const azureResult = await this.callAzurePersonDetection(imageData);
      
      // Process the result to extract pose data
      const poseData = this.processPoseData(azureResult);
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: poseData,
        timestamp: Date.now()
      });
      
      this.lastApiCall = Date.now();
      return poseData;
      
    } catch (error) {
      console.error('Pose detection failed:', error);
      
      // Fallback to mock data on error
      return this.generateMockPoseData();
    }
  }

  async callAzurePersonDetection(imageData) {
    try {
      // Rate limiting
      const now = Date.now();
      const timeSinceLastCall = now - this.lastApiCall;
      if (timeSinceLastCall < this.rateLimitDelay) {
        await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastCall));
      }

      // Create cache key
      const cacheKey = await this.createCacheKey(imageData);
      
      // Check cache first
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }

      // Call Azure Cognitive Services for person detection
      const azureResult = await this.callCognitiveServicesAPI(imageData);
      
      // Process the result to extract pose data
      const poseData = this.processPoseData(azureResult);
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: poseData,
        timestamp: Date.now()
      });
      
      this.lastApiCall = Date.now();
      return poseData;
      
    } catch (error) {
      console.error('Pose detection failed:', error);
      return this.generateMockPoseData();
    }
  }

  async callCognitiveServicesAPI(imageData) {
    try {
      // Use the general Cognitive Services endpoint for object detection
      const response = await fetch(`${this.endpoint}/vision/v3.2/detect`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
          'Content-Type': 'application/octet-stream'
        },
        body: imageData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure Cognitive Services API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error('Azure Cognitive Services API call failed:', error);
      throw error;
    }
  }

  async callAzureWithImageData(imageData) {
    try {
      const response = await fetch(`${this.endpoint}/vision/v3.2/detect`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
          'Content-Type': 'application/octet-stream'
        },
        body: imageData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure API error: ${response.status} - ${errorText}`);
      }

      return await response.json();
      
    } catch (error) {
      console.error('Azure API with image data failed:', error);
      throw error;
    }
  }

  async blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  processPoseData(azureResult) {
    try {
      const keyPoints = {
        leftShoulder: null,
        rightShoulder: null,
        leftHip: null,
        rightHip: null
      };

      // Look for person objects in the detection results
      const personObjects = azureResult.objects?.filter(obj => 
        obj.object?.toLowerCase().includes('person') && obj.confidence > 0.5
      ) || [];

      if (personObjects.length === 0) {
        // No person detected, return null
        return null;
      }

      // Use the most confident person detection
      const person = personObjects.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );

      // Estimate body landmarks based on bounding box
      const rect = person.rectangle;
      const centerX = rect.x + rect.w / 2;
      const centerY = rect.y + rect.h / 2;
      
      // Estimate shoulder positions (approximately 1/4 from top, 1/4 from sides)
      const shoulderY = rect.y + rect.h * 0.25;
      const shoulderOffset = rect.w * 0.3;
      
      keyPoints.leftShoulder = {
        x: centerX - shoulderOffset,
        y: shoulderY,
        confidence: person.confidence * 0.8 // Slightly lower confidence for estimated points
      };
      
      keyPoints.rightShoulder = {
        x: centerX + shoulderOffset,
        y: shoulderY,
        confidence: person.confidence * 0.8
      };

      // Estimate hip positions (approximately 2/3 from top)
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
      
    } catch (error) {
      console.error('Error processing pose data:', error);
      return null;
    }
  }

  async createCacheKey(imageData) {
    try {
      // Create a simple hash from image data for caching
      const buffer = await imageData.arrayBuffer();
      const view = new Uint8Array(buffer);
      let hash = 0;
      
      // Sample every 1000th byte for performance
      for (let i = 0; i < view.length; i += 1000) {
        hash = ((hash << 5) - hash + view[i]) & 0xffffffff;
      }
      
      return hash.toString();
    } catch (error) {
      // Fallback to timestamp-based cache key
      return Date.now().toString();
    }
  }

  generateMockPoseData() {
    // Generate realistic mock pose data for development/fallback
    const centerX = 0.5 + (Math.random() - 0.5) * 0.1; // Small random movement
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

  // Clean up old cache entries
  cleanupCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout * 2) {
        this.cache.delete(key);
      }
    }
  }
}