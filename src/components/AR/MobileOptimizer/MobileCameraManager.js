export class MobileCameraManager {
  constructor(optimizer) {
    this.optimizer = optimizer;
    this.stream = null;
    this.video = null;
    this.facingMode = 'user'; // Start with front camera
    this.constraints = this.getOptimalConstraints();
  }

  getOptimalConstraints() {
    const { isIOS, isAndroid, screenWidth, screenHeight } = this.optimizer.deviceInfo;
    const { renderScale } = this.optimizer.optimizationSettings;
    
    // Calculate optimal resolution based on device and performance
    let width = Math.min(screenWidth * renderScale, 1280);
    let height = Math.min(screenHeight * renderScale, 720);
    
    // iOS specific optimizations
    if (isIOS) {
      // iOS works better with specific resolutions
      if (width <= 640) { width = 640; height = 480; }
      else if (width <= 1280) { width = 1280; height = 720; }
    }

    return {
      video: {
        facingMode: this.facingMode,
        width: { ideal: width, max: 1920 },
        height: { ideal: height, max: 1080 },
        frameRate: { ideal: this.optimizer.optimizationSettings.trackingFPS, max: 30 }
      },
      audio: false
    };
  }

  async initialize() {
    try {
      // Request camera permission with fallbacks
      this.stream = await navigator.mediaDevices.getUserMedia(this.constraints);
      
      this.video = document.createElement('video');
      this.video.srcObject = this.stream;
      this.video.setAttribute('playsinline', ''); // Critical for iOS
      this.video.setAttribute('muted', '');
      this.video.autoplay = true;
      
      // Wait for video to be ready
      await new Promise((resolve) => {
        this.video.onloadedmetadata = resolve;
      });
      
      return this.video;
      
    } catch (error) {
      console.error('Camera initialization failed:', error);
      return this.handleCameraError(error);
    }
  }

  async switchCamera() {
    if (!this.optimizer.deviceInfo.isMobile) return this.video;
    
    this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
    this.constraints.video.facingMode = this.facingMode;
    
    // Stop current stream
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    
    // Reinitialize with new constraints
    return this.initialize();
  }

  async handleCameraError(error) {
    if (error.name === 'NotAllowedError') {
      throw new Error('Camera permission denied. Please allow camera access for AR features.');
    } else if (error.name === 'NotFoundError') {
      throw new Error('No camera found on this device.');
    } else if (error.name === 'NotReadableError') {
      // Try with lower quality settings
      this.constraints.video.width = { ideal: 640 };
      this.constraints.video.height = { ideal: 480 };
      return this.initialize();
    }
    
    throw error;
  }

  dispose() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    this.stream = null;
    this.video = null;
  }
}