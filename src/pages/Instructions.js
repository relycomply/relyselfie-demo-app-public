import { useNavigate } from 'react-router-dom';
import './Pages.css';
import {
  WbSunny,
  CameraFront,
  Face,
  CheckCircle,
  Visibility
} from '@mui/icons-material';

function Instructions() {
  const navigate = useNavigate();

  const instructions = [
    {
      icon: <WbSunny />,
      text: "Find a well-lit room"
    },
    {
      icon: <CameraFront />,
      text: "Use front-facing camera"
    },
    {
      icon: <Visibility />,
      text: "Remove spectacles and sunglasses"
    },
    {
      icon: <Face />,
      text: "Remove caps, scarves, or head coverings"
    }
  ];

  return (
    <div className="page-container">
      <h1>Before we begin</h1>
      <div className="instructions-container">
        {instructions.map((instruction, index) => (
          <div key={index} className="instruction-item">
            <div className="instruction-icon">
              {instruction.icon}
            </div>
            <p>{instruction.text}</p>
          </div>
        ))}
      </div>
      <button 
        className="primary-button"
        onClick={() => navigate('/camera')}
      >
        <span className="button-content">
          I'm Ready <CheckCircle sx={{ marginLeft: 1 }} />
        </span>
      </button>
    </div>
  );
}

export default Instructions; 