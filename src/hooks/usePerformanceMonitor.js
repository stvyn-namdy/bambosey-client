import { useState, useEffect, useCallback } from 'react';

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    frameRate: 0,
    memoryUsage: 0,
    batteryLevel: 1,
    isMonitoring: false
  });

  const [frameCount, setFrameCount] = useState(0);
  const [lastTime, setLastTime] = useState(performance.now());

  const startMonitoring = useCallback(() => {
    setMetrics(prev => ({ ...prev, isMonitoring: true }));
    setLastTime(performance.now());
    setFrameCount(0);
  }, []);

  const stopMonitoring = useCallback(() => {
    setMetrics(prev => ({ ...prev, isMonitoring: false }));
  }, []);

  // Frame rate monitoring
  useEffect(() => {
    if (!metrics.isMonitoring) return;

    let animationFrame;
    
    const measureFrameRate = () => {
      setFrameCount(prev => prev + 1);
      
      const now = performance.now();
      if (now - lastTime >= 1000) {
        const fps = frameCount;
        
        setMetrics(prev => ({
          ...prev,
          frameRate: fps
        }));
        
        setFrameCount(0);
        setLastTime(now);
      }
      
      if (metrics.isMonitoring) {
        animationFrame = requestAnimationFrame(measureFrameRate);
      }
    };
    
    animationFrame = requestAnimationFrame(measureFrameRate);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [metrics.isMonitoring, frameCount, lastTime]);

  // Memory monitoring
  useEffect(() => {
    if (!metrics.isMonitoring) return;

    const interval = setInterval(() => {
      if (performance.memory) {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: performance.memory.usedJSHeapSize
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [metrics.isMonitoring]);

  // Battery monitoring
  useEffect(() => {
    if (!metrics.isMonitoring || !navigator.getBattery) return;

    navigator.getBattery().then(battery => {
      const updateBattery = () => {
        setMetrics(prev => ({
          ...prev,
          batteryLevel: battery.level
        }));
      };
      
      updateBattery();
      battery.addEventListener('levelchange', updateBattery);
      
      return () => {
        battery.removeEventListener('levelchange', updateBattery);
      };
    }).catch(error => {
      console.warn('Battery API not available:', error);
    });
  }, [metrics.isMonitoring]);

  return {
    metrics,
    startMonitoring,
    stopMonitoring
  };
};