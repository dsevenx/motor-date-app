"use client"

import { fetchDomainData } from "@/app/api/FetchDomainData";
import { DropdownOption } from "@/constants/index";
import React, { useState } from "react";

export interface MotorDropDownProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
  domainId: string;
  placeholder?: string;
  hideLabel?: boolean;
}

export const MotorDropDown: React.FC<MotorDropDownProps> = ({
  value = '',
  onChange,
  label = '',
  disabled = false,
  domainId,
  placeholder = '',
  hideLabel = false
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedLabel, setSelectedLabel] = useState<string>('');
  
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const loadOptions = async () => {
      if (!domainId) return;
      
      setLoading(true);
      try {
        const data = await fetchDomainData(domainId);
        setOptions(data);
        
        if (value) {
          const selectedOption = data.find(option => option.value === value);
          setSelectedLabel(selectedOption?.label || '');
        }
      } catch (error) {
        console.error('Error loading domain data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, [domainId, value]);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOptionSelect = (option: DropdownOption): void => {
    onChange(option.value);
    setSelectedLabel(option.label);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleInputFocus = (): void => {
    if (!disabled) {
      setIsOpen(true);
      setSearchTerm('');
    }
  };

  const handleDropdownToggle = (): void => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        inputRef.current?.focus();
      }
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDisplayValue = (): string => {
    if (isOpen && searchTerm !== '') {
      return searchTerm;
    }
    return selectedLabel || placeholder;
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Label - nur anzeigen wenn vorhanden und nicht versteckt */}
      {label && !hideLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={getDisplayValue()}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border border-gray-300 rounded-md 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
            pr-10 disabled:bg-gray-100 disabled:cursor-not-allowed
            ${!selectedLabel && !isOpen ? 'text-gray-400' : 'text-gray-900'}
          `}
          placeholder={isOpen ? placeholder : ''}
        />
        
        <button
          type="button"
          onClick={handleDropdownToggle}
          disabled={disabled}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded disabled:cursor-not-allowed"
        >
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-3 text-center text-gray-500">
              Laden...
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="p-3 text-center text-gray-500">
              Keine Optionen gefunden
            </div>
          ) : (
            <>
              {searchTerm && (
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                  {filteredOptions.length} von {options.length} Optionen
                </div>
              )}
              
              <div className="py-1">
                {filteredOptions.map((option, index) => (
                  <button
                    key={`${option.value}-${index}`}
                    onClick={() => handleOptionSelect(option)}
                    className={`
                      w-full text-left px-3 py-2 text-sm hover:bg-gray-100 
                      focus:bg-gray-100 focus:outline-none transition-colors
                      ${option.value === value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-900'}
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};