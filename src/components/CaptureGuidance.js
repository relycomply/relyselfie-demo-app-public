import React from 'react';

function CaptureGuidance({ analysis, capturing }) {
  if (!analysis || analysis.status !== "analyzing") {
    if (capturing) {
      return (
        <div className="capture-guidance">
          <div className="directives">
            <div className="directive capturing">Hold still</div>
          </div>
        </div>
      );
    }
    return null;
  }

  if (capturing) {
    return (
      <div className="capture-guidance">
        <div className="directives">
          <div className="directive capturing">Hold still</div>
        </div>
      </div>
    );
  }

  const activeDirectives = analysis.directives.filter(d => d.active);
  const topDirective = activeDirectives.length > 0
    ? activeDirectives.reduce((best, d) => d.priority < best.priority ? d : best)
    : null;

  return (
    <div className="capture-guidance">
      <div className="directives">
        {topDirective && (
          <div
            key={topDirective.id}
            className={`directive ${topDirective.category}`}
          >
            {topDirective.message}
          </div>
        )}
      </div>
    </div>
  );
}

export default CaptureGuidance; 