"use client"

import React, { useState, useMemo, useEffect, ReactNode } from 'react';
import { MotorHeader } from '@/components/MotorHeader';
import { ContractSidePanel } from '@/components/ContractSidePanel';
import { ChatComponent } from '@/components/ChatComponent';
import MotorAktenMenueleiste from '@/components/MotorAktenMenueleiste';
import { EditModeProvider } from '@/contexts/EditModeContext';
import { useGlobalChatConfig } from '@/hooks/useGlobalChatConfig';
import { setGlobalFieldDefinitions, useGlobalFieldDefinitions } from '@/hooks/useGlobalFieldDefinitions';
import { useGlobalProductData } from '@/hooks/useGlobalProductData';
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
  
  // 🌐 Globale Produktdaten-Initialisierung - lädt einmalig beim App-Start
  const { ensureProductDataLoaded, isLoaded: isProductDataLoaded } = useGlobalProductData();
  
  // Produktdaten beim App-Start laden
  useEffect(() => {
    const initializeProductData = async () => {
      try {
        console.log(`🚀 AppLayout: Initialisiere globale Produktdaten...`);
        await ensureProductDataLoaded();
        console.log(`✅ AppLayout: Globale Produktdaten initialisiert`);
      } catch (error) {
        console.error('❌ AppLayout: Fehler beim Laden der Produktdaten:', error);
      }
    };
    
    initializeProductData();
  }, []); // Nur einmal beim Mount ausführen
  
  // Standard State für normale Seiten
  const defaultValues = useMemo(() => generateDefaultValues(), []);
  const [fieldValues, setFieldValues] = useState(defaultValues);
  const [isUpdatingFromGlobal, setIsUpdatingFromGlobal] = useState(false);

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
        const hasChanges = Object.keys(filteredUpdates).some(key => {
          const prevValue = prev[key];
          const newValue = filteredUpdates[key];
          return prevValue !== newValue;
        });
        
        if (hasChanges) {
          // Markiere als Update von Global (verhindert Rückkopplung)
          setIsUpdatingFromGlobal(true);
          return { ...prev, ...filteredUpdates };
        } else {
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
            console.log(`🔄 AppLayout Setter für ${field.key} ruft updateFieldDefinitions auf:`, value);
            updateFieldDefinitions({ [field.key]: value });
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
    if (!isUpdatingFromGlobal) {
      // CRITICAL FIX: Only propagate non-default values to prevent overwriting user input
      // Filter out fields that are still at their default values
      const nonDefaultUpdates: Record<string, any> = {};
      const defaultValues = generateDefaultValues();
      
      Object.keys(fieldValues).forEach(key => {
        const currentValue = fieldValues[key];
        const defaultValue = defaultValues[key];
        
        // Only propagate if value differs from default
        if (Array.isArray(currentValue) && Array.isArray(defaultValue)) {
          if (JSON.stringify(currentValue) !== JSON.stringify(defaultValue)) {
            nonDefaultUpdates[key] = currentValue;
          }
        } else if (currentValue !== defaultValue) {
          nonDefaultUpdates[key] = currentValue;
        }
      });
      
      // Only propagate if we have non-default values
      if (Object.keys(nonDefaultUpdates).length > 0) {
        console.log('🌍 AppLayout propagiert NON-DEFAULT fieldValues zu globalFieldDefinitions:', Object.keys(nonDefaultUpdates));
        setGlobalFieldDefinitions(nonDefaultUpdates);
      } else {
        console.log('🌍 AppLayout: Keine non-default values zu propagieren');
      }
    } else {
      // Reset flag nach Update von Global
      setIsUpdatingFromGlobal(false);
    }
  }, [fieldValues, isUpdatingFromGlobal]);

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