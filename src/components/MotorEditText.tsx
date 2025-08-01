"use client"

import { Type } from 'lucide-react';
import { updateEchteEingabe } from "@/constants/fieldConfig";
import { useEditMode } from "@/contexts/EditModeContext";
import React, { useState } from "react";

export interface MotorEditTextProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  fieldKey?: string; // Für echteEingabe tracking
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  hideLabel?: boolean;
  generellNichtEditierbar?: boolean;
}

export const MotorEditText: React.FC<MotorEditTextProps> = ({ 
  value, 
  onChange, 
  label, 
  fieldKey,
  placeholder,
  disabled = false,
  maxLength,
  hideLabel = false,
  generellNichtEditierbar = false
}) => {
  const { isEditMode } = useEditMode();
  const [isFocused, setIsFocused] = useState(false);
  
  // Effektiv disabled wenn EditMode aus ist oder prop disabled ist
  const isEffectivelyDisabled = !isEditMode || disabled || generellNichtEditierbar;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isEffectivelyDisabled) return;
    
    let newValue = e.target.value;
    
    // Respektiere maxLength falls gesetzt
    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.substring(0, maxLength);
    }
    
    onChange(newValue);
    if (fieldKey) {
      updateEchteEingabe(fieldKey, newValue);
    }
  };

  const handleFocus = () => {
    if (!isEffectivelyDisabled) setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className="relative w-full">
      {/* Label - nur anzeigen wenn vorhanden und nicht versteckt */}
      {label && !hideLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
          <Type className="w-4 h-4" />
          {label}
          {maxLength && (
            <span className="text-xs text-gray-500 ml-auto">
              {value.length}/{maxLength}
            </span>
          )}
        </label>
      )}
      
      {/* Input Field */}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={isEffectivelyDisabled}
          readOnly={isEffectivelyDisabled}
          maxLength={maxLength}
          className={`
            w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${isEffectivelyDisabled 
              ? 'bg-gray-100 cursor-not-allowed text-gray-500' 
              : 'bg-white hover:border-gray-400'
            }
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
      
      {/* Character count (wenn maxLength gesetzt ist) */}
      {maxLength && !hideLabel && (
        <div className="text-xs text-gray-400 mt-1 text-right">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
};