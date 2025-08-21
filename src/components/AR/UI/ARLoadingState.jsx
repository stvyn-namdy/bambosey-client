// components/AR/UI/ARLoadingState.jsx
const ARLoadingState = ({ message = 'Loading AR...' }) => {
  return (
    <div className="ar-loading-overlay">
      <div className="ar-loading-content">
        <div className="ar-spinner"></div>
        <p className="text-white text-lg font-medium">{message}</p>
        <p className="text-gray-300 text-sm mt-2">
          Please allow camera access when prompted
        </p>
      </div>
    </div>
  );
};

export default ARLoadingState;