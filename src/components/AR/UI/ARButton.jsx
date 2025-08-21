import { useState } from 'react';
import { useAR } from '../../../context/ARContext';
import { useDeviceCapabilities } from '../../../hooks/useDeviceCapabilities';

const ARButton = ({ productData, className = '' }) => {
  const { startAR, arSupported } = useAR();
  const { isARSupported, performanceLevel } = useDeviceCapabilities();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartAR = async () => {
    try {
      setIsLoading(true);
      await startAR(productData);
    } catch (error) {
      console.error('AR start failed:', error);
      // Show user-friendly error message
      alert('AR is not available on this device. Please try on a supported device.');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show AR button on unsupported devices
  if (arSupported === false || !isARSupported) {
    return null;
  }

  return (
    <button
      onClick={handleStartAR}
      disabled={isLoading}
      className={`
        inline-flex items-center gap-2 px-4 py-2 
        bg-gradient-to-r from-purple-600 to-indigo-600 
        hover:from-purple-700 hover:to-indigo-700 
        text-white font-semibold rounded-lg 
        transition-all duration-300 shadow-lg
        hover:shadow-xl transform hover:scale-105
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      aria-label={`Try ${productData.name} in AR`}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
          <span>Loading...</span>
        </>
      ) : (
        <>
          <span className="text-lg">👓</span>
          <span>Try in AR</span>
        </>
      )}
    </button>
  );
};

export default ARButton;