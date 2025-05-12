import React, { useState } from 'react';

function CaptureScreen() {
  const [delay, setDelay] = useState(500);

  const handleDelayChange = (e) => {
    setDelay(parseInt(e.target.value));
  };

  return (
    <div className="capture-screen">
      <div className="delay-control">
        <label htmlFor="captureDelay">Capture Delay (ms):</label>
        <input 
          type="range" 
          id="captureDelay" 
          min="0" 
          max="2000" 
          value={delay} 
          step="100"
          onChange={handleDelayChange}
        />
        <span>{delay}ms</span>
      </div>
    </div>
  );
}

export default CaptureScreen; 