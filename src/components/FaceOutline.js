import { useState, useEffect } from 'react';

const CX = 320, CY = 240, R = 150;
const NUM_TICKS = 300;
const TICK_INNER = 2;  // px inward from circle boundary
const TICK_OUTER = 8;  // px outward from circle boundary
const CAPTURE_FILL_MS = 2400; // how long the fill animation takes during capture

// Checkmark path length
const TICK_PATH_LENGTH = 104;

/**
 * Returns the two endpoints of a radial tick mark at index i around the circle.
 * Starts at 12 o'clock, progresses clockwise.
 */
function getTickEndpoints(i) {
  const theta = -Math.PI / 2 + (i / NUM_TICKS) * 2 * Math.PI;
  // Unit normal is simply the radial direction for a circle
  const ux = Math.cos(theta);
  const uy = Math.sin(theta);
  const px = CX + R * ux;
  const py = CY + R * uy;
  return {
    x1: px - ux * TICK_INNER,
    y1: py - uy * TICK_INNER,
    x2: px + ux * TICK_OUTER,
    y2: py + uy * TICK_OUTER,
  };
}

// Pre-compute all tick positions once at module level
const TICKS = Array.from({ length: NUM_TICKS }, (_, i) => getTickEndpoints(i));


function FaceOutline({ analysis, capturing, showTick }) {
  const score = analysis?.score || 0;
  const staticFilled = Math.round(Math.max(0, Math.min(1, score / 100)) * NUM_TICKS);

  // Animated fill count used during capturing
  const [animFilled, setAnimFilled] = useState(null);

  useEffect(() => {
    if (capturing) {
      const startFilled = staticFilled;
      const remaining = NUM_TICKS - startFilled;
      if (remaining <= 0) {
        setAnimFilled(NUM_TICKS);
        return;
      }
      const stepMs = CAPTURE_FILL_MS / remaining;
      let current = startFilled;
      const timer = setInterval(() => {
        current = Math.min(current + 1, NUM_TICKS);
        setAnimFilled(current);
        if (current >= NUM_TICKS) clearInterval(timer);
      }, stepMs);
      return () => clearInterval(timer);
    } else {
      setAnimFilled(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capturing]);

  const filledCount = showTick
    ? NUM_TICKS
    : animFilled !== null
    ? animFilled
    : staticFilled;

  return (
    <svg
      className="face-outline-svg"
      viewBox="0 0 640 480"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <defs>
        <mask id="face-oval-mask">
          <rect width="640" height="480" fill="white" />
          <circle cx={CX} cy={CY} r={R} fill="black" />
        </mask>
      </defs>

      {/* Dark overlay with circle cutout */}
      <rect width="640" height="480" fill="rgba(0,0,0,0.55)" mask="url(#face-oval-mask)" />

      {/* Semi-transparent white fill over circle once capture is complete — fades in */}
      {showTick && (
        <circle cx={CX} cy={CY} r={R} fill="rgba(255,255,255,0.50)" className="face-oval-overlay" />
      )}

      {/* Apple-style radial tick marks around the circle */}
      {TICKS.map((t, i) => {
        const lit = i < filledCount;
        const litColor = (capturing || showTick) ? '#34C759' : '#ffffff';
        return (
          <line
            key={i}
            x1={t.x1} y1={t.y1}
            x2={t.x2} y2={t.y2}
            stroke={lit ? litColor : 'rgba(255,255,255,0.18)'}
            strokeWidth={lit ? 1.5 : 1}
            strokeLinecap="round"
            style={{ transition: 'stroke 0.4s ease' }}
          />
        );
      })}

      {/* Checkmark drawn on after capture completes */}
      {showTick && (
        <path
          d="M 288 245 L 312 270 L 358 218"
          fill="none"
          stroke="#34C759"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={TICK_PATH_LENGTH}
          className="face-tick"
        />
      )}
    </svg>
  );
}

export default FaceOutline;


