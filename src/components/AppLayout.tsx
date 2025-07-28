"use client"

import React, { useState, useMemo, ReactNode } from 'react';
import { MotorHeader } from '@/components/MotorHeader';
import { ContractSidePanel } from '@/components/ContractSidePanel';
import { ChatComponent } from '@/components/ChatComponent';
import { useGlobalChatConfig } from '@/hooks/useGlobalChatConfig';
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
  
  // Standard State für normale Seiten
  const defaultValues = useMemo(() => generateDefaultValues(), []);
  const [fieldValues, setFieldValues] = useState(defaultValues);

  // Generiere individuelle Setter für jedes Feld
  const setters = useMemo(() => {
    return FIELD_DEFINITIONS.reduce((acc, field) => {
      acc[field.key] = (value: any) => {
        setFieldValues(prev => ({
          ...prev,
          [field.key]: value
        }));
      };
      return acc;
    }, {} as Record<string, (value: any) => void>);
  }, []);

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

  const renderContent = () => {
    // Alle Seiten bekommen den MotorHeader vom AppLayout
    return (
      <>
        <MotorHeader />
        {children}  
      </>
    );
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2.5">
      <div className="max-w-[1900px] mx-auto">
        {/* Three Column Layout: 3/12 + 6/12 + 3/12 = 12/12 */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-2.5">

          {/* Far Left Column - Contract Tree (3/12) - Persistent */}
          <div className="xl:col-span-3">
            <div className="h-[800px] bg-white rounded-lg shadow-lg overflow-hidden">
              <ContractSidePanel />
            </div>
          </div>

          {/* Middle Column - Header + Dynamic Content (6/12) */}
          <div className="xl:col-span-6 space-y-2.5">
            {renderContent()}
          </div>

          {/* Right Column - Chat Component (3/12) - Persistent */}
          <div className="xl:col-span-3">
            <div className="h-full min-h-[700px]">
              {renderChat()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};