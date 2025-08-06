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

  // Removed render tracking logs

  // Ein einziger useEffect für Contract-Datenladung
  useEffect(() => {
    // Inline async Funktion um useCallback-Dependencies zu vermeiden
    const loadData = async () => {
      setLoading(true);
      try {
        const contractData = await fetchContractDataBL(isEditMode);
        
        // WICHTIG: Nur setzen wenn sich etwas geändert hat
        setContract(prevContract => {
          const contractDataString = JSON.stringify(contractData);
          const prevContractString = JSON.stringify(prevContract);
          
          if (contractDataString !== prevContractString) {
            return contractData;
          } else {
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