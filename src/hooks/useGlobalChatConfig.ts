"use client"

import { useState, useEffect } from 'react';

// Globaler State für Chat-Konfiguration
let globalChatConfig: any = null;
const globalChatUpdateListeners: (() => void)[] = [];

export const setGlobalChatConfig = (config: any) => {
  globalChatConfig = config;
  globalChatUpdateListeners.forEach(listener => listener());
};

export const useGlobalChatConfig = () => {
  const [config, setConfig] = useState(globalChatConfig);

  useEffect(() => {
    const listener = () => {
      setConfig(globalChatConfig);
    };
    
    globalChatUpdateListeners.push(listener);
    
    return () => {
      const index = globalChatUpdateListeners.indexOf(listener);
      if (index > -1) {
        globalChatUpdateListeners.splice(index, 1);
      }
    };
  }, []);

  return config;
};