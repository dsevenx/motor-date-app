"use client"

import { Calculator, Euro, Hash, Percent } from 'lucide-react';
import React, { useState, useEffect } from "react";

import { NumberFormat, setFieldValueWithEchteEingabe } from '@/constants/fieldConfig';
import { useEditMode } from "@/contexts/EditModeContext";

export interface MotorEditNumberProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  fieldKey?: string; // Für echteEingabe tracking
  placeholder?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  format?: NumberFormat;
  hideLabel?: boolean;
  generellNichtEditierbar?: boolean;
}

export const MotorEditNumber: React.FC<MotorEditNumberProps> = ({ 
  value, 
  onChange, 
  label, 
  fieldKey,
  placeholder,
  disabled = false,
  min,
  max,
  format = 'decimal',
  hideLabel = false,
  generellNichtEditierbar = false
}) => {
  const { isEditMode } = useEditMode();
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Effektiv disabled wenn EditMode aus ist oder prop disabled ist
  const isEffectivelyDisabled = !isEditMode || disabled || generellNichtEditierbar;

  // Wrapper für onChange mit echteEingabe tracking
  const handleValueChange = (newValue: number, isUserInput: boolean = true) => {
    if (fieldKey && isUserInput) {
      setFieldValueWithEchteEingabe(fieldKey, newValue, onChange);
    } else {
      onChange(newValue);
    }
  };

  // Standardwerte basierend auf Format
  const getDecimals = () => {
    switch (format) {
      case 'currency':
        return 2;
      case 'percentage':
        return 2;
      case 'integer':
      case 'count':
        return 0;
      case 'decimal':
      default:
        return 2;
    }
  };

  const decimals = getDecimals();
  const step = format === 'integer' || format === 'count' ? 1 : 0.01;

  // Icon basierend auf Format wählen
  const getIcon = () => {
    switch (format) {
      case 'currency':
        return Euro;
      case 'percentage':
        return Percent;
      case 'integer':
      case 'count':
        return Hash;
      case 'decimal':
      default:
        return Calculator;
    }
  };

  const Icon = getIcon();

  // Formatierung für Anzeige
  const formatDisplayValue = (num: number): string => {
    if (isNaN(num)) return '';
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('de-DE', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        }).format(num);
      
      case 'percentage':
        return new Intl.NumberFormat('de-DE', {
          style: 'percent',
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        }).format(num / 100);
      
      case 'integer':
      case 'count':
        return new Intl.NumberFormat('de-DE', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(num);
      
      case 'decimal':
      default:
        return new Intl.NumberFormat('de-DE', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        }).format(num);
    }
  };

  // Eingabe parsen
  const parseInputValue = (input: string): number => {
    // Entferne alle Nicht-Ziffern außer Komma, Punkt und Minus
    const cleanInput = input.replace(/[^\d,.-]/g, '');
    
    // Ersetze Komma durch Punkt für parseFloat
    const normalizedInput = cleanInput.replace(',', '.');
    
    const parsed = parseFloat(normalizedInput);
    
    if (isNaN(parsed)) return 0;
    
    // Respektiere min/max
    let result = parsed;
    if (min !== undefined && result < min) result = min;
    if (max !== undefined && result > max) result = max;
    
    // Runde basierend auf Format
    if (format === 'integer' || format === 'count') {
      result = Math.round(result);
    } else if (decimals !== undefined) {
      result = Math.round(result * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }
    
    return result;
  };

  // Synchronisiere inputValue mit value
  useEffect(() => {
    if (!isFocused) {
      setInputValue(formatDisplayValue(value));
    }
  }, [value, format, decimals, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isEffectivelyDisabled) return;
    
    const newInputValue = e.target.value;
    setInputValue(newInputValue);
    
    // Sofortige Validierung und Übertragung
    const parsedValue = parseInputValue(newInputValue);
    if (!isNaN(parsedValue)) {
      handleValueChange(parsedValue);
    }
  };

  const handleFocus = () => {
    if (!isEffectivelyDisabled) {
      setIsFocused(true);
      // Wenn Wert 0 ist, leere das Feld für bessere UX
      if (value === 0) {
        setInputValue('');
      } else {
        // Zeige Rohwert beim Fokus
        setInputValue(value.toString());
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Formatiere Wert beim Verlassen des Fokus
    // Wenn Feld leer ist, setze auf 0
    const finalValue = inputValue.trim() === '' ? 0 : parseInputValue(inputValue);
    handleValueChange(finalValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isEffectivelyDisabled) return;
    
    // Erlaube Pfeiltasten für Increment/Decrement
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newValue = value + step;
      if (max === undefined || newValue <= max) {
        handleValueChange(newValue);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newValue = value - step;
      if (min === undefined || newValue >= min) {
        handleValueChange(newValue);
      }
    }
  };

  const getPlaceholderText = () => {
    if (placeholder) return placeholder;
    
    switch (format) {
      case 'currency':
        return '0,00 €';
      case 'percentage':
        return '0,00 %';
      case 'integer':
      case 'count':
        return '0';
      case 'decimal':
      default:
        return '0,00';
    }
  };

  return (
    <div className="relative w-full">
      {/* Label - nur anzeigen wenn vorhanden und nicht versteckt */}
      {label && !hideLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
          <Icon className="w-4 h-4" />
          {label}
        </label>
      )}
      
      {/* Input Field */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholderText()}
          disabled={isEffectivelyDisabled}
          readOnly={generellNichtEditierbar}
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
        
        {/* Validierungs-Indikatoren */}
        {isFocused && (min !== undefined || max !== undefined) && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <span className="text-xs text-gray-400">
              {min !== undefined && max !== undefined 
                ? `${min}-${max}`
                : min !== undefined 
                  ? `≥${min}`
                  : `≤${max}`
              }
            </span>
          </div>
        )}
      </div>
      
      {/* Hilfstext */}
      {(min !== undefined || max !== undefined) && !hideLabel && (
        <div className="text-xs text-gray-400 mt-1 text-right">
          {min !== undefined && max !== undefined 
            ? `Bereich: ${min} bis ${max}`
            : min !== undefined 
              ? `Mindestens: ${min}`
              : `Maximal: ${max}`
          }
        </div>
      )}
    </div>
  );
};