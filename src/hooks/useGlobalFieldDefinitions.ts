"use client"

import { useState, useEffect } from 'react';

// Globaler State für Field Definitions
let globalFieldDefinitions: Record<string, any> = {};
const globalFieldDefinitionsUpdateListeners: (() => void)[] = [];

export const setGlobalFieldDefinitions = (fieldDefinitions: Record<string, any>) => {
  globalFieldDefinitions = fieldDefinitions;
  globalFieldDefinitionsUpdateListeners.forEach(listener => listener());
};

export const updateGlobalFieldDefinitions = (updates: Record<string, any>) => {
  globalFieldDefinitions = { ...globalFieldDefinitions, ...updates };
  globalFieldDefinitionsUpdateListeners.forEach(listener => listener());
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