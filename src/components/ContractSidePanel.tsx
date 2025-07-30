"use client"

import React, { useState, useEffect } from 'react';
import { ContractTreeComponent } from './ContractTreeComponent';
import { OrdnervereinbarungComponent } from './OrdnervereinbarungComponent';
import { Contract, Ordnervereinbarung } from '@/types/contractTypes';
import { fetchContractDataBL, fetchOrdnervereinbarungenBL } from '@/app/api/FetchContractBL';
import { useEditMode } from '@/contexts/EditModeContext';

export const ContractSidePanel: React.FC = () => {
  const { isEditMode } = useEditMode();
  const [contract, setContract] = useState<Contract | null>(null);
  const [ordnervereinbarungen, setOrdnervereinbarungen] = useState<Ordnervereinbarung[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordnervereinbarungenLoading, setOrdnervereinbarungenLoading] = useState(true);

  useEffect(() => {
    loadContractData();
    loadOrdnervereinbarungenData();
  }, []);

  // Reload nur Ordnervereinbarungen wenn EditMode sich ändert (Performance-Optimierung!)
  useEffect(() => {
    console.log('🔄 EditMode geändert - lade nur Ordnervereinbarungen neu (ContractTree bleibt)');
    loadOrdnervereinbarungenData();
  }, [isEditMode]);

  const loadContractData = async () => {
    setLoading(true);
    try {
      // Lade nur einmal die Basis-Contract-Daten (für Header-Infos)
      const contractData = await fetchContractDataBL(false); // Immer Display-Mode für Contract-Basis
      console.log('📋 ContractSidePanel: Lade Contract-Basisdaten (nur einmal)');
      setContract(contractData);
    } catch (error) {
      console.error('Fehler beim Laden der Contract-Daten:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrdnervereinbarungenData = async () => {
    setOrdnervereinbarungenLoading(true);
    try {
      const ordnervereinbarungenData = await fetchOrdnervereinbarungenBL(isEditMode);
      console.log('📁 ContractSidePanel: Lade nur Ordnervereinbarungen (Performance-optimiert)');
      setOrdnervereinbarungen(ordnervereinbarungenData);
    } catch (error) {
      console.error('Fehler beim Laden der Ordnervereinbarungen:', error);
    } finally {
      setOrdnervereinbarungenLoading(false);
    }
  };

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
        {ordnervereinbarungenLoading ? (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 text-sm">Lade Ordnervereinbarungen...</span>
          </div>
        ) : (
          <OrdnervereinbarungComponent 
            ordnervereinbarungen={ordnervereinbarungen} 
          />
        )}
      </div>
    </div>
  );
};