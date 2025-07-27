"use client"

import React from 'react';

export interface MotorButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  className?: string;
}

export const MotorButton: React.FC<MotorButtonProps> = ({
  onClick,
  children,
  disabled = false,
  variant = 'secondary',
  size = 'medium',
  icon,
  className = ''
}) => {
  // Base styles - entsprechend den Screenshots mit abgerundeten Ecken
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 border-0';
  
  // Size styles - angepasst an die Screenshot-Proportionen
  const sizeStyles = {
    small: 'px-4 py-1.5 text-xs gap-1',
    medium: 'px-6 py-2.5 text-sm gap-2',
    large: 'px-8 py-3 text-base gap-2'
  };
  
  // Variant styles basierend auf den Screenshots
  const variantStyles = {
    primary: disabled 
      ? 'bg-blue-300 text-white cursor-not-allowed' // Hellblau für disabled wie im Screenshot
      : 'text-white focus:ring-blue-500 active:bg-blue-800', // Verwende MotorCheckBox Farbe
    secondary: disabled
      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500 active:bg-gray-400',
    ghost: disabled
      ? 'bg-transparent text-gray-400 cursor-not-allowed'
      : 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-500 active:bg-gray-200'
  };

  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };

  // Spezifische Hintergrundfarbe für Primary Button (gleich wie MotorCheckBox)
  const getBackgroundStyle = () => {
    if (variant === 'primary' && !disabled) {
      return {
        backgroundColor: '#007AB3', // Gleiche Farbe wie MotorCheckBox
      };
    }
    return {};
  };

  // Hover-Farbe für Primary Button (etwas dunkler)
  const getHoverStyle = () => {
    if (variant === 'primary' && !disabled) {
      return {
        '--hover-bg': '#006799', // Etwas dunkler als #007AB3
      } as React.CSSProperties;
    }
    return {};
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${variant === 'primary' && !disabled ? 'hover:brightness-90' : ''}
        ${className}
      `.replace(/\s+/g, ' ').trim()}
      style={{
        ...getBackgroundStyle(),
        ...getHoverStyle(),
      }}
    >
      {icon && (
        <span className="flex-shrink-0">
          {icon}
        </span>
      )}
      <span>{children}</span>
    </button>
  );
};