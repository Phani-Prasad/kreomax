import React from 'react';

/**
 * KreomaxIcon — Iconic geometric vector logo emblem
 * Dynamic faceted "K" with creative energy spark
 */
export const KreomaxIcon = ({ size = 32, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`kreomax-logo-icon ${className}`}
      aria-label="Kreomax Logo"
    >
      <defs>
        {/* Shield Gradient */}
        <linearGradient id="km-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4338CA" />
          <stop offset="45%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>

        {/* Stem Gradient */}
        <linearGradient id="km-stem-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E0E7FF" />
        </linearGradient>

        {/* Upper Arm Gradient */}
        <linearGradient id="km-upper-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>

        {/* Lower Arm Gradient */}
        <linearGradient id="km-lower-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#C4B5FD" />
        </linearGradient>

        {/* Glow Filter */}
        <filter id="km-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#4F46E5" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Modern Squircle Badge Container */}
      <rect 
        x="1" 
        y="1" 
        width="34" 
        height="34" 
        rx="9" 
        fill="url(#km-bg-grad)" 
        filter="url(#km-glow)"
      />
      <rect 
        x="1.5" 
        y="1.5" 
        width="33" 
        height="33" 
        rx="8.5" 
        stroke="rgba(255, 255, 255, 0.28)" 
        strokeWidth="1" 
      />

      {/* Stylized Geometric "K" Iconography */}
      {/* 1. Vertical Spine */}
      <rect 
        x="9" 
        y="8.5" 
        width="4.5" 
        height="19" 
        rx="2" 
        fill="url(#km-stem-grad)" 
      />

      {/* 2. Upper Creative Wing / Arrow Diagonal */}
      <path
        d="M16 17.5L23.8 9.5C24.4 8.9 25.4 9.1 25.7 9.9L26.3 11.2C26.7 12 26.4 12.9 25.7 13.6L19.8 19.5L16 17.5Z"
        fill="url(#km-upper-grad)"
      />

      {/* 3. Lower Dynamic Arm */}
      <path
        d="M17.5 17L24.8 25.8C25.4 26.5 24.9 27.5 24 27.5H22.3C21.6 27.5 21 27.1 20.6 26.5L15 19.5L17.5 17Z"
        fill="url(#km-lower-grad)"
      />

      {/* 4. Center Creative Core Star / Spark */}
      <polygon 
        points="16.5,18 19,15.5 21.5,18 19,20.5" 
        fill="#FFFFFF" 
      />
      <circle 
        cx="19" 
        cy="18" 
        r="1.2" 
        fill="#38BDF8" 
      />
    </svg>
  );
};

/**
 * KreomaxBrand — Complete brand header with logo emblem and typography
 */
export const KreomaxBrand = ({ 
  iconSize = 34, 
  subtitle = "CREATOR STUDIO",
  className = "",
  onClick 
}) => {
  return (
    <div 
      className={`ca-sidebar-brand kreomax-brand-wrap ${className}`} 
      onClick={onClick}
      role="button"
      tabIndex={0}
      title="Kreomax — Creator Studio"
    >
      <div className="ca-brand-icon kreomax-icon-frame">
        <KreomaxIcon size={iconSize} />
      </div>
      <div className="ca-brand-info">
        <span className="ca-brand-title kreomax-title">
          KREO<span className="ca-brand-max-gradient">MAX</span>
        </span>
        <span className="ca-brand-tag kreomax-tag">{subtitle}</span>
      </div>
    </div>
  );
};

export default KreomaxBrand;
