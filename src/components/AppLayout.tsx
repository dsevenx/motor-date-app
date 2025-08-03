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
  const globalChatConfig = useGlobalChatConfig();
  const { fieldDefinitions: globalFieldValues, updateFieldDefinitions } = useGlobalFieldDefinitions();
  
  // Standard State für normale Seiten
  const defaultValues = useMemo(() => generateDefaultValues(), []);
  const [fieldValues, setFieldValues] = useState(defaultValues);

  // Sync with global field values from other pages (avoid circular updates)
  useEffect(() => {
    if (globalFieldValues && Object.keys(globalFieldValues).length > 0) {
      setFieldValues(prev => {
        // Filter out single-line-table fields to prevent loops
        const filteredUpdates: Record<string, any> = {};
        Object.keys(globalFieldValues).forEach(key => {
          const field = FIELD_DEFINITIONS.find(f => f.key === key);
          if (field?.type !== 'single-line-table') {
            filteredUpdates[key] = globalFieldValues[key];
          }
        });
        
        if (Object.keys(filteredUpdates).length === 0) {
          return prev; // No updates for this component
        }
        
        // Only update if values have actually changed
        const hasChanges = Object.keys(filteredUpdates).some(key => 
          prev[key] !== filteredUpdates[key]
        );
        return hasChanges ? { ...prev, ...filteredUpdates } : prev;
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
          
          // Propagate changes to global state
          updateFieldDefinitions({ [field.key]: value });
          
          return {
            ...prev,
            [field.key]: value
          };
        });
      };
      return acc;
    }, {} as Record<string, (value: any) => void>);
  }, [updateFieldDefinitions]);

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
    if (!globalChatConfig) {
      // Nur wenn nicht GUI-Test aktiv ist, verwende Standard fieldValues
      setGlobalFieldDefinitions(fieldValues);
    }
  }, [fieldValues, globalChatConfig]);

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