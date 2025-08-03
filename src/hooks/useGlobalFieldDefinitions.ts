"use client"

import { useState, useEffect } from 'react';

// Globaler State für Field Definitions
let globalFieldDefinitions: Record<string, any> = {};
const globalFieldDefinitionsUpdateListeners: (() => void)[] = [];
let isUpdating = false; // Flag to prevent circular updates

export const setGlobalFieldDefinitions = (fieldDefinitions: Record<string, any>) => {
  globalFieldDefinitions = fieldDefinitions;
  globalFieldDefinitionsUpdateListeners.forEach(listener => listener());
};

export const updateGlobalFieldDefinitions = (updates: Record<string, any>) => {
  if (isUpdating) {
    return; // Prevent circular updates
  }
  
  // Check if there are actual changes
  const hasChanges = Object.keys(updates).some(key => {
    const currentValue = globalFieldDefinitions[key];
    const newValue = updates[key];
    
    if (Array.isArray(currentValue) && Array.isArray(newValue)) {
      return JSON.stringify(currentValue) !== JSON.stringify(newValue);
    }
    
    return currentValue !== newValue;
  });
  
  if (!hasChanges) {
    return; // No changes to propagate
  }
  
  globalFieldDefinitions = { ...globalFieldDefinitions, ...updates };
  
  // Set flag and schedule listeners to run after current render cycle
  isUpdating = true;
  
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      globalFieldDefinitionsUpdateListeners.forEach(listener => listener());
      isUpdating = false; // Reset flag after notifications
    }, 0);
  } else {
    globalFieldDefinitionsUpdateListeners.forEach(listener => listener());
    isUpdating = false; // Reset flag after notifications
  }
};

export const useGlobalFieldDefinitions = () => {
  const [fieldDefinitions, setFieldDefinitions] = useState(globalFieldDefinitions);

  useEffect(() => {
    const listener = () => {
      setFieldDefinitions(globalFieldDefinitions);
    };
    
    globalFieldDefinitionsUpdateListeners.push(listener);
    
    return () => {
      const index = globalFieldDefinitionsUpdateListeners.indexOf(listener);
      if (index > -1) {
        globalFieldDefinitionsUpdateListeners.splice(index, 1);
      }
    };
  }, []);

  return {
    fieldDefinitions,
    updateFieldDefinitions: updateGlobalFieldDefinitions
  };
};