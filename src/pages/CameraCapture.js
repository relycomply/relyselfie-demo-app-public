import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Pages.css';
import { analyzeImage, loadFaceApiModels } from 'relyselfie';
import CaptureGuidance from '../components/CaptureGuidance';
import Toast from '../components/Toast';

function CameraCapture() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const [capturing, setCapturing] = useState(false);
  const [delay, setDelay] = useState(200);
  const [analysis, setAnalysis] = useState(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [capturingMessage, setCapturingMessage] = useState('');
  const [showJson, setShowJson] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    startCamera();

    const currentVideoRef = videoRef.current;

    return () => {
      const stream = currentVideoRef?.srcObject;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  useEffect(() => {
    loadFaceApiModels().catch(err => console.error("Error loading models:", err));
  }, []);

  // Video loaded and ready
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoReady = () => {
      setIsVideoReady(true);
    };

    video.addEventListener('loadedmetadata', handleVideoReady);
    video.addEventListener('playing', handleVideoReady);

    return () => {
      video.removeEventListener('loadedmetadata', handleVideoReady);
      video.removeEventListener('playing', handleVideoReady);
    };
  }, []);

  // Analysis loop
  useEffect(() => {
    if (!isVideoReady) return;

    let animationFrame;
    
    const analyzeFrame = async () => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        if (canvas.width > 0 && canvas.height > 0) {
          // Flip the context horizontally for capturing (otherwise movement is weird)
          context.save();
          context.scale(-1, 1);
          context.translate(-canvas.width, 0);
          context.drawImage(video, 0, 0);
          context.restore();

          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          
          // Pass video reference to analyzeImage for face detection
          const results = await analyzeImage(imageData, video);
          setAnalysis(results);

          // Automatically capture if all directives pass
          if (results.status === "capture" && !capturing) {
            captureImages();
          }
        }
      }
      
      animationFrame = requestAnimationFrame(analyzeFrame);
    };
    
    analyzeFrame();
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isVideoReady, capturing]);

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Flip the context horizontally for capturing (otherwise movement is weird)
      context.save();
      context.scale(-1, 1);
      context.translate(-canvas.width, 0);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      context.restore();

      return canvas.toDataURL('image/jpeg');
    }
    return null;
  };

  const captureImages = async () => {
    if (capturing) return;
    setCapturing(true);
    setCapturingMessage('Capturing images... Please hold still.');

    await new Promise(resolve => setTimeout(resolve, 2000));

    const imagesWithScores = [];

    for (let i = 0; i < process.env.REACT_APP_NUM_IMAGES_TO_CAPTURE; i++) {
      const image = takePhoto();
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const analysis = await analyzeImage(imageData, videoRef.current);

      imagesWithScores.push({ image, score: parseFloat(analysis.score.toFixed(6)) });
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    localStorage.setItem('capturedImages', JSON.stringify(imagesWithScores));
    setCapturingMessage('');

    const stream = videoRef.current?.srcObject;
    stream?.getTracks().forEach(track => track.stop());

    navigate('/success');
  };

  const copyToClipboard = () => {
    if (analysis) {
      navigator.clipboard.writeText(JSON.stringify(analysis, null, 2))
        .then(() => {
          setToastMessage('JSON output copied to clipboard!');
          setTimeout(() => setToastMessage(''), 3000);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
  };

  return (
    <div className="page-container">
      <div className="camera-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
        />
        <canvas ref={canvasRef} style={{ display: 'block', position: 'absolute', top: 0, left: 0 }} />
        <div className="overlay">
          <div className="face-outline-hole"></div>
          <CaptureGuidance analysis={analysis} />
        </div>
      </div>
      <button 
        className="primary-button" 
        onClick={captureImages}
        disabled={capturing}
      >
        {capturing ? 'Capturing...' : 'Take Photo'}
      </button>
      <div className="delay-control">
        <label htmlFor="captureDelay">Capture Delay (ms):</label>
        <input 
          type="range" 
          id="captureDelay" 
          min="0" 
          max="2000" 
          value={delay} 
          step="100"
          onChange={(e) => setDelay(parseInt(e.target.value))}
        />
        <span>{delay}ms</span>
      </div>
      {capturingMessage && <div className="capturing-message">{capturingMessage}</div>}
      
      {analysis && (
        <div className="metrics">
          <div>Overall Score: {Math.round(analysis.score)}</div>
          <div>Brightness: {Math.round(analysis.metrics.brightness)}</div>
          <div>Blur: {Math.round(analysis.metrics.blur)}</div>
          <div>Face Confidence: {Math.round(analysis.metrics.faceConfidence)}%</div>
          <div>Bounding Box Coverage: {Math.round(analysis.metrics.coverage)}%</div>
          <div>Age: {analysis.metrics.age !== null ? Math.round(analysis.metrics.age) : 'N/A'}</div>
          <div>Gender: {analysis.metrics.gender !== null ? analysis.metrics.gender : 'N/A'}</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button className="primary-button" onClick={() => setShowJson(!showJson)}>
          {showJson ? 'Hide JSON Output' : 'Show JSON Output'}
        </button>
        <button className="primary-button" onClick={copyToClipboard}>
          Copy to Clipboard
        </button>
      </div>
      {showJson && (
        <textarea
          className="json-output"
          readOnly
          value={JSON.stringify(analysis, null, 2)}
          rows={25}
          cols={80}
        />
      )}
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
    </div>
  );
}

export default CameraCapture;