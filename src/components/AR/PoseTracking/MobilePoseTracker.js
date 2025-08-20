import * as THREE from 'three';

export class MobilePoseTracker {
  constructor(poseService, arScene, optimizer) {
    this.poseService = poseService;
    this.arScene = arScene;
    this.optimizer = optimizer;
    this.isTracking = false;
    
    // Adaptive tracking settings
    this.trackingInterval = Math.floor(1000 / optimizer.optimizationSettings.trackingFPS);
    this.frameSkip = optimizer.performanceLevel === 'minimal' ? 3 : 1;
    this.currentFrame = 0;
    this.frameId = 0;
    
    // Prediction smoothing for mobile
    this.positionHistory = [];
    this.maxHistorySize = 5;
    
    this.video = null;
    this.worker = null;
    this.workerSupported = false;
    
    this.setupWorker();
  }

  async setupWorker() {
    // Use Web Worker for pose processing on capable devices
    if (typeof Worker !== 'undefined' && this.optimizer.performanceLevel !== 'minimal') {
      try {
        // Use absolute path from public directory
        this.worker = new Worker('/workers/pose-worker.js');
        this.workerSupported = true;
        
        // Setup worker message handling
        this.worker.onmessage = (e) => {
          this.handleWorkerMessage(e.data);
        };
        
        this.worker.onerror = (error) => {
          console.error('Worker error:', error);
          this.workerSupported = false;
          this.worker = null;
        };

        // Initialize worker with Azure credentials
        this.worker.postMessage({
          type: 'INIT',
          data: {
            endpoint: process.env.NEXT_PUBLIC_AZURE_VISION_ENDPOINT,
            apiKey: process.env.NEXT_PUBLIC_AZURE_VISION_KEY
          }
        });
        
        console.log('Web Worker initialized for pose processing');
        
      } catch (error) {
        console.log('Web Worker not available, using main thread:', error);
        this.workerSupported = false;
      }
    }
  }

  handleWorkerMessage(message) {
    const { type, data } = message;
    
    switch (type) {
      case 'INIT_SUCCESS':
        console.log('Pose worker initialized successfully');
        break;
        
      case 'POSE_DETECTED':
        this.updateTotePosition(data.poseData, true);
        break;
        
      case 'ERROR':
        console.error('Worker pose detection error:', data.message);
        // Fallback to main thread processing
        this.workerSupported = false;
        break;
        
      case 'CLEANUP_SUCCESS':
        console.log('Worker cleanup completed');
        break;
    }
  }

  startTracking(video) {
    this.isTracking = true;
    this.video = video;
    this.frameId = 0;
    this.trackingLoop();
  }

  stopTracking() {
    this.isTracking = false;
    
    if (this.worker) {
      this.worker.postMessage({ type: 'CLEANUP' });
      this.worker.terminate();
      this.worker = null;
    }
  }

  updateVideo(newVideo) {
    this.video = newVideo;
  }

  async trackingLoop() {
    if (!this.isTracking) return;
    
    try {
      this.currentFrame++;
      
      // Skip frames for performance on low-end devices
      if (this.currentFrame % this.frameSkip === 0) {
        await this.captureAndProcessFrame();
      }
      
    } catch (error) {
      console.error('Pose tracking error:', error);
    }
    
    setTimeout(() => this.trackingLoop(), this.trackingInterval);
  }

  async captureAndProcessFrame() {
    if (!this.video || this.video.readyState < 2) return;
    
    try {
      // Create canvas for frame capture
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Use reduced resolution for mobile
      const scale = this.optimizer.deviceInfo.isMobile ? 0.5 : 1;
      canvas.width = this.video.videoWidth * scale;
      canvas.height = this.video.videoHeight * scale;
      
      ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (this.workerSupported && this.worker) {
          // Send to worker for processing
          this.frameId++;
          this.worker.postMessage({
            type: 'DETECT_POSE',
            data: {
              imageData: blob,
              timestamp: Date.now(),
              frameId: this.frameId
            }
          });
        } else {
          // Process in main thread
          const poseData = await this.poseService.detectPose(blob);
          this.updateTotePosition(poseData, false);
        }
      }, 'image/jpeg', 0.7); // Reduced quality for mobile
      
    } catch (error) {
      console.error('Frame capture failed:', error);
    }
  }

  updateTotePosition(poseData, isFromWorker) {
    if (!this.arScene.currentToteModel || !poseData) return;
    
    const { leftShoulder, rightShoulder } = poseData;
    
    if (!leftShoulder || !rightShoulder || 
        leftShoulder.confidence < 0.5 || rightShoulder.confidence < 0.5) {
      return; // Skip low-confidence detections
    }
    
    // Calculate position with smoothing
    const shoulderCenter = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2
    };
    
    // Add to history for smoothing
    this.positionHistory.push(shoulderCenter);
    if (this.positionHistory.length > this.maxHistorySize) {
      this.positionHistory.shift();
    }
    
    // Calculate smoothed position
    const smoothedPosition = this.calculateSmoothedPosition();
    const worldPosition = this.screenToWorld(smoothedPosition);
    
    // Apply position with mobile-optimized interpolation
    this.applyPositionWithInterpolation(worldPosition, leftShoulder, rightShoulder);
  }

  calculateSmoothedPosition() {
    if (this.positionHistory.length === 0) return { x: 0.5, y: 0.5 };
    
    const totalWeight = this.positionHistory.length;
    let smoothedX = 0;
    let smoothedY = 0;
    
    this.positionHistory.forEach((pos, index) => {
      const weight = (index + 1) / totalWeight; // More weight to recent positions
      smoothedX += pos.x * weight;
      smoothedY += pos.y * weight;
    });
    
    const weightSum = this.positionHistory.reduce((sum, _, index) => sum + (index + 1) / totalWeight, 0);
    
    return {
      x: smoothedX / weightSum,
      y: smoothedY / weightSum
    };
  }

  applyPositionWithInterpolation(worldPosition, leftShoulder, rightShoulder) {
    const model = this.arScene.currentToteModel;
    const targetPosition = new THREE.Vector3(worldPosition.x, worldPosition.y - 0.5, worldPosition.z);
    
    // Smooth interpolation for mobile
    const lerpFactor = this.optimizer.deviceInfo.isMobile ? 0.1 : 0.2;
    model.position.lerp(targetPosition, lerpFactor);
    
    // Calculate and apply rotation
    const shoulderAngle = Math.atan2(
      rightShoulder.y - leftShoulder.y,
      rightShoulder.x - leftShoulder.x
    );
    
    const targetRotation = new THREE.Euler(0, 0, shoulderAngle);
    model.rotation.z = THREE.MathUtils.lerp(model.rotation.z, targetRotation.z, lerpFactor);
  }

  screenToWorld(screenPoint) {
    const x = (screenPoint.x - 0.5) * 4;
    const y = -(screenPoint.y - 0.5) * 3;
    const z = 0;
    
    return { x, y, z };
  }
}