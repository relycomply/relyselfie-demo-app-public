import React from 'react';
import './Toast.css'; // Create a CSS file for styling

function Toast({ message, onClose }) {
  return (
    <div className="toast">
      {message}
      <button className="toast-close" onClick={onClose}>✖</button>
    </div>
  );
}

export default Toast; 