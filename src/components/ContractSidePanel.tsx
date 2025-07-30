"use client"

import React, { useState, useEffect } from 'react';
import { ContractTreeComponent } from './ContractTreeComponent';
import { OrdnervereinbarungComponent } from './OrdnervereinbarungComponent';
import { Contract } from '@/types/contractTypes';
import { fetchContractDataDB } from '@/app/api/FetchContractDB';

export const ContractSidePanel: React.FC = () => {
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContractData();
  }, []);

  const loadContractData = async () => {
    setLoading(true);
    try {
      const contractData = await fetchContractDataDB();
      setContract(contractData);
    } catch (error) {
      console.error('Fehler beim Laden der Contract-Daten:', error);
    } finally {
      setLoading(false);
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
        <ContractTreeComponent />
      </div>

      {/* Separator */}
      <div className="h-1 bg-gray-300 flex-shrink-0"></div>

      {/* Ordnervereinbarung Section (1/3 der Höhe) */}
      <div className="flex-shrink-0" style={{ flexBasis: '33.33%', minHeight: '200px' }}>
        {contract && (
          <OrdnervereinbarungComponent 
            ordnervereinbarungen={contract.ordnervereinbarungen} 
          />
        )}
      </div>
    </div>
  );
};