"use client"

import React, { useState, useEffect, useRef } from 'react';
import { ContractTreeComponent } from './ContractTreeComponent';
import { OrdnervereinbarungComponent } from './OrdnervereinbarungComponent';
import { Contract, Ordnervereinbarung } from '@/types/contractTypes';
import { fetchContractDataBL } from '@/app/api/FetchContractBL';
import { useEditMode } from '@/contexts/EditModeContext';

const ContractSidePanelComponent: React.FC = () => {
  const { isEditMode } = useEditMode();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  
  // REMOVED: ordnervereinbarungen und ordnervereinbarungenLoading
  // Diese kommen jetzt aus contract.ordnervereinbarungen!

  // Referenz für vorherige Werte zu Änderungs-Erkennung
  const prevValuesRef = useRef<{
    loading?: boolean;
    contractName?: string;
    isEditMode?: boolean;
    contractString?: string;
  }>({});

  const currentValues = {
    loading,
    contractName: contract?.name,
    isEditMode,
    contractString: JSON.stringify(contract)
  };

  // Erkennung von Änderungen
  const changes: string[] = [];
  Object.entries(currentValues).forEach(([key, value]) => {
    const prevValue = prevValuesRef.current[key as keyof typeof prevValuesRef.current];
    if (prevValue !== value) {
      changes.push(`${key}: ${JSON.stringify(prevValue)} → ${JSON.stringify(value)}`);
    }
  });

  if (changes.length > 0) {
    console.log('🔄 ContractSidePanel RENDER - ÄNDERUNGEN erkannt:', changes);
  } else {
    console.log('📋 ContractSidePanel RENDER - KEINE Änderungen (warum re-render?)');
  }

  // Aktuelle Werte für nächsten Vergleich speichern
  prevValuesRef.current = { ...currentValues };

  // Ein einziger useEffect für Contract-Datenladung
  useEffect(() => {
    console.log('📋 useEffect: Lade Contract-Daten (mount + EditMode-Änderung)...');
    console.log('📋 Aktueller isEditMode:', isEditMode);
    
    // Inline async Funktion um useCallback-Dependencies zu vermeiden
    const loadData = async () => {
      console.log('📋 loadData aufgerufen mit isEditMode:', isEditMode);
      setLoading(true);
      try {
        const contractData = await fetchContractDataBL(isEditMode);
        console.log('📋 ContractSidePanel: Contract-Daten geladen');
        console.log('📋 Contract enthält Ordnervereinbarungen:', contractData.ordnervereinbarungen?.length || 0);
        
        // WICHTIG: Nur setzen wenn sich etwas geändert hat
        setContract(prevContract => {
          const contractDataString = JSON.stringify(contractData);
          const prevContractString = JSON.stringify(prevContract);
          
          if (contractDataString !== prevContractString) {
            console.log('📋 Contract-Daten haben sich geändert - Update Contract State');
            return contractData;
          } else {
            console.log('📋 Contract-Daten unverändert - KEIN State Update');
            return prevContract;
          }
        });
      } catch (error) {
        console.error('Fehler beim Laden der Contract-Daten:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [isEditMode]); // Nur isEditMode als Dependency!

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Lade Contract-Daten...</span>
      </div>
    );
  }

  console.log('📋 ContractSidePanel RENDER - contract?.name:', contract?.name);
  
  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-300">
      {/* Tree Section (2/3 der Höhe) */}
      <div className="flex-grow" style={{ flexBasis: '66.67%' }}>
        <ContractTreeComponent contractName={contract?.name} />
      </div>

      {/* Separator */}
      <div className="h-1 bg-gray-300 flex-shrink-0"></div>

      {/* Ordnervereinbarung Section (1/3 der Höhe) */}
      <div className="flex-shrink-0" style={{ flexBasis: '33.33%', minHeight: '200px' }}>
        {loading ? (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 text-sm">Lade Ordnervereinbarungen...</span>
          </div>
        ) : (
          <OrdnervereinbarungComponent 
            ordnervereinbarungen={contract?.ordnervereinbarungen || []} 
          />
        )}
      </div>
    </div>
  );
};

// React.memo um unnötige Re-Renders zu verhindern
export const ContractSidePanel = React.memo(ContractSidePanelComponent);