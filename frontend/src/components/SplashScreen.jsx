import React, { useState, useEffect } from 'react';

const SplashScreen = ({ onFinish }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Keep splash visible for 1.6 seconds, then start smooth fade-out (0.5s duration)
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 1600);

    // After fade-out completes, unmount splash layer (total 2.1s)
    const finishTimer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      }
    }, 2100);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`splash-screen-overlay ${fading ? 'splash-fade-out' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading Digital ID Card Generator"
    >
      {/* Subtle ambient violet/blue glow layers */}
      <div className="splash-ambient-glow splash-glow-primary" aria-hidden="true" />
      <div className="splash-ambient-glow splash-glow-secondary" aria-hidden="true" />

      {/* Main Branding Card */}
      <div className="splash-content-card">
        {/* Existing Vignan's University Logo */}
        <div className="splash-logo-wrapper">
          <img
            src="/vignans-logo.png"
            alt="Vignan's Logo"
            className="splash-logo"
          />
        </div>

        {/* Application Name */}
        <h1 className="splash-title">Digital ID Card Generator</h1>

        {/* Subtitle */}
        <p className="splash-subtitle">Student Identity Card Management</p>

        {/* Loading Indicator */}
        <div className="splash-loader-container">
          <div className="splash-dots" aria-hidden="true">
            <span className="splash-dot" />
            <span className="splash-dot" />
            <span className="splash-dot" />
          </div>
          <span className="splash-loading-text">Loading...</span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
