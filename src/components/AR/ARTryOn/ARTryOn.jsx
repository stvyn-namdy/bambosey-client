// components/AR/ARTryOn/ARTryOn.jsx
import { useEffect, useRef, useState } from 'react';
import { useAR } from '../../../context/ARContext';
import { MobileAROptimizer } from '../MobileOptimizer/MobileAROptimizer';
import { MobileCameraManager } from '../MobileOptimizer/MobileCameraManager';
import { MobileOptimizedARScene } from '../MobileOptimizer/MobileOptimizedARScene';
import { MobilePoseTracker } from '../PoseTracking/MobilePoseTracker';
import { PoseDetectionService } from '../PoseTracking/PoseDectectionService';
import ARControls from './ARControls';
import ARLoadingState from '../UI/ARLoadingState';
import ARErrorState from '../UI/ARErrorState';

const ARTryOn = () => {
  const { currentProduct, stopAR } = useAR();
  const containerRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('Initializing camera...');
  
  // AR components refs
  const optimizerRef = useRef(null);
  const cameraManagerRef = useRef(null);
  const arSceneRef = useRef(null);
  const poseTrackerRef = useRef(null);

  useEffect(() => {
    if (currentProduct) {
      initializeAR();
    }
    
    return cleanup;
  }, [currentProduct]);

  const initializeAR = async () => {
    try {
      setLoadingMessage('Checking device capabilities...');
      
      // Initialize mobile optimizer
      const optimizer = new MobileAROptimizer();
      optimizerRef.current = optimizer;
      
      setLoadingMessage('Requesting camera access...');
      
      // Initialize camera
      const cameraManager = new MobileCameraManager(optimizer);
      const video = await cameraManager.initialize();
      cameraManagerRef.current = cameraManager;
      
      setLoadingMessage('Setting up AR environment...');
      
      // Initialize AR scene
      if (!containerRef.current) {
        throw new Error('AR container not found');
      }
      
      const arScene = new MobileOptimizedARScene(
        containerRef.current,
        video,
        optimizer
      );
      arSceneRef.current = arScene;
      
      setLoadingMessage('Loading 3D model...');
      
      // Load product model
      await loadProductModel(arScene, optimizer);
      
      setLoadingMessage('Starting pose detection...');
      
      // Initialize pose tracking
      const poseService = new PoseDetectionService(
        process.env.NEXT_PUBLIC_AZURE_VISION_ENDPOINT,
        process.env.NEXT_PUBLIC_AZURE_VISION_KEY
      );
      
      const poseTracker = new MobilePoseTracker(poseService, arScene, optimizer);
      poseTrackerRef.current = poseTracker;
      
      // Start AR experience
      arScene.render();
      poseTracker.startTracking(video);
      
      setIsInitialized(true);
      setIsLoading(false);
      
    } catch (err) {
      console.error('AR initialization failed:', err);
      setError(err.message || 'Failed to initialize AR experience');
      setIsLoading(false);
    }
  };

  const loadProductModel = async (arScene, optimizer) => {
    try {
      // Check if model already exists
      if (currentProduct.models) {
        await arScene.loadToteModel(currentProduct);
        return;
      }
      
      // Generate model from product images
      const response = await fetch('/api/ar/generate-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: currentProduct.id,
          images: currentProduct.images || []
        })
      });
      
      if (!response.ok) {
        throw new Error('Model generation failed');
      }
      
      const { models } = await response.json();
      await arScene.loadToteModel({ ...currentProduct, models });
      
    } catch (error) {
      console.warn('Model loading failed, using fallback:', error);
      await arScene.loadFallbackModel(currentProduct);
    }
  };

  const cleanup = () => {
    if (poseTrackerRef.current) {
      poseTrackerRef.current.stopTracking();
    }
    
    if (cameraManagerRef.current?.stream) {
      cameraManagerRef.current.stream.getTracks().forEach(track => track.stop());
    }
    
    if (arSceneRef.current) {
      arSceneRef.current.dispose();
    }
  };

  if (!currentProduct) {
    return null;
  }

  if (error) {
    return (
      <ARErrorState 
        error={error}
        onClose={stopAR}
        onRetry={() => {
          setError(null);
          setIsLoading(true);
          initializeAR();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div ref={containerRef} className="w-full h-full relative">
        {isLoading && <ARLoadingState message={loadingMessage} />}
        
        {isInitialized && (
          <ARControls
            productData={currentProduct}
            onClose={stopAR}
            arScene={arSceneRef.current}
            cameraManager={cameraManagerRef.current}
            poseTracker={poseTrackerRef.current}
          />
        )}
      </div>
    </div>
  );
};

export default ARTryOn;