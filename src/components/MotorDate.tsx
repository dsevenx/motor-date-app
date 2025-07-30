"use client"

import { MotorDateProps } from "@/constants";
import { updateEchteEingabe } from "@/constants/fieldConfig";
import { Calendar } from 'lucide-react';
import React, { useState, useRef, useEffect } from "react";

export const MotorDate: React.FC<MotorDateProps> = ({ value, onChange, label, fieldKey, disabled = false, hideLabel = false }) => {
  // State für Calendar Picker
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // State für manuelle Eingabe (bestehende Logik)
  const [inputValue, setInputValue] = useState('');
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Deutsche Monatsnamen
  const monthsLong: string[] = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  const weekDays: string[] = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  // Wrapper für onChange mit echteEingabe tracking
  const handleValueChange = (newValue: string, isUserInput: boolean = true) => {
    onChange(newValue);
    if (fieldKey && isUserInput) {
      updateEchteEingabe(fieldKey, newValue);
    }
  };

  // Convert ISO date (YYYY-MM-DD) to German format (DD.MM.YYYY) - bestehende Funktion
  const formatToGerman = (isoDate: string): string => {
    if (!isoDate || isoDate === '0001-01-01') return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}.${month}.${year}`;
  };

  // Convert German format to ISO date - bestehende Funktion
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

  // Neue Funktionen für Calendar Picker
  const formatToISO = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseISODate = (dateString: string): Date | null => {
    if (!dateString || dateString === '0001-01-01') return null;
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return null;
  };

  const generateCalendarDays = (): Date[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: Date[] = [];
    const currentDateObj = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDateObj));
      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }
    
    return days;
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isSelected = (date: Date): boolean => {
    if (!value || value === '0001-01-01') return false;
    const selectedDate = parseISODate(value);
    return selectedDate !== null && 
           selectedDate.getDate() === date.getDate() &&
           selectedDate.getMonth() === date.getMonth() &&
           selectedDate.getFullYear() === date.getFullYear();
  };

  const handleDateSelect = (date: Date): void => {
    const isoDate = formatToISO(date);
    handleValueChange(isoDate, true); // User-Interaktion über Kalender
    setIsOpen(false);
  };

  const handleMonthChange = (direction: number): void => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  // Initialize input value
  React.useEffect(() => {
    if (value && value !== '0001-01-01') {
      const formatted = formatToGerman(value);
      setInputValue(formatted);
      
      // Set currentDate for calendar
      const parsedDate = parseISODate(value);
      if (parsedDate) {
        setCurrentDate(parsedDate);
      }
    } else {
      setInputValue('');
    }
  }, [value]);

  // Handle input changes (required for controlled component) - bestehende Funktion
  const handleInputChange = () => {
    // Do nothing if disabled - React still needs this handler for controlled inputs
    if (disabled) return;
    
    // For manual typing, we handle this in onKeyDown instead
    // This handler is mainly to satisfy React's controlled component requirements
  };

  // Bestehende manuelle Eingabe-Logik
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Skip event handling if disabled
    if (disabled) return;

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
        handleValueChange(isoDate, true); // User-Eingabe über Tastatur
      }
    }

    // Set cursor position after state update (SSR-safe)
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        if (inputRef.current) {
          let newCursorPos = numberPos + 1;
          if (newCursorPos > 2 && newCursorPos <= 4) newCursorPos += 1;
          else if (newCursorPos > 4) newCursorPos += 2;
          inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    // Skip paste handling if disabled
    if (disabled) {
      e.preventDefault();
      return;
    }

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
        handleValueChange(isoDate, true); // User-Eingabe über Tastatur
      }
    }
  };

  // Schließt Dropdown bei Klick außerhalb
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // SSR-safe: Only add event listeners in browser environment
    if (typeof window !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, []);

  const calendarDays: Date[] = generateCalendarDays();

  return (
    <div className="flex flex-col space-y-2">
      {!hideLabel && (
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {label}
        </label>
      )}
      
      <div className="relative w-full" ref={dropdownRef}>
        {/* Input Field */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="DD.MM.YYYY"
            disabled={disabled}
            readOnly={disabled}
            className={`
              w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              pr-10
              ${disabled 
                ? 'bg-gray-100 cursor-not-allowed text-gray-500' 
                : 'bg-white hover:border-gray-400'
              }
              transition-colors duration-200
            `}
          />
          
          {/* Calendar Icon */}
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded disabled:cursor-not-allowed"
          >
            <Calendar className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Calendar Dropdown */}
        {isOpen && !disabled && (
          <div className="absolute z-50 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <button
                onClick={() => handleMonthChange(-1)}
                className="p-1 hover:bg-gray-100 rounded"
                type="button"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="text-center">
                <div className="font-medium text-lg">
                  {monthsLong[currentDate.getMonth()]} {currentDate.getFullYear()}
                </div>
                <div className="text-sm text-blue-600 font-medium">
                  Monat und Jahr wählen
                </div>
              </div>
              
              <button
                onClick={() => handleMonthChange(1)}
                className="p-1 hover:bg-gray-100 rounded"
                type="button"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded ml-2"
                type="button"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-gray-200">
              {weekDays.map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {calendarDays.map((date, index) => (
                <button
                  key={index}
                  onClick={() => handleDateSelect(date)}
                  type="button"
                  className={`
                    p-2 text-sm hover:bg-gray-100 transition-colors
                    ${!isCurrentMonth(date) ? 'text-gray-300' : 'text-gray-900'}
                    ${isSelected(date) ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                    ${isSelected(date) ? 'rounded-full' : ''}
                  `}
                >
                  {date.getDate()}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};