import * as THREE from 'three';

export class MobileOptimizedARScene {
  constructor(container, video, optimizer) {
    this.container = container;
    this.video = video;
    this.optimizer = optimizer;
    this.settings = optimizer.optimizationSettings;
    
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    
    // Mobile-optimized renderer setup
    this.renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: this.settings.antialiasing,
      powerPreference: optimizer.deviceInfo.isMobile ? 'low-power' : 'high-performance',
      precision: optimizer.performanceLevel === 'minimal' ? 'lowp' : 'highp'
    });
    
    this.currentToteModel = null;
    this.videoMesh = null;
    
    this.setupMobileScene();
    this.setupTouchControls();
  }

  setupMobileScene() {
    const { renderScale, shadowQuality } = this.settings;
    
    // Set render scale for performance
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio * renderScale, 2));
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    
    // Shadow configuration based on performance
    if (shadowQuality !== 'none') {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = shadowQuality === 'high' ? 
        THREE.PCFSoftShadowMap : THREE.BasicShadowMap;
    }
    
    // Optimized lighting setup
    this.setupOptimizedLighting();
    
    // Video background with performance optimization
    this.setupVideoBackground();
    
    this.container.appendChild(this.renderer.domElement);
  }

  setupOptimizedLighting() {
    const { shadowQuality } = this.settings;
    
    // Minimal lighting for low-end devices
    if (this.optimizer.performanceLevel === 'minimal') {
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      this.scene.add(ambientLight);
      return;
    }
    
    // Standard lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    
    directionalLight.position.set(10, 10, 5);
    
    // Shadows only for medium+ performance
    if (shadowQuality !== 'none' && shadowQuality !== 'low') {
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = this.settings.textureSize;
      directionalLight.shadow.mapSize.height = this.settings.textureSize;
    }
    
    this.scene.add(ambientLight);
    this.scene.add(directionalLight);
  }

  setupVideoBackground() {
    try {
      const videoTexture = new THREE.VideoTexture(this.video);
      videoTexture.minFilter = THREE.LinearFilter;
      videoTexture.magFilter = THREE.LinearFilter;
      
      // Reduce video texture updates for performance
      if (this.optimizer.performanceLevel === 'low' || this.optimizer.performanceLevel === 'minimal') {
        videoTexture.generateMipmaps = false;
      }
      
      const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
      const videoGeometry = new THREE.PlaneGeometry(16, 9);
      this.videoMesh = new THREE.Mesh(videoGeometry, videoMaterial);
      this.videoMesh.position.z = -10;
      
      this.scene.add(this.videoMesh);
      
    } catch (error) {
      console.error('Video background setup failed:', error);
      // Fallback to solid color background
      this.renderer.setClearColor(0x000000, 0);
    }
  }

  setupTouchControls() {
    if (!this.optimizer.deviceInfo.isMobile) return;
    
    let isRotating = false;
    let previousTouch = null;
    
    this.renderer.domElement.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        isRotating = true;
        previousTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    });
    
    this.renderer.domElement.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (isRotating && e.touches.length === 1 && this.currentToteModel) {
        const touch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        const deltaX = touch.x - previousTouch.x;
        
        // Rotate tote model based on touch
        this.currentToteModel.rotation.y += deltaX * 0.01;
        previousTouch = touch;
      }
    });
    
    this.renderer.domElement.addEventListener('touchend', () => {
      isRotating = false;
    });
  }

  async loadToteModel(productData) {
    const { modelQuality } = this.settings;
    
    try {
      // Use appropriate model quality
      const modelUrl = productData.models?.[modelQuality] || this.getFallbackModelUrl(productData);
      
      const loader = new THREE.GLTFLoader();
      
      return new Promise((resolve, reject) => {
        loader.load(modelUrl, (gltf) => {
          const toteModel = gltf.scene;
          
          // Optimize model for mobile
          this.optimizeModelForMobile(toteModel);
          
          // Scale based on device
          const scale = this.optimizer.deviceInfo.isMobile ? 0.4 : 0.5;
          toteModel.scale.set(scale, scale, scale);
          
          // Remove existing model
          if (this.currentToteModel) {
            this.scene.remove(this.currentToteModel);
          }
          
          this.scene.add(toteModel);
          this.currentToteModel = toteModel;
          
          resolve(toteModel);
        }, undefined, reject);
      });
    } catch (error) {
      console.error('Model loading failed:', error);
      return this.loadFallbackModel(productData);
    }
  }

  async loadFallbackModel(productData) {
    // Create a simple box as fallback
    const geometry = new THREE.BoxGeometry(0.3, 0.4, 0.1);
    const material = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    
    // Remove existing model
    if (this.currentToteModel) {
      this.scene.remove(this.currentToteModel);
    }
    
    this.currentToteModel = new THREE.Mesh(geometry, material);
    this.scene.add(this.currentToteModel);
    
    return this.currentToteModel;
  }

  getFallbackModelUrl(productData) {
    // Return a generic model URL based on product category
    const category = productData.category || 'default';
    return `/models/fallback/${category}-tote.glb`;
  }

  optimizeModelForMobile(model) {
    const { maxPolygons, textureSize } = this.settings;
    
    model.traverse((child) => {
      if (child.isMesh) {
        // Optimize materials
        if (child.material) {
          child.material.transparent = false; // Disable transparency for performance
          
          // Disable features for low-end devices
          if (this.optimizer.performanceLevel === 'minimal') {
            child.material.roughness = 0.5; // Fixed roughness
            child.material.metalness = 0; // No metallic reflection
            child.castShadow = false;
            child.receiveShadow = false;
          }
        }
      }
    });
  }

  updateVideo(newVideo) {
    this.video = newVideo;
    this.setupVideoBackground();
  }

  async capturePhoto() {
    return new Promise((resolve) => {
      // Temporarily increase resolution for capture
      const originalSize = {
        width: this.renderer.domElement.width,
        height: this.renderer.domElement.height
      };
      
      this.renderer.setSize(1080, 1920);
      this.renderer.render(this.scene, this.camera);
      
      // Capture the frame
      this.renderer.domElement.toBlob((blob) => {
        // Restore original size
        this.renderer.setSize(originalSize.width, originalSize.height);
        resolve(blob);
      }, 'image/jpeg', 0.9);
    });
  }

  handleResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    
    // Update video background aspect ratio
    if (this.videoMesh && this.video) {
      const videoAspect = this.video.videoWidth / this.video.videoHeight;
      const containerAspect = width / height;
      
      if (videoAspect > containerAspect) {
        this.videoMesh.scale.set(containerAspect / videoAspect, 1, 1);
      } else {
        this.videoMesh.scale.set(1, videoAspect / containerAspect, 1);
      }
    }
  }

  render() {
    if (this.renderer && this.scene && this.camera) {
      requestAnimationFrame(() => this.render());
      this.renderer.render(this.scene, this.camera);
    }
  }

  dispose() {
    if (this.currentToteModel) {
      this.scene.remove(this.currentToteModel);
    }
    
    if (this.videoMesh) {
      this.scene.remove(this.videoMesh);
    }
    
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}