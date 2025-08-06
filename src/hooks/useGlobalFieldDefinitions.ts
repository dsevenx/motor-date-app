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
  console.log('🌍 ===== updateFieldDefinitions AUFGERUFEN =====');
  console.log('🌍 Updates:', JSON.stringify(updates, null, 2));
  
  if (isUpdating) {
    console.log('🌍 Abbruch: isUpdating=true (verhindert Zirkuläre Updates)');
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
    console.log('🌍 Keine Änderungen erkannt - Abbruch');
    return; // No changes to propagate
  }
  
  console.log('🌍 Änderungen erkannt - Update globalFieldDefinitions');
  globalFieldDefinitions = { ...globalFieldDefinitions, ...updates };
  
  // Set flag and schedule listeners to run after current render cycle
  isUpdating = true;
  console.log('🌍 Benachrichtige alle Listener...');
  
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      globalFieldDefinitionsUpdateListeners.forEach(listener => listener());
      isUpdating = false; // Reset flag after notifications
      console.log('🌍 ===== updateFieldDefinitions ABGESCHLOSSEN =====');
    }, 0);
  } else {
    globalFieldDefinitionsUpdateListeners.forEach(listener => listener());
    isUpdating = false; // Reset flag after notifications
    console.log('🌍 ===== updateFieldDefinitions ABGESCHLOSSEN =====');
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