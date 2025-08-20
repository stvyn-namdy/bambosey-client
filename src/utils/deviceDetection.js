export class DeviceDetector {
  static detect() {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isIOS: false,
        isAndroid: false,
        screenWidth: 1920,
        screenHeight: 1080,
        devicePixelRatio: 1,
        memory: 4,
        cores: 4,
        gpu: 'unknown'
      };
    }

    const userAgent = navigator.userAgent.toLowerCase();
    
    return {
      isMobile: /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent),
      isTablet: /ipad|android(?=.*mobile)/i.test(userAgent),
      isIOS: /iphone|ipad|ipod/i.test(userAgent),
      isAndroid: /android/i.test(userAgent),
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      devicePixelRatio: window.devicePixelRatio || 1,
      memory: navigator.deviceMemory || 4,
      cores: navigator.hardwareConcurrency || 4,
      gpu: this.detectGPU()
    };
  }

  static detectGPU() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        return debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'webgl';
      }
      
      return 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }

  static assessPerformance(deviceInfo) {
    const { memory, cores, gpu, isMobile } = deviceInfo;
    
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

  static isARSupported() {
    if (typeof window === 'undefined') return false;

    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      window.WebGLRenderingContext &&
      window.Worker
    );
  }

  static getBrowserInfo() {
    if (typeof window === 'undefined') return { name: 'unknown', version: '0' };

    const userAgent = navigator.userAgent;
    let browser = 'unknown';
    let version = '0';

    if (userAgent.indexOf('Chrome') > -1) {
      browser = 'Chrome';
      version = userAgent.match(/Chrome\/(\d+)/)?.[1] || '0';
    } else if (userAgent.indexOf('Firefox') > -1) {
      browser = 'Firefox';
      version = userAgent.match(/Firefox\/(\d+)/)?.[1] || '0';
    } else if (userAgent.indexOf('Safari') > -1) {
      browser = 'Safari';
      version = userAgent.match(/Version\/(\d+)/)?.[1] || '0';
    } else if (userAgent.indexOf('Edge') > -1) {
      browser = 'Edge';
      version = userAgent.match(/Edge\/(\d+)/)?.[1] || '0';
    }

    return { name: browser, version };
  }
}