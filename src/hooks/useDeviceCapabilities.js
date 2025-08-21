// hooks/useDeviceCapabilities.js
import { useState, useEffect } from 'react';

export const useDeviceCapabilities = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isIOS: false,
    isAndroid: false,
    screenWidth: 0,
    screenHeight: 0,
    devicePixelRatio: 1,
    memory: 4,
    cores: 4
  });

  const [performanceLevel, setPerformanceLevel] = useState('medium');
  const [isARSupported, setIsARSupported] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect device info
    const userAgent = navigator.userAgent.toLowerCase();
    const info = {
      isMobile: /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent),
      isTablet: /ipad|android(?=.*mobile)/i.test(userAgent),
      isIOS: /iphone|ipad|ipod/i.test(userAgent),
      isAndroid: /android/i.test(userAgent),
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      devicePixelRatio: window.devicePixelRatio || 1,
      memory: navigator.deviceMemory || 4,
      cores: navigator.hardwareConcurrency || 4
    };

    setDeviceInfo(info);

    // Calculate performance level
    let score = 0;
    
    // Memory scoring
    if (info.memory >= 8) score += 30;
    else if (info.memory >= 4) score += 20;
    else if (info.memory >= 2) score += 10;
    
    // CPU scoring
    if (info.cores >= 8) score += 25;
    else if (info.cores >= 4) score += 20;
    else if (info.cores >= 2) score += 15;
    else score += 10;
    
    // Mobile penalty
    if (info.isMobile) score -= 10;
    
    // Set performance level
    if (score >= 70) setPerformanceLevel('high');
    else if (score >= 50) setPerformanceLevel('medium');
    else if (score >= 30) setPerformanceLevel('low');
    else setPerformanceLevel('minimal');

    // Check AR support
    const arSupported = !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      window.WebGLRenderingContext &&
      window.Worker
    );
    
    setIsARSupported(arSupported);

  }, []);

  return { 
    deviceInfo, 
    performanceLevel, 
    isARSupported 
  };
};