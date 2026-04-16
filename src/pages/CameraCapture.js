import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Pages.css';
import { analyzeImage, loadFaceApiModels } from 'relyselfie';
import CaptureGuidance from '../components/CaptureGuidance';
import FaceOutline from '../components/FaceOutline';
import FaceMeshOverlay from '../components/FaceMeshOverlay';
import Toast from '../components/Toast';

// Store the model loading promise at the module level
let faceApiModelsPromise = null;

function CameraCapture() {
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    if (!faceApiModelsPromise) {
      faceApiModelsPromise = loadFaceApiModels();
    }
    let cancelled = false;
    faceApiModelsPromise
      .then(() => { if (!cancelled) setModelsLoaded(true); })
      .catch(err => {
        if (!cancelled) setModelsLoaded(false);
        console.error("Error loading models:", err);
      });
    return () => { cancelled = true; };
  }, []);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const [capturing, setCapturing] = useState(false);
  const capturingRef = useRef(false);
  const [delay, setDelay] = useState(200);
  const [analysis, setAnalysis] = useState(null);
  const analysisRef = useRef(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [showTick, setShowTick] = useState(false);
  const showTickRef = useRef(false);
  const [showMesh, setShowMesh] = useState(false);
  const [capturingMessage, setCapturingMessage] = useState('');
  const [showJson, setShowJson] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Keep refs in sync with state
  useEffect(() => { analysisRef.current = analysis; }, [analysis]);
  useEffect(() => { capturingRef.current = capturing; }, [capturing]);
  useEffect(() => { showTickRef.current = showTick; }, [showTick]);

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

      const cropPadding = parseInt(process.env.REACT_APP_CROP_PADDING, 10);
      const shouldCrop = !isNaN(cropPadding) && cropPadding >= 0;
      const landmarks = analysisRef.current?.faceLandmarks;

      if (shouldCrop && landmarks) {
        // Compute face bounding box from landmarks (pixel coords, mirrored)
        const xs = landmarks.map(l => (1 - l.x) * canvas.width);
        const ys = landmarks.map(l => l.y * canvas.height);
        const x = Math.max(0, Math.floor(Math.min(...xs)) - cropPadding);
        const y = Math.max(0, Math.floor(Math.min(...ys)) - cropPadding);
        const x2 = Math.min(canvas.width, Math.ceil(Math.max(...xs)) + cropPadding);
        const y2 = Math.min(canvas.height, Math.ceil(Math.max(...ys)) + cropPadding);
        const w = x2 - x;
        const h = y2 - y;

        if (w > 0 && h > 0) {
          const cropCanvas = document.createElement('canvas');
          cropCanvas.width = w;
          cropCanvas.height = h;
          const cropCtx = cropCanvas.getContext('2d');
          cropCtx.drawImage(canvas, x, y, w, h, 0, 0, w, h);
          return cropCanvas.toDataURL('image/jpeg');
        }
      }

      return canvas.toDataURL('image/jpeg');
    }
    return null;
  };

  const captureImages = useCallback(async () => {
    if (capturingRef.current || !modelsLoaded) return;
    setCapturing(true);
    capturingRef.current = true;
    setCapturingMessage('Capturing images... Please hold still.');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const imagesWithScores = [];

      for (let i = 0; i < process.env.REACT_APP_NUM_IMAGES_TO_CAPTURE; i++) {
        const image = takePhoto();
        const score = analysisRef.current ? analysisRef.current.score : 50;
        imagesWithScores.push({ image, score: parseFloat(score.toFixed(6)) });
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      localStorage.setItem('capturedImages', JSON.stringify(imagesWithScores));
      setCapturingMessage('');

      // Show tick with white oval fill, then navigate after animation completes
      setShowTick(true);
      await new Promise(resolve => setTimeout(resolve, 1500));

      navigate('/success');
    } catch (err) {
      console.error('Capture failed:', err);
      setCapturing(false);
      capturingRef.current = false;
      setCapturingMessage('');
    }
  }, [delay, navigate, modelsLoaded]);

  useEffect(() => {
    const startCamera = async () => {
      const width = parseInt(process.env.REACT_APP_CAMERA_WIDTH, 10) || 640;
      const height = parseInt(process.env.REACT_APP_CAMERA_HEIGHT, 10) || 480;
      const frameRate = parseInt(process.env.REACT_APP_CAMERA_FRAME_RATE, 10) || 30;

      const constraints = {
        video: {
          facingMode: 'user',
          width: { ideal: width },
          height: { ideal: height },
          frameRate: { ideal: frameRate, max: frameRate },
        },
        audio: false
      };

      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        // Apply advanced constraints if supported (auto-focus, auto-exposure, etc.)
        const track = stream.getVideoTracks()[0];
        if (track && track.applyConstraints) {
          const capabilities = track.getCapabilities ? track.getCapabilities() : {};
          const advanced = {};
          if (capabilities.focusMode && capabilities.focusMode.includes('continuous')) {
            advanced.focusMode = 'continuous';
          }
          if (capabilities.exposureMode && capabilities.exposureMode.includes('continuous')) {
            advanced.exposureMode = 'continuous';
          }
          if (capabilities.whiteBalanceMode && capabilities.whiteBalanceMode.includes('continuous')) {
            advanced.whiteBalanceMode = 'continuous';
          }
          if (Object.keys(advanced).length > 0) {
            try { await track.applyConstraints({ advanced: [advanced] }); } catch (e) { /* ignore */ }
          }
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        // Fall back to basic constraints if detailed ones fail
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (fallbackErr) {
          console.error("Error accessing camera:", fallbackErr);
        }
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
    let analysisInProgress = false;

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

          // Only run analysis if models are loaded and no analysis is already running
          if (modelsLoaded && !analysisInProgress && (now - lastAnalysisTime >= analysisInterval)) {
            lastAnalysisTime = now;
            analysisInProgress = true;

            try {
              const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
              const results = await analyzeImage(imageData, video);
              setAnalysis(results);

              // Automatically capture if all directives pass
              // Show tick first, then trigger capture after animation completes
              if (results.status === "capture" && !capturingRef.current && !showTickRef.current) {
                showTickRef.current = true;
                captureImages();
              }
            } catch (err) {
              console.warn('Analysis error:', err);
            } finally {
              analysisInProgress = false;
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
  }, [isVideoReady, captureImages, modelsLoaded]);

  const copyToClipboard = () => {
    if (analysis) {
      navigator.clipboard.writeText(JSON.stringify(analysis, (key, value) => key === 'faceLandmarks' ? undefined : value, 2))
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
        {showMesh && (
          <FaceMeshOverlay
            landmarks={analysis?.faceLandmarks}
            width={videoRef.current?.videoWidth || 0}
            height={videoRef.current?.videoHeight || 0}
          />
        )}
        <FaceOutline analysis={analysis} capturing={capturing} showTick={showTick} />
        <div className="overlay">
          <CaptureGuidance analysis={analysis} capturing={capturing} />
        </div>
      </div>
      <button 
        className="primary-button" 
        onClick={captureImages}
        disabled={capturing || !modelsLoaded}
      >
        {!modelsLoaded ? 'Loading models…' : (capturing ? 'Capturing...' : 'Take Photo')}
      </button>
      <button
        className="primary-button"
        onClick={() => setShowMesh(m => !m)}
      >
        {showMesh ? 'Hide Face Mesh' : 'Show Face Mesh'}
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
          <div>Eyes Open: {Math.round(analysis.metrics.eyesOpen)}%</div>
          <div>Centering: {Math.round(analysis.metrics.centering)}%</div>
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
          value={JSON.stringify(analysis, (key, value) => key === 'faceLandmarks' ? undefined : value, 2)}
          rows={25}
          cols={80}
        />
      )}
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
    </div>
  );
}

export default CameraCapture;