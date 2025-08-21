// src/workers/pose-worker.js

self.onmessage = async (e) => {
  const { type, data } = e.data;

  switch (type) {
    case 'INIT':
      // Worker is ready
      self.postMessage({ type: 'INIT_SUCCESS' });
      break;

    case 'DETECT_POSE':
      try {
        // Send the blob back to the main thread for now
        self.postMessage({
          type: 'POSE_FRAME',
          data: { imageData: data.imageData, frameId: data.frameId }
        });
      } catch (err) {
        self.postMessage({
          type: 'ERROR',
          data: { message: err.message }
        });
      }
      break;

    case 'CLEANUP':
      self.postMessage({ type: 'CLEANUP_SUCCESS' });
      close(); // terminate worker
      break;
  }
};
