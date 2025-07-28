"use client"

import React, { useState, useEffect } from 'react';
import { Contract } from '@/types/contractTypes';
import { fetchContractData } from '@/app/api/FetchContract';
import { NavigationMenu } from './NavigationMenu';

interface MotorHeaderProps {
  contract?: Contract;
}

export const MotorHeader: React.FC<MotorHeaderProps> = ({ contract: propContract }) => {
  const [contract, setContract] = useState<Contract | null>(propContract || null);
  const [loading, setLoading] = useState(!propContract);

  useEffect(() => {
    if (!propContract) {
      loadContractData();
    }
  }, [propContract]);

  const loadContractData = async () => {
    setLoading(true);
    try {
      const contractData = await fetchContractData();
      setContract(contractData);
    } catch (error) {
      console.error('Fehler beim Laden der Contract-Daten:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-100 border-b border-gray-300 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-1/6"></div>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="bg-gray-100 border-b border-gray-300 p-4 text-gray-500">
        Keine Contract-Daten verfügbar
      </div>
    );
  }

  return (
    <div className="bg-gray-100 border-b border-gray-300">
      {/* Oberer Bereich - Hauptinformationen */}
      <div className="px-4 py-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Linke Spalte - Firmeninfos */}
          <div className="space-y-1">
            <div className="font-semibold text-gray-900">{contract.header.companyName}</div>
            <div className="text-sm text-gray-700">{contract.header.address.street}</div>
            <div className="text-sm text-gray-700">{contract.header.address.zipCode} {contract.header.address.city}</div>
            <div className="text-sm text-gray-700 mt-2">
              {contract.header.contractNumber}, gültig ab: {contract.header.validFrom}
            </div>
            <div className="text-sm font-medium text-gray-900">
              {contract.header.status}
            </div>
          </div>

          {/* Mittlere Spalte - Kontaktdaten */}
          <div className="space-y-1">
            <div className="grid grid-cols-2 gap-x-4 text-sm">
              <div className="text-gray-600">MAZ:</div>
              <div className="text-gray-900">{contract.header.maz}</div>
              
              <div className="text-gray-600">Internet:</div>
              <div className="text-gray-900">{contract.header.internet}</div>
              
              <div className="text-gray-600">Tel. gesch.:</div>
              <div className="text-gray-900">{contract.header.telBusiness}</div>
              
              <div className="text-gray-600">Tel. mobil:</div>
              <div className="text-blue-600 underline">{contract.header.telMobile}</div>
              
              <div className="text-gray-600">E-Mail:</div>
              <div className="text-blue-600 underline">{contract.header.email}</div>
              
              <div className="text-gray-600">Verantw.:</div>
              <div className="text-gray-900">{contract.header.responsible}</div>
            </div>
          </div>

          {/* Rechte Spalte - Weitere Infos */}
          <div className="space-y-1">
            <div className="text-right">
              <div className="text-sm text-gray-900">{contract.header.referenceNumber}</div>
              <div className="text-sm font-medium text-gray-900">{contract.header.type}</div>
            </div>
            <div className="text-sm text-gray-700 text-right mt-4">
              60596 Frankfurt am Main
            </div>
            <div className="text-sm text-gray-700 text-right">
              Fax: {contract.header.fax}
            </div>
          </div>
        </div>
      </div>

      {/* Unterer Bereich - Navigation/Tabs */}
      <div className="bg-gray-200 border-t border-gray-300">
        <div className="px-4 py-2">
          <div className="flex space-x-6 text-sm">
            <button className="text-gray-700 hover:text-gray-900 font-medium">Kontakt</button>
            <button className="text-gray-700 hover:text-gray-900 font-medium">Sparte</button>
            <button className="text-gray-700 hover:text-gray-900 font-medium">Ordnungsbegriff</button>
            <button className="text-gray-700 hover:text-gray-900 font-medium">Gepro</button>
            <button className="text-gray-700 hover:text-gray-900 font-medium">Anliegen</button>
            <button className="text-gray-700 hover:text-gray-900 font-medium">Anrufer</button>
            <button className="text-gray-700 hover:text-gray-900 font-medium">Mitarbeiter</button>
            <button className="text-gray-700 hover:text-gray-900 font-medium">Art</button>
            <button className="text-gray-700 hover:text-gray-900 font-medium">TKH</button>
          </div>
        </div>
      </div>

      {/* Hauptmenü Navigation */}
      <NavigationMenu />
    </div>
  );
};