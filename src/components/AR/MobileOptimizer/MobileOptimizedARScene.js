import * as THREE from 'three';

export class MobileOptimizedARScene {
  constructor(poseService, arScene, optimizer) {
    this.poseService = poseService;
    this.arScene = arScene;
    this.optimizer = optimizer;
    this.isTracking = false;
    
    this.trackingInterval = Math.floor(1000 / optimizer.optimizationSettings.trackingFPS);
    this.frameSkip = optimizer.performanceLevel === 'minimal' ? 3 : 1;
    this.currentFrame = 0;
    this.frameId = 0;
    
    this.positionHistory = [];
    this.maxHistorySize = 5;
    
    this.video = null;
    this.worker = null;
    this.workerSupported = false;
    
    this.setupWorker();
  }

  async setupWorker() {
    if (typeof Worker !== 'undefined' && this.optimizer.performanceLevel !== 'minimal') {
      try {
        this.worker = new Worker(
          new URL('../../../workers/pose-workers.js', import.meta.url),
          { type: 'module' }
        );
        this.workerSupported = true;

        this.worker.onmessage = (e) => {
          this.handleWorkerMessage(e.data);
        };

        this.worker.onerror = (error) => {
          console.error('Worker error:', error);
          this.workerSupported = false;
          this.worker = null;
        };

        this.worker.postMessage({ type: 'INIT' });
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

      case 'POSE_FRAME':
        // Process blob with existing poseService on the main thread
        this.poseService.detectPose(data.imageData).then((poseData) => {
          this.updateTotePosition(poseData, true);
        });
        break;

      case 'ERROR':
        console.error('Worker pose detection error:', data.message);
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
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const scale = this.optimizer.deviceInfo.isMobile ? 0.5 : 1;
      canvas.width = this.video.videoWidth * scale;
      canvas.height = this.video.videoHeight * scale;
      
      ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(async (blob) => {
        if (this.workerSupported && this.worker) {
          this.frameId++;
          this.worker.postMessage({
            type: 'DETECT_POSE',
            data: { imageData: blob, timestamp: Date.now(), frameId: this.frameId }
          });
        } else {
          // fallback to main thread detection
          const poseData = await this.poseService.detectPose(blob);
          this.updateTotePosition(poseData, false);
        }
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
      return;
    }
    
    const shoulderCenter = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2
    };
    
    this.positionHistory.push(shoulderCenter);
    if (this.positionHistory.length > this.maxHistorySize) {
      this.positionHistory.shift();
    }
    
    const smoothedPosition = this.calculateSmoothedPosition();
    const worldPosition = this.screenToWorld(smoothedPosition);
    
    this.applyPositionWithInterpolation(worldPosition, leftShoulder, rightShoulder);
  }

  calculateSmoothedPosition() {
    if (this.positionHistory.length === 0) return { x: 0.5, y: 0.5 };
    
    const totalWeight = this.positionHistory.length;
    let smoothedX = 0;
    let smoothedY = 0;
    
    this.positionHistory.forEach((pos, index) => {
      const weight = (index + 1) / totalWeight;
      smoothedX += pos.x * weight;
      smoothedY += pos.y * weight;
    });
    
    const weightSum = this.positionHistory.reduce(
      (sum, _, index) => sum + (index + 1) / totalWeight, 0
    );
    
    return { x: smoothedX / weightSum, y: smoothedY / weightSum };
  }

  applyPositionWithInterpolation(worldPosition, leftShoulder, rightShoulder) {
    const model = this.arScene.currentToteModel;
    const targetPosition = new THREE.Vector3(worldPosition.x, worldPosition.y - 0.5, worldPosition.z);
    
    const lerpFactor = this.optimizer.deviceInfo.isMobile ? 0.1 : 0.2;
    model.position.lerp(targetPosition, lerpFactor);
    
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
