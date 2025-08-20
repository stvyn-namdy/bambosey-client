// components/AR/ARTryOn/ARControls.jsx
import { useState } from 'react';
import { useCart } from '../../../context/CartContext';
import { arService } from '../../../services/arService';

const ARControls = ({ 
  productData, 
  onClose, 
  arScene, 
  cameraManager, 
  poseTracker 
}) => {
  const { addItem } = useCart();
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);

  const handleCapture = async () => {
    if (!arScene || isCapturing) return;
    
    try {
      setIsCapturing(true);
      
      // Capture high-resolution photo
      const blob = await arScene.capturePhoto();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bambosey-tryon-${productData.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Track capture event
      arService.trackARUsage(productData.id, 'photo_captured');
      
    } catch (error) {
      console.error('Photo capture failed:', error);
      alert('Failed to capture photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSwitchCamera = async () => {
    if (!cameraManager || isSwitchingCamera) return;
    
    try {
      setIsSwitchingCamera(true);
      const newVideo = await cameraManager.switchCamera();
      
      if (arScene && poseTracker) {
        arScene.updateVideo(newVideo);
        poseTracker.updateVideo(newVideo);
      }
      
      arService.trackARUsage(productData.id, 'camera_switched');
      
    } catch (error) {
      console.error('Camera switch failed:', error);
      alert('Failed to switch camera. Please try again.');
    } finally {
      setIsSwitchingCamera(false);
    }
  };

  const handleAddToCart = () => {
    addItem({
      id: productData.id,
      name: productData.name,
      price: productData.price,
      image: productData.images?.[0]?.url || '/placeholder-image.jpg',
      quantity: 1
    });
    
    // Track AR conversion
    arService.trackARUsage(productData.id, 'ar_conversion', {
      source: 'virtual_tryon'
    });
    
    // Show success message briefly then close AR
    alert('Added to cart!');
    setTimeout(onClose, 1500);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Check out this ${productData.name}`,
          text: `I'm trying on this ${productData.name} virtually with Bambosey's AR feature!`,
          url: window.location.href
        });
        
        arService.trackARUsage(productData.id, 'ar_shared', {
          method: 'native_share'
        });
      } else {
        // Fallback sharing
        const text = `Check out this ${productData.name} at Bambosey! ${window.location.href}`;
        
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(text);
          alert('Link copied to clipboard!');
          
          arService.trackARUsage(productData.id, 'ar_shared', {
            method: 'clipboard'
          });
        } else {
          // Final fallback
          prompt('Copy this link to share:', text);
        }
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  return (
    <div className="ar-controls">
      {/* Top Controls */}
      <div className="ar-top-controls">
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-800 text-2xl font-bold"
          aria-label="Close AR"
        >
          ✕
        </button>
        
        <div className="text-center flex-1 mx-4">
          <h4 className="font-semibold text-gray-800">{productData.name}</h4>
          <span className="text-sm text-gray-600">${productData.price}</span>
        </div>
        
        <button
          onClick={handleSwitchCamera}
          disabled={isSwitchingCamera}
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 disabled:opacity-50"
          aria-label="Switch camera"
        >
          {isSwitchingCamera ? '⏳' : '🔄'}
        </button>
      </div>

      {/* Bottom Controls */}
      <div className="ar-bottom-controls">
        <button
          onClick={handleCapture}
          disabled={isCapturing}
          className="ar-btn-round ar-btn-primary"
          aria-label="Capture photo"
        >
          {isCapturing ? '⏳' : '📷'}
        </button>
        
        <button
          onClick={handleAddToCart}
          className="ar-btn ar-btn-success"
        >
          Add to Cart
        </button>
        
        <button
          onClick={handleShare}
          className="ar-btn"
        >
          Share
        </button>
      </div>

      {/* Performance Indicator */}
      <div className="ar-performance-indicator">
        <div className="ar-indicator-dot"></div>
      </div>
    </div>
  );
};

export default ARControls;