import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useColor } from '../context/ColorContext';
import { useTheme } from '../context/ThemeContext';
import './Pages.css';

function Welcome() {
  const [customerId, setCustomerId] = useState('');
  const navigate = useNavigate();
  const { primaryColor, setPrimaryColor } = useColor();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleStart = () => {
    if (customerId.length > 0) {
      localStorage.setItem('customerId', customerId);
    }
    navigate('/instructions');
  };

  return (
    <div className="page-container">
      <h1>Welcome to RelySelfie</h1>
      <p>Please enter your customer ID (optional):</p>
      <input
        type="text"
        value={customerId}
        onChange={(e) => setCustomerId(e.target.value)}
        placeholder="Enter customer ID"
      />
      <button className="primary-button" onClick={handleStart}>
        Start
      </button>
      <div className="settings-container">
        <div className="color-picker-container">
          <label htmlFor="colorPicker" className="color-picker-label">
            Theme Color
          </label>
          <input
            type="color"
            id="colorPicker"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="color-picker"
          />
        </div>
        <button className="theme-toggle" onClick={toggleTheme}>
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  );
}

export default Welcome; 