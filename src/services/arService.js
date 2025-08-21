// services/arService.js
class ARService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  }

  async generateModel(productId, images) {
    try {
      const response = await fetch(`${this.baseURL}/api/ar/generate-model`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, images })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Model generation failed:', error);
      throw new Error('Failed to generate 3D model');
    }
  }

  async uploadModel(modelData, filename) {
    try {
      const formData = new FormData();
      formData.append('model', new Blob([modelData]), filename);

      const response = await fetch(`${this.baseURL}/api/ar/upload-model`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Model upload failed:', error);
      throw new Error('Failed to upload model');
    }
  }

  async trackARUsage(productId, eventType, metadata = {}) {
    try {
      // Don't await this to avoid blocking the user experience
      fetch(`${this.baseURL}/api/ar/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          eventType,
          metadata: {
            ...metadata,
            userAgent: navigator.userAgent,
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight
            },
            devicePixelRatio: window.devicePixelRatio
          },
          timestamp: new Date().toISOString()
        })
      }).catch(error => {
        console.warn('Analytics tracking failed:', error);
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }

  async getModelStatus(sessionId) {
    try {
      const response = await fetch(`${this.baseURL}/api/ar/model-status/${sessionId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get model status:', error);
      throw new Error('Failed to get model status');
    }
  }
}

export const arService = new ARService();