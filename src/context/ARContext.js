'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { arService } from '../services/arService';

const ARContext = createContext();

export const useAR = () => {
  const context = useContext(ARContext);
  if (!context) {
    throw new Error('useAR must be used within an ARProvider');
  }
  return context;
};

export const ARProvider = ({ children }) => {
  const [isARActive, setIsARActive] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [arSupported, setArSupported] = useState(null);
  const [deviceCapabilities, setDeviceCapabilities] = useState(null);

  const checkARSupport = useCallback(async () => {
    if (typeof window === 'undefined') return false;

    const supported = !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      window.WebGLRenderingContext &&
      window.Worker
    );

    setArSupported(supported);
    return supported;
  }, []);

  const startAR = useCallback(async (productData) => {
    try {
      const supported = await checkARSupport();
      if (!supported) {
        throw new Error('AR not supported on this device');
      }

      setCurrentProduct(productData);
      setIsARActive(true);
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Track AR start
      arService.trackARUsage(productData.id, 'ar_started');
      
    } catch (error) {
      console.error('Failed to start AR:', error);
      throw error;
    }
  }, [checkARSupport]);

  const stopAR = useCallback(() => {
    setIsARActive(false);
    setCurrentProduct(null);
    
    // Restore body scroll
    document.body.style.overflow = 'auto';
    
    // Track AR end
    if (currentProduct) {
      arService.trackARUsage(currentProduct.id, 'ar_ended');
    }
  }, [currentProduct]);

  const value = {
    isARActive,
    currentProduct,
    arSupported,
    deviceCapabilities,
    startAR,
    stopAR,
    checkARSupport
  };

  return <ARContext.Provider value={value}>{children}</ARContext.Provider>;
};