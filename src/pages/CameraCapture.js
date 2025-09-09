import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Pages.css';
import { analyzeImage, loadFaceApiModels } from '../relyselfie/relySelfie';
import CaptureGuidance from '../components/CaptureGuidance';
import Toast from '../components/Toast';

// Store the model loading promise at the module level
let faceApiModelsPromise = null;

function CameraCapture() {
  // Start loading models as soon as possible
  if (!faceApiModelsPromise) {
    faceApiModelsPromise = loadFaceApiModels().catch(err => console.error("Error loading models:", err));
  }
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

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const context = canvas.getContext('2d', { willReadFrequently: true });
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

  const captureImages = useCallback(async () => {
    if (capturing) return;
    setCapturing(true);
    setCapturingMessage('Capturing images... Please hold still.');

    // Wait for models to load before capturing
    if (faceApiModelsPromise) {
      await faceApiModelsPromise;
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    const imagesWithScores = [];

    for (let i = 0; i < process.env.REACT_APP_NUM_IMAGES_TO_CAPTURE; i++) {
      const image = takePhoto();
      const canvas = canvasRef.current;
  const context = canvas.getContext('2d', { willReadFrequently: true });
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
  }, [capturing, delay, navigate]);

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

  // Analysis loop with mobile performance optimizations
  useEffect(() => {
    if (!isVideoReady) return;

    let animationFrame;
    let lastAnalysisTime = 0;

    const renderAndAnalyze = async () => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
  const context = canvas.getContext('2d', { willReadFrequently: true });

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        if (canvas.width > 0 && canvas.height > 0) {
          context.save();
          context.scale(-1, 1);
          context.translate(-canvas.width, 0);
          context.drawImage(video, 0, 0);
          context.restore();

          // Throttle only the analysis, not the rendering
          const now = performance.now();
          const analysisInterval = parseInt(process.env.REACT_APP_ANALYSIS_INTERVAL, 10) || 150;

          if (now - lastAnalysisTime >= analysisInterval) {
            lastAnalysisTime = now;

            // Wait for models to load before running inference
            if (faceApiModelsPromise) {
              await faceApiModelsPromise;
            }

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

            const results = await analyzeImage(imageData, video);
            setAnalysis(results);

            // Automatically capture if all directives pass
            if (results.status === "capture" && !capturing) {
              captureImages();
            }
          }
        }
      }

      animationFrame = requestAnimationFrame(renderAndAnalyze);
    };

    renderAndAnalyze();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isVideoReady, capturing, captureImages]);

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