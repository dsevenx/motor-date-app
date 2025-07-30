"use client"

import React, { useState, useRef } from 'react';
import { updateEchteEingabe } from "@/constants/fieldConfig";
import { useEditMode } from "@/contexts/EditModeContext";

export interface MotorCheckBoxProps {
  value: 'J' | 'N' | ' ';  // Ja, Nein, Nicht gesetzt (Startzustand)
  onChange: (value: 'J' | 'N') => void;  // Kann nur J oder N setzen
  label: string;
  fieldKey?: string; // Für echteEingabe tracking
  disabled?: boolean;
  infoText?: string;
  hideLabel?: boolean;
  allowInViewMode?: boolean; // Erlaubt Interaktion auch bei isEditMode=false (für Tree-CheckBoxes)
}

export const MotorCheckBox: React.FC<MotorCheckBoxProps> = ({ 
  value = ' ',
  onChange,
  label = '',
  fieldKey,
  disabled = false,
  infoText,
  hideLabel = false,
  allowInViewMode = false
}) => {
  const { isEditMode } = useEditMode();
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const checkboxRef = useRef<HTMLInputElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Effektiv disabled wenn EditMode aus ist (außer allowInViewMode) oder prop disabled ist
  const isEffectivelyDisabled = (!isEditMode && !allowInViewMode) || disabled;

  // Wrapper für onChange mit echteEingabe tracking
  const handleValueChange = (newValue: 'J' | 'N') => {
    onChange(newValue);
    if (fieldKey) {
      updateEchteEingabe(fieldKey, newValue);
    }
  };

  const isChecked = value === 'J';

  if (isChecked) {
    console.log('MotorCheckbox is checked' + label);
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (disabled) return;
    handleValueChange(e.target.checked ? 'J' : 'N');
  };

  const handleMouseEnter = (e: React.MouseEvent): void => {
    if (infoText) {
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePosition({
        x: rect.left + rect.width / 2,
        y: rect.bottom + 8
      });
      setShowTooltip(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent): void => {
    if (infoText && showTooltip) {
      setMousePosition({
        x: e.clientX,
        y: e.clientY + 10
      });
    }
  };

  const handleMouseLeave = (): void => {
    setShowTooltip(false);
  };

  return (
    <div className="relative w-full">
      
      <div className="flex items-center gap-2">
        {/* Checkbox */}
        <div className="relative flex items-center">
          {/* Versteckte native Checkbox für Funktionalität */}
          <input
            ref={checkboxRef}
            type="checkbox"
            checked={isChecked}
            onChange={handleCheckboxChange}
            disabled={disabled}
            className="sr-only"
          />
          
          {/* Custom Checkbox Darstellung */}
          <div
            className={`
              w-6 h-6 border-2 rounded cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
              disabled:cursor-not-allowed disabled:opacity-50
              transition-colors duration-200
              ${disabled ? 'bg-gray-100 border-gray-300' : ''}
            `}
            style={{
              backgroundColor: isChecked ? (disabled ? '#93C5FD' : '#007AB3') : 'white', // Helleres Blau für disabled
              borderColor: isChecked ? (disabled ? '#93C5FD' : '#007AB3') : '#9CA3AF'
            }}
            onClick={() => !isEffectivelyDisabled && handleValueChange(isChecked ? 'N' : 'J')}
          >
            {/* Checkmark Icon */}
            {isChecked && (
              <svg 
                className={`w-5 h-5 pointer-events-none ${
                  disabled ? 'text-white' : 'text-white'
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Label - nur anzeigen wenn vorhanden und nicht versteckt */}
        {label && !hideLabel && (
          <label 
            htmlFor={checkboxRef.current?.id}
            className={`
              text-sm cursor-pointer select-none
              ${disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'}
            `}
            onClick={() => !isEffectivelyDisabled && handleValueChange(isChecked ? 'N' : 'J')}
          >
            {label}
          </label>
        )}

        {/* Info Icon */}
        {infoText && (
          <div className="relative">
            <div
              className={`
                w-4 h-4 rounded-full flex items-center justify-center cursor-help
                ${disabled ? 'border border-gray-300 text-gray-500 bg-gray-50' : 'border border-blue-500 text-blue-600 bg-blue-50'}
                hover:bg-blue-100 transition-colors duration-200
              `}
              onMouseEnter={handleMouseEnter}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <span className="text-xs font-bold">i</span>
            </div>

            {/* Tooltip - folgt der Maus */}
            {showTooltip && (
              <div
                ref={tooltipRef}
                className="fixed z-50 w-max max-w-xs pointer-events-none"
                style={{
                  left: `${mousePosition.x}px`,
                  top: `${mousePosition.y}px`,
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="bg-white text-gray-800 text-sm rounded-md px-3 py-2 shadow-lg border border-gray-200">
                  {infoText}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};