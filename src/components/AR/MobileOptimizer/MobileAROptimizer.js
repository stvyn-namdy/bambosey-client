// components/AR/MobileOptimizer/MobileAROptimizer.js
export class MobileAROptimizer {
  constructor() {
    this.deviceInfo = this.detectDevice();
    this.performanceLevel = this.assessPerformance();
    this.optimizationSettings = this.getOptimizationSettings();
  }

  detectDevice() {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isIOS: false,
        isAndroid: false,
        gpu: 'unknown',
        screenWidth: 1920,
        screenHeight: 1080,
        devicePixelRatio: 1,
        memory: 4,
        cores: 4
      };
    }

    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTablet = /ipad|android(?=.*mobile)/i.test(userAgent);
    const isIOS = /iphone|ipad|ipod/i.test(userAgent);
    const isAndroid = /android/i.test(userAgent);
    
    // GPU detection for performance assessment
    let gpu = 'unknown';
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        gpu = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'webgl';
      }
    } catch (e) {
      console.warn('GPU detection failed:', e);
    }
    
    return {
      isMobile,
      isTablet,
      isIOS,
      isAndroid,
      gpu,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      devicePixelRatio: window.devicePixelRatio || 1,
      memory: navigator.deviceMemory || 2,
      cores: navigator.hardwareConcurrency || 4
    };
  }

  assessPerformance() {
    const { memory, cores, gpu, isMobile } = this.deviceInfo;
    
    let score = 0;
    
    // Memory score (0-30 points)
    if (memory >= 8) score += 30;
    else if (memory >= 4) score += 20;
    else if (memory >= 2) score += 10;
    
    // CPU score (0-25 points)
    if (cores >= 8) score += 25;
    else if (cores >= 4) score += 20;
    else if (cores >= 2) score += 15;
    else score += 10;
    
    // GPU score (0-35 points)
    const gpuLower = gpu.toLowerCase();
    if (gpuLower.includes('adreno 6') || gpuLower.includes('mali-g7') || gpuLower.includes('apple a1')) {
      score += 35; // High-end mobile
    } else if (gpuLower.includes('adreno 5') || gpuLower.includes('mali-g5') || gpuLower.includes('apple a1')) {
      score += 25; // Mid-range mobile
    } else if (gpuLower.includes('adreno') || gpuLower.includes('mali') || gpuLower.includes('apple')) {
      score += 15; // Low-end mobile
    } else {
      score += 10; // Unknown/integrated
    }
    
    // Mobile penalty
    if (isMobile) score -= 10;
    
    // Categorize performance
    if (score >= 70) return 'high';
    if (score >= 50) return 'medium';
    if (score >= 30) return 'low';
    return 'minimal';
  }

  getOptimizationSettings() {
    const settings = {
      high: {
        modelQuality: 'original',
        textureSize: 1024,
        renderScale: 1.0,
        shadowQuality: 'high',
        antialiasing: true,
        trackingFPS: 30,
        maxPolygons: 50000
      },
      medium: {
        modelQuality: 'medium',
        textureSize: 512,
        renderScale: 0.8,
        shadowQuality: 'medium',
        antialiasing: false,
        trackingFPS: 20,
        maxPolygons: 25000
      },
      low: {
        modelQuality: 'low',
        textureSize: 256,
        renderScale: 0.6,
        shadowQuality: 'low',
        antialiasing: false,
        trackingFPS: 15,
        maxPolygons: 10000
      },
      minimal: {
        modelQuality: 'minimal',
        textureSize: 128,
        renderScale: 0.5,
        shadowQuality: 'none',
        antialiasing: false,
        trackingFPS: 10,
        maxPolygons: 5000
      }
    };

    return settings[this.performanceLevel];
  }
}