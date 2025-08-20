import { useState, useCallback, useEffect } from 'react';
import { arService } from '../services/arService';

export const useAR = () => {
  const [isARActive, setIsARActive] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [arSupported, setArSupported] = useState(null);
  const [error, setError] = useState(null);

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
      setError(null);
      const supported = await checkARSupport();
      
      if (!supported) {
        throw new Error('AR not supported on this device');
      }

      setCurrentProduct(productData);
      setIsARActive(true);
      
      // Prevent body scroll
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'hidden';
      }
      
      // Track AR start
      arService.trackARUsage(productData.id, 'ar_started');
      
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [checkARSupport]);

  const stopAR = useCallback(() => {
    const productId = currentProduct?.id;
    
    setIsARActive(false);
    setCurrentProduct(null);
    setError(null);
    
    // Restore body scroll
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'auto';
    }
    
    // Track AR end
    if (productId) {
      arService.trackARUsage(productId, 'ar_ended');
    }
  }, [currentProduct]);

  // Check AR support on mount
  useEffect(() => {
    checkARSupport();
  }, [checkARSupport]);

  return {
    isARActive,
    currentProduct,
    arSupported,
    error,
    startAR,
    stopAR,
    checkARSupport
  };
};