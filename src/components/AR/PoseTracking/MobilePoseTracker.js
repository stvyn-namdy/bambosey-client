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
    
    // Prediction smoothing for mobile
    this.positionHistory = [];
    this.maxHistorySize = 5;
    
    this.video = null;
    
    console.log('MobilePoseTracker initialized (main thread processing)');
  }

  startTracking(video) {
    this.isTracking = true;
    this.video = video;
    this.trackingLoop();
  }

  stopTracking() {
    this.isTracking = false;
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
        // Process in main thread only
        const poseData = await this.poseService.detectPose(blob);
        this.updateTotePosition(poseData, false);
      }, 'image/jpeg', 0.7);
      
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