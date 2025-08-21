// components/AR/UI/ARErrorState.jsx
const ARErrorState = ({ error, onClose, onRetry }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          AR Unavailable
        </h3>
        
        <p className="text-gray-600 mb-6">
          {error || 'AR features are not available on this device.'}
        </p>
        
        <div className="space-y-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          )}
          
          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            View Product Gallery
          </button>
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>AR requires:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Camera access</li>
            <li>WebGL support</li>
            <li>Modern browser</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ARErrorState;