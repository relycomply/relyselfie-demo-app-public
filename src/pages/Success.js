import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadImages } from 'relyselfie';
import './Pages.css';

function Success() {
  const [capturedImages, setCapturedImages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const images = JSON.parse(localStorage.getItem('capturedImages') || '[]');
    if (!images.length) {
      navigate('/camera');
    }
    setCapturedImages(images);
  }, [navigate]);

  const handleUpload = async () => {
    const customerId = localStorage.getItem('customerId');

    try {
      await uploadImages(capturedImages, customerId);
      alert('Images uploaded successfully!');
    } catch (error) {
      alert('An error occurred while uploading images.');
    }
  };

  return (
    <div className="page-container">
      <h1>Great job!</h1>
      <p>Your photos have been captured successfully</p>
      <div className="captured-images-grid">
        {capturedImages.map((imageData, index) => (
          <div key={index} className="captured-image-container">
            <p>Score: {imageData.score.toFixed(6)}</p>
            <img src={imageData.image} alt={`Captured ${index + 1}`} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button className="primary-button" onClick={handleUpload}>
          Upload Images
        </button>
        <button className="primary-button" onClick={() => navigate('/')}>
          Start Over
        </button>
      </div>
    </div>
  );
}

export default Success;