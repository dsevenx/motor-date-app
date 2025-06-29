"use client"

import { MotorDateProps } from "@/constants";
import { Calendar } from 'lucide-react';
import React, { useState } from "react";

export const MotorDate: React.FC<MotorDateProps> = ({ value, onChange, label, disabled = false }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Convert ISO date (YYYY-MM-DD) to German format (DD.MM.YYYY)
  const formatToGerman = (isoDate: string): string => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}.${month}.${year}`;
  };

  // Convert German format to ISO date
  const parseGermanDate = (germanDate: string): string => {
    const numbers = germanDate.replace(/\D/g, '');
    if (numbers.length !== 8) return '';
    
    const day = numbers.substring(0, 2);
    const month = numbers.substring(2, 4);
    const year = numbers.substring(4, 8);
    
    // Basic validation
    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || yearNum < 1900) {
      return '';
    }
    
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Initialize input value
  React.useEffect(() => {
    if (value) {
      setInputValue(formatToGerman(value));
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const cursorPos = input.selectionStart || 0;
    const currentValue = inputValue;

    // Allow backspace, delete, arrow keys, tab
    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
      return;
    }

    // Only allow digits
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      return;
    }

    e.preventDefault();

    // Remove dots to work with pure numbers
    const numbers = currentValue.replace(/\./g, '');
    let newNumbers = numbers;

    // Determine position in the 8-digit sequence
    let numberPos = 0;
    if (cursorPos <= 2) numberPos = cursorPos;
    else if (cursorPos <= 5) numberPos = cursorPos - 1;
    else numberPos = cursorPos - 2;

    // Insert or replace digit
    if (numberPos >= numbers.length) {
      newNumbers = numbers + e.key;
    } else {
      newNumbers = numbers.substring(0, numberPos) + e.key + numbers.substring(numberPos + 1);
    }

    // Limit to 8 digits
    newNumbers = newNumbers.substring(0, 8);

    // Format with dots
    let formatted = '';
    if (newNumbers.length >= 1) {
      formatted = newNumbers.substring(0, Math.min(2, newNumbers.length));
    }
    if (newNumbers.length >= 3) {
      formatted += '.' + newNumbers.substring(2, Math.min(4, newNumbers.length));
    }
    if (newNumbers.length >= 5) {
      formatted += '.' + newNumbers.substring(4);
    }

    setInputValue(formatted);

    // Update parent if complete date
    if (newNumbers.length === 8) {
      const isoDate = parseGermanDate(formatted);
      if (isoDate) {
        onChange(isoDate);
      }
    }

    // Set cursor position after state update
    setTimeout(() => {
      if (inputRef.current) {
        let newCursorPos = numberPos + 1;
        if (newCursorPos > 2 && newCursorPos <= 4) newCursorPos += 1;
        else if (newCursorPos > 4) newCursorPos += 2;
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const numbers = pastedText.replace(/\D/g, '').substring(0, 8);
    
    if (numbers.length === 8) {
      let formatted = numbers.substring(0, 2);
      formatted += '.' + numbers.substring(2, 4);
      formatted += '.' + numbers.substring(4, 8);
      
      setInputValue(formatted);
      const isoDate = parseGermanDate(formatted);
      if (isoDate) {
        onChange(isoDate);
      }
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        {label}
      </label>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder="DD.MM.YYYY"
        disabled={disabled}
        className={`
          px-3 py-2 border border-gray-300 rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${disabled 
            ? 'bg-gray-100 cursor-not-allowed text-gray-500' 
            : 'bg-white hover:border-gray-400'
          }
          transition-colors duration-200
        `}
      />
    </div>
  );
};
