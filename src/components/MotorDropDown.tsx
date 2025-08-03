"use client"

import { fetchDomainData } from "@/app/api/FetchDomainData";
import { DropdownOption } from "@/constants/index";
import { useEditMode } from "@/contexts/EditModeContext";
import { setFieldValueWithEchteEingabe } from "@/constants/fieldConfig";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export interface MotorDropDownProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  fieldKey?: string; // Für echteEingabe tracking
  disabled?: boolean;
  domainId: string;
  placeholder?: string;
  hideLabel?: boolean;
  allowInViewMode?: boolean; // Erlaubt Interaktion auch bei isEditMode=false
}

export const MotorDropDown: React.FC<MotorDropDownProps> = ({
  value = '',
  onChange,
  label = '',
  fieldKey,
  disabled = false,
  domainId,
  placeholder = '',
  hideLabel = false,
  allowInViewMode = false
}) => {
  const { isEditMode } = useEditMode();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedLabel, setSelectedLabel] = useState<string>('');
  const [portalPosition, setPortalPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Effektiv disabled wenn EditMode aus ist (außer allowInViewMode) oder prop disabled ist
  const isEffectivelyDisabled = (!isEditMode && !allowInViewMode) || disabled;

  // Wrapper für onChange mit echteEingabe tracking
  const handleValueChange = (newValue: string) => {
    if (fieldKey) {
      setFieldValueWithEchteEingabe(fieldKey, newValue, onChange);
    } else {
      onChange(newValue);
    }
  };
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Client-side mounting check
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Position calculation for portal
  const calculatePortalPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      
      // Check if input is visible in viewport
      const isVisible = rect.bottom > 0 && rect.top < window.innerHeight && 
                       rect.right > 0 && rect.left < window.innerWidth;
      
      if (!isVisible) {
        // Close dropdown if input field scrolled out of view
        setIsOpen(false);
        return;
      }
      
      // Check available space above and below
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 240; // Approximate dropdown height (max-h-60)
      const menuHeight = 120; // Top menu height
      
      // Determine position: above or below
      const shouldShowAbove = spaceBelow < dropdownHeight && spaceAbove > dropdownHeight;
      
      let dropdownTop;
      if (shouldShowAbove) {
        // Position dropdown so its bottom edge is just above the input field
        // Use smaller estimate: each option ~32px + padding
        const actualDropdownHeight = Math.min(240, Math.max(filteredOptions.length * 32 + 16, 60));
        dropdownTop = rect.top - actualDropdownHeight - 4;
      } else {
        dropdownTop = rect.bottom + 4;
      }
      
      // Check if dropdown would overlap with top menu area or go outside viewport
      if (dropdownTop < menuHeight || dropdownTop > window.innerHeight - 100) {
        // Dropdown would overlap with menu or be outside viewport, close it
        setIsOpen(false);
        return;
      }
      
      // Position dropdown
      setPortalPosition({
        top: dropdownTop,
        left: rect.left,
        width: Math.max(200, rect.width)
      });
    }
  };

  // Open dropdown handler
  const handleOpenDropdown = () => {
    if (!isEffectivelyDisabled) {
      calculatePortalPosition();
      setIsOpen(true);
    }
  };

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
    handleValueChange(option.value);
    setSelectedLabel(option.label);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    
    if (!isOpen) {
      handleOpenDropdown();
    }
  };

  const handleInputFocus = (): void => {
    if (!isEffectivelyDisabled) {
      handleOpenDropdown();
      setSearchTerm('');
    }
  };

  const handleDropdownToggle = (): void => {
    if (!isEffectivelyDisabled) {
      if (!isOpen) {
        handleOpenDropdown();
        inputRef.current?.focus();
      } else {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
  };

  // Handle outside clicks and scrolling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        // Use requestAnimationFrame for smoother positioning
        requestAnimationFrame(() => {
          calculatePortalPosition();
        });
      }
    };

    const handleResize = () => {
      if (isOpen) {
        calculatePortalPosition();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      
      // Add scroll listeners to window and all scrollable parent elements
      window.addEventListener('scroll', handleScroll, true);
      document.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      
      // Find and add listeners to all scrollable parent containers
      const scrollableParents: Element[] = [];
      let element = inputRef.current?.parentElement;
      while (element && element !== document.body) {
        const style = window.getComputedStyle(element);
        if (style.overflow === 'auto' || style.overflow === 'scroll' || 
            style.overflowY === 'auto' || style.overflowY === 'scroll' ||
            style.overflowX === 'auto' || style.overflowX === 'scroll') {
          scrollableParents.push(element);
          element.addEventListener('scroll', handleScroll);
        }
        element = element.parentElement;
      }
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', handleScroll, true);
        document.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
        
        // Remove listeners from scrollable parents
        scrollableParents.forEach(parent => {
          parent.removeEventListener('scroll', handleScroll);
        });
      };
    }
  }, [isOpen]);

  const getDisplayValue = (): string => {
    if (isOpen && searchTerm !== '') {
      return searchTerm;
    }
    return selectedLabel || placeholder;
  };

  return (
    <div className="relative w-full" ref={containerRef}>
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
          disabled={isEffectivelyDisabled}
          className={`
            w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            pr-10
            ${isEffectivelyDisabled 
              ? 'bg-gray-100 cursor-not-allowed text-gray-500' 
              : 'bg-white hover:border-gray-400'
            }
            ${!selectedLabel && !isOpen && !isEffectivelyDisabled ? 'text-gray-400' : ''}
            transition-colors duration-200
          `}
          placeholder={isOpen ? placeholder : ''}
        />
        
        <button
          type="button"
          onClick={handleDropdownToggle}
          disabled={isEffectivelyDisabled}
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
      
      {/* Dropdown Options via Portal */}
      {isOpen && !isEffectivelyDisabled && isMounted && portalPosition && (
        createPortal(
          <div 
            ref={dropdownRef}
            className="fixed z-[9999] bg-white border border-gray-200 rounded-md shadow-xl max-h-60 overflow-y-auto"
            style={{
              top: `${portalPosition?.top}px`,
              left: `${portalPosition?.left}px`,
              width: `${portalPosition?.width}px`
            }}
          >
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
          </div>,
          document.body
        )
      )}
    </div>
  );
};