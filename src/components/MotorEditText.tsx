"use client"

import { Type } from 'lucide-react';
import React, { useState } from "react";

export interface MotorEditTextProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  hideLabel?: boolean;
}

export const MotorEditText: React.FC<MotorEditTextProps> = ({ 
  value, 
  onChange, 
  label, 
  placeholder,
  disabled = false,
  maxLength,
  hideLabel = false
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    let newValue = e.target.value;
    
    // Respektiere maxLength falls gesetzt
    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.substring(0, maxLength);
    }
    
    onChange(newValue);
  };

  const handleFocus = () => {
    if (!disabled) setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className="flex flex-col space-y-2">
      {!hideLabel && (
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Type className="w-4 h-4" />
          {label}
          {maxLength && (
            <span className="text-xs text-gray-500 ml-auto">
              {value.length}/{maxLength}
            </span>
          )}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${disabled 
              ? 'bg-gray-100 cursor-not-allowed text-gray-500 border-gray-200' 
              : 'bg-white hover:border-gray-400'
            }
            ${isFocused ? 'border-blue-500' : 'border-gray-300'}
            transition-colors duration-200
          `}
        />
        {/* Anzeige der aktuellen Länge bei Fokus */}
        {isFocused && maxLength && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <span className={`text-xs ${
              value.length > maxLength * 0.8 ? 'text-orange-500' : 'text-gray-400'
            }`}>
              {value.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};