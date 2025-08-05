"use client"

import React, { useState, useMemo, useEffect, ReactNode } from 'react';
import { MotorHeader } from '@/components/MotorHeader';
import { ContractSidePanel } from '@/components/ContractSidePanel';
import { ChatComponent } from '@/components/ChatComponent';
import MotorAktenMenueleiste from '@/components/MotorAktenMenueleiste';
import { EditModeProvider } from '@/contexts/EditModeContext';
import { useGlobalChatConfig } from '@/hooks/useGlobalChatConfig';
import { setGlobalFieldDefinitions, useGlobalFieldDefinitions } from '@/hooks/useGlobalFieldDefinitions';
import { 
  FIELD_DEFINITIONS, 
  generateDefaultValues, 
  generateFieldConfigs
} from '@/constants/fieldConfig';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  console.log('🏗️ AppLayout RENDER');
  
  const globalChatConfig = useGlobalChatConfig();
  const { fieldDefinitions: globalFieldValues, updateFieldDefinitions } = useGlobalFieldDefinitions();
  
  // Standard State für normale Seiten
  const defaultValues = useMemo(() => generateDefaultValues(), []);
  const [fieldValues, setFieldValues] = useState(defaultValues);
  const [isUpdatingFromGlobal, setIsUpdatingFromGlobal] = useState(false);

  // Sync with global field values from other pages (avoid circular updates)
  useEffect(() => {
    console.log('🏗️ AppLayout useEffect: globalFieldValues geändert');
    console.log('🏗️ globalFieldValues Keys:', Object.keys(globalFieldValues || {}));
    console.log('🏗️ globalFieldValues:', globalFieldValues);
    
    if (globalFieldValues && Object.keys(globalFieldValues).length > 0) {
      setFieldValues(prev => {
        console.log('🏗️ setFieldValues aufgerufen in AppLayout');
        console.log('🏗️ Previous fieldValues:', prev);
        
        // Filter out single-line-table fields to prevent loops
        const filteredUpdates: Record<string, any> = {};
        Object.keys(globalFieldValues).forEach(key => {
          const field = FIELD_DEFINITIONS.find(f => f.key === key);
          if (field?.type !== 'single-line-table') {
            filteredUpdates[key] = globalFieldValues[key];
          }
        });
        
        console.log('🏗️ Filtered updates:', filteredUpdates);
        
        if (Object.keys(filteredUpdates).length === 0) {
          console.log('🏗️ Keine Updates für AppLayout - return prev');
          return prev; // No updates for this component
        }
        
        // Only update if values have actually changed
        const changedKeys: string[] = [];
        const unchangedKeys: string[] = [];
        
        Object.keys(filteredUpdates).forEach(key => {
          const prevValue = prev[key];
          const newValue = filteredUpdates[key];
          const isEqual = prevValue === newValue;
          const prevType = typeof prevValue;
          const newType = typeof newValue;
          
          if (!isEqual) {
            changedKeys.push(`${key}: ${JSON.stringify(prevValue)} (${prevType}) → ${JSON.stringify(newValue)} (${newType})`);
          } else {
            unchangedKeys.push(key);
          }
        });
        
        const hasChanges = changedKeys.length > 0;
        
        if (hasChanges) {
          console.log('🏗️ ===== ÄNDERUNGEN ERKANNT =====');
          console.log('🏗️ Geänderte Felder:', changedKeys);
          console.log('🏗️ Unveränderte Felder:', unchangedKeys);
          const newValues = { ...prev, ...filteredUpdates };
          console.log('🏗️ Neue fieldValues:', newValues);
          
          // Markiere als Update von Global (verhindert Rückkopplung)
          setIsUpdatingFromGlobal(true);
          
          return newValues;
        } else {
          console.log('🏗️ ===== KEINE ÄNDERUNGEN =====');
          console.log('🏗️ Alle Felder unverändert:', unchangedKeys.length);
          return prev;
        }
      });
    }
  }, [globalFieldValues]);

  // Generiere individuelle Setter für jedes Feld
  const setters = useMemo(() => {
    return FIELD_DEFINITIONS.reduce((acc, field) => {
      acc[field.key] = (value: any) => {
        setFieldValues(prev => {
          // Only update if value actually changed
          if (prev[field.key] === value || 
              (Array.isArray(prev[field.key]) && Array.isArray(value) && 
               JSON.stringify(prev[field.key]) === JSON.stringify(value))) {
            return prev;
          }
          
          // Only propagate to global if not already updating from global
          if (!isUpdatingFromGlobal) {
            console.log(`🔄 AppLayout setter: ${field.key} changed by user, propagating to global`);
            updateFieldDefinitions({ [field.key]: value });
          } else {
            console.log(`🔄 AppLayout setter: ${field.key} changed from global, not propagating back`);
          }
          
          return {
            ...prev,
            [field.key]: value
          };
        });
      };
      return acc;
    }, {} as Record<string, (value: any) => void>);
  }, [updateFieldDefinitions, isUpdatingFromGlobal]);

  const handleFieldDefinitionsChange = (updates: Record<string, any>) => {
    setFieldValues(prev => ({ ...prev, ...updates }));
  };

  // Standard Field Configs für normale Seiten
  const standardFieldConfigs = useMemo(() => 
    generateFieldConfigs(fieldValues, setters, handleFieldDefinitionsChange), 
    [fieldValues, setters]
  );

  // Verwende globale Chat-Config wenn verfügbar (GUI-Test), sonst Standard
  const activeFieldConfigs = globalChatConfig || standardFieldConfigs;

  // Stelle fieldValues global für andere Komponenten zur Verfügung
  useEffect(() => {
    if (!globalChatConfig && !isUpdatingFromGlobal) {
      // Nur wenn nicht GUI-Test aktiv ist UND nicht von globalFieldValues kommend
      console.log('🔄 AppLayout: Propagiere fieldValues zu global (User-initiated change)');
      setGlobalFieldDefinitions(fieldValues);
    } else if (isUpdatingFromGlobal) {
      // Reset flag nach Update von Global
      console.log('🔄 AppLayout: Reset isUpdatingFromGlobal flag');
      setIsUpdatingFromGlobal(false);
    }
  }, [fieldValues, globalChatConfig, isUpdatingFromGlobal]);

  const renderContent = () => {
    // Nur der Seiteninhalt, da MotorHeader jetzt separat gerendert wird
    return children;
  };

  const renderChat = () => {
    // Immer ChatComponent anzeigen, aber mit unterschiedlichen fieldConfigs
    return (
      <ChatComponent
        fieldConfigs={activeFieldConfigs}
      />
    );
  };

  return (
    <EditModeProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2.5">
        <div className="max-w-[1900px] mx-auto space-y-2.5">
          {/* Top Menu Bar - Full Width */}
          <div className="w-full">
            <MotorAktenMenueleiste />
          </div>

          {/* Three Column Layout: 3/12 + 6/12 + 3/12 = 12/12 */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-2.5">

            {/* Far Left Column - Contract Tree (3/12) - Original Size */}
            <div className="xl:col-span-3">
              <div className="h-[800px] bg-white rounded-lg shadow-lg overflow-y-auto overflow-x-hidden">
                <ContractSidePanel />
              </div>
            </div>

            {/* Middle Column - Header + Dynamic Content (6/12) - Header Fixed, Content Scrollable */}
            <div className="xl:col-span-6">
              <div className="space-y-2.5">
                {/* Header - Fixed Position */}
                <MotorHeader />
                {/* Content - Scrollable */}
                <div className="h-[800px] overflow-y-auto overflow-x-hidden bg-white rounded-lg shadow-lg">
                  <div className="p-4">
                    {renderContent()}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Chat Component (3/12) - Original Size */}
            <div className="xl:col-span-3">
              <div className="h-[700px]">
                {renderChat()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </EditModeProvider>
  );
};