import React from 'react';

function CaptureGuidance({ analysis }) {
  if (!analysis || analysis.status !== "analyzing") {
    return null;
  }

  return (
    <div className="capture-guidance">
      <div className="directives">
        {analysis.directives.map(directive => (
          <div 
            key={directive.id} 
            className={`directive ${directive.category}`}
            style={{ order: directive.priority }}
          >
            {directive.message}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CaptureGuidance; 