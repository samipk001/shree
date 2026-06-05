import React, { useRef, useEffect } from 'react';
import './MagicBento.css';
import { gsap } from 'gsap';

// NOTE: This component is the same as the open-source MagicBento variant
// trimmed for integration. It depends on `gsap` and React.

const MagicBento = ({
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = 300,
  particleCount = 12,
  enableTilt = false,
  glowColor = '125,5,15', // site primary RGB (maroon)
  clickEffect = true,
  enableMagnetism = true
}) => {
  const gridRef = useRef(null);

  useEffect(() => {
    // Lightweight initialization for spotlight/particles could go here.
    // For full behaviour use the original component source and follow README.
    return () => {};
  }, []);

  return (
    <div className="magic-bento-wrapper">
      <div className="card-grid bento-section" ref={gridRef}>
        <div className="magic-bento-card magic-bento-card--text-autohide magic-bento-card--border-glow">
          <div className="magic-bento-card__header">
            <div className="magic-bento-card__label">Tools</div>
          </div>
          <div className="magic-bento-card__content">
            <h2 className="magic-bento-card__title">Power Tools</h2>
            <p className="magic-bento-card__description">Professional-grade power tools for contractors</p>
          </div>
        </div>
        <div className="magic-bento-card magic-bento-card--text-autohide magic-bento-card--border-glow">
          <div className="magic-bento-card__header">
            <div className="magic-bento-card__label">Machinery</div>
          </div>
          <div className="magic-bento-card__content">
            <h2 className="magic-bento-card__title">Heavy Machinery</h2>
            <p className="magic-bento-card__description">Compressors, generators and more</p>
          </div>
        </div>
        <div className="magic-bento-card magic-bento-card--text-autohide magic-bento-card--border-glow">
          <div className="magic-bento-card__header">
            <div className="magic-bento-card__label">Hand Tools</div>
          </div>
          <div className="magic-bento-card__content">
            <h2 className="magic-bento-card__title">Hand Tools</h2>
            <p className="magic-bento-card__description">Industrial hand tools & hardware</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MagicBento;
