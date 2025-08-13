"use client"

import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, ChevronDown } from 'lucide-react';
import { Produktsparte } from '@/constants';
import { MotorProduktBausteinTree } from './MotorProduktBausteinTree';
import { MotorDropDown } from './MotorDropDown';
import { MotorEditNumber } from './MotorEditNumber';
import { MotorEditText } from './MotorEditText';
import { MotorCheckBox } from './MotorCheckBox';
import { isChecked, updateCheckStatus } from '@/utils/fieldDefinitionsHelper';
import { useGlobalProductData } from '@/hooks/useGlobalProductData';

export interface MotorProduktSpartenTreeProps {
  // FIELD_DEFINITIONS für Single Point of Truth
  fieldDefinitions: any;
  onFieldDefinitionsChange: (updates: any) => void;
}

interface SpartenRowState {
  sparte: Produktsparte; // Nur für Struktur-Daten (beschreibung, bausteine, etc.)
  isExpanded: boolean; // UI-State für Expand/Collapse
  zustandDomainId: string; // Domain-Mapping für Dropdowns
  // check, zustand, stornogrund kommen NUR aus FIELD_DEFINITIONS!
}

export const MotorProduktSpartenTree: React.FC<MotorProduktSpartenTreeProps> = ({
  fieldDefinitions,
  onFieldDefinitionsChange
}) => {
  const [spartenRows, setSpartenRows] = useState<SpartenRowState[]>([]);
  const [filterText, setFilterText] = useState('');
  
  // 🌐 Verwende globale Produktdaten statt lokaler Ladung
  const { productData, isLoaded: isProductDataLoaded, isLoading: isProductDataLoading } = useGlobalProductData();
  
  // Domain-Mapping für Zustandsdetail pro Sparte
  const getZustandDomainId = (sparte: string): string => {
    switch (sparte) {
      case 'KH': return 'KraftBoGruppeMoeglVertragZustandKH';
      case 'KK': return 'KraftBoGruppeMoeglVertragZustandVK';
      case 'EK': return 'KraftBoGruppeMoeglVertragZustandTK';
      case 'KU': return 'KraftBoGruppeMoeglVertragZustandKU';
      default: return 'KraftBoGruppeMoeglVertragZustandKH';
    }
  };

  // 🌐 Initialisiere lokale Sparten-Rows wenn globale Produktdaten verfügbar sind
  useEffect(() => {
    if (isProductDataLoaded && productData.length > 0) {
      console.log(`🎯 MotorProduktSpartenTree: Verwende globale Produktdaten (${productData.length} Sparten)`);
      
      // Initialisiere Sparten-Rows mit Struktur-Daten (OHNE check/zustand - kommt aus FIELD_DEFINITIONS)
      const initialRows: SpartenRowState[] = productData.map(sparte => ({
        sparte: {
          ...sparte,
          // Entferne check - wird NUR aus FIELD_DEFINITIONS gelesen!
          // check, zustand, stornogrund sind jetzt read-only aus FIELD_DEFINITIONS
        },
        isExpanded: false, // User muss manuell öffnen
        zustandDomainId: getZustandDomainId(sparte.sparte)
      }));
      
      setSpartenRows(initialRows);
      console.log(`✅ MotorProduktSpartenTree: ${initialRows.length} Sparten-Rows initialisiert`);
    }
  }, [isProductDataLoaded, productData]);

  // Debug: Überwache spartenRows State-Änderungen (nur UI-State - check kommt aus FIELD_DEFINITIONS)
  useEffect(() => {
    console.log(`🔄 spartenRows State geändert (nur UI):`, spartenRows.map(r => ({
      sparte: r.sparte.sparte, 
      expanded: r.isExpanded,
      // check kommt NICHT aus spartenRows - nur aus FIELD_DEFINITIONS!
    })));
  }, [spartenRows]);

  // AI-Updates kommen jetzt direkt über die normale Tabellen-Synchronisation
  // Spezielle spartenActions/bausteinActions-Verarbeitung nicht mehr nötig

  // Sparten-Checkbox ändern (NUR FIELD_DEFINITIONS - kein lokaler State!)
  const handleSparteCheckChange = (sparteIndex: number, value: 'J' | 'N') => {
    const checked = value === 'J';
    const sparteCode = spartenRows[sparteIndex].sparte.sparte;
    
    console.log(`🔍 Sparten-Checkbox geändert: ${sparteCode} = ${checked}`);
    console.log(`🎯 UPDATE NUR FIELD_DEFINITIONS - kein lokaler State!`);
    
    // Update FIELD_DEFINITIONS (Single Point of Truth) über zentrale Funktion
    // Die Zustand-Logik (zustand: 'A'/'', stornogrund: ' ') ist jetzt in updateCheckStatus integriert
    updateCheckStatus(
      sparteCode, // knotenId
      sparteCode, // sparte (bei Sparten-Updates sind beide gleich)
      checked,    // neuer Check-Status
      fieldDefinitions,
      onFieldDefinitionsChange,
      true        // isUserInput = true (echte User-Interaktion)
    );
    
    
    // Update NUR UI-State für Expand-Verhalten (nicht check!)
    setSpartenRows(prevRows => {
      const newRows = [...prevRows];
      newRows[sparteIndex] = {
        ...newRows[sparteIndex],
        isExpanded: checked // Auto-Expand bei Aktivierung
      };
      return newRows;
    });
    
    };

  // Helper-Funktionen für FIELD_DEFINITIONS Lookups
  const getSparteFromFieldDefinitions = (sparteCode: string) => {
    const spartenData = fieldDefinitions.produktSparten?.value || [];
    return spartenData.find((s: any) => s.id === sparteCode);
  };

  // Sparten-Zustand Dropdown ändern (FIELD_DEFINITIONS Update)
  const handleSparteZustandChange = (sparteIndex: number, value: string) => {
    const sparteCode = spartenRows[sparteIndex].sparte.sparte;
    console.log(`🔍 Zustand Update: ${sparteCode} = ${value}`);
    
    // Update FIELD_DEFINITIONS
    const spartenData = [...(fieldDefinitions.produktSparten?.value || [])];
    const sparteFieldIndex = spartenData.findIndex((s: any) => s.id === sparteCode);
    
    if (sparteFieldIndex >= 0) {
      spartenData[sparteFieldIndex] = { 
        ...spartenData[sparteFieldIndex], 
        zustand: value,
        // Zustandsdetail nur bei "S" (Storniert) erlaubt, sonst immer leer
        stornogrund: value === 'S' ? spartenData[sparteFieldIndex].stornogrund : ' '
      };
      onFieldDefinitionsChange({
        produktSparten: { value: spartenData }
      });
    }
  };

  // Sparten-Zustandsdetail Dropdown ändern (FIELD_DEFINITIONS Update)
  const handleSparteZustandsdetailChange = (sparteIndex: number, value: string) => {
    const sparteCode = spartenRows[sparteIndex].sparte.sparte;
    console.log(`🔍 Zustandsdetail Update: ${sparteCode} = ${value}`);
    
    // Update FIELD_DEFINITIONS
    const spartenData = [...(fieldDefinitions.produktSparten?.value || [])];
    const sparteFieldIndex = spartenData.findIndex((s: any) => s.id === sparteCode);
    
    if (sparteFieldIndex >= 0) {
      const currentZustand = spartenData[sparteFieldIndex].zustand;
      
      // Zustandsdetail darf nur bei Zustand "S" (Storniert) geändert werden
      if (currentZustand === 'S') {
        spartenData[sparteFieldIndex] = { 
          ...spartenData[sparteFieldIndex], 
          stornogrund: value 
        };
        onFieldDefinitionsChange({
          produktSparten: { value: spartenData }
        });
      }
    }
  };

  // Expand/Collapse Toggle
  const handleSparteToggle = (sparteIndex: number) => {
    console.log(`🔍 Expand-Toggle: Index=${sparteIndex}`);
    console.log(`🔍 Vorher - isExpanded:`, spartenRows[sparteIndex].isExpanded);
    
    setSpartenRows(prevRows => {
      const newRows = [...prevRows];
      // Neue Referenz erstellen
      newRows[sparteIndex] = {
        ...newRows[sparteIndex],
        isExpanded: !newRows[sparteIndex].isExpanded
      };
      
      console.log(`🔍 Nachher - isExpanded:`, newRows[sparteIndex].isExpanded);
      return newRows;
    });
    
    // Force re-render nicht mehr nötig - FIELD_DEFINITIONS triggert automatisch
  };



  if (isProductDataLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        <span className="ml-2 text-gray-600">Lade Produktdaten...</span>
      </div>
    );
  }

  // Debug Render-Info
  console.log(`🖼️ Component Render - spartenRows.length: ${spartenRows.length}`);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header mit Filter */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-800">Produktsparten</h3>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Filter..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabellen-Header */}
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-600 uppercase tracking-wide">
          <div className="col-span-1 text-center">Aktiv</div>
          <div className="col-span-4">Sparte</div>
          <div className="col-span-2">Zustand</div>
          <div className="col-span-2">Zustandsdetail</div>
          <div className="col-span-1 text-right">JVB</div>
          <div className="col-span-2 text-right">JZB</div>
        </div>
      </div>

      {/* Sparten-Rows */}
      <div className="divide-y divide-gray-100">
        {spartenRows.map((row, sparteIndex) => (
          <div key={`sparte-${row.sparte.sparte}-${sparteIndex}`} className="bg-white">
            {/* Sparten-Row */}
            <div className="px-4 py-3 hover:bg-gray-50">
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Checkbox */}
                <div className="col-span-1 flex justify-center">
                  <MotorCheckBox
                    value={isChecked(row.sparte.sparte, row.sparte.sparte, fieldDefinitions) ? 'J' : 'N'}
                    onChange={(value) => handleSparteCheckChange(sparteIndex, value)}
                    label=""
                    hideLabel={true}
                  />
                </div>

                {/* Beschreibung (nicht editierbar) mit Expand-Button */}
                <div className="col-span-4 flex items-center gap-2">
                  <button
                    onClick={() => handleSparteToggle(sparteIndex)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                  >
                    {row.isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                  <div className="flex-1">
                    <MotorEditText
                      value={row.sparte.beschreibung}
                      onChange={() => {}} // Nicht editierbar
                      label=""
                      hideLabel={true}
                      generellNichtEditierbar={true}
                    />
                  </div>
                </div>

                {/* Zustand Dropdown */}
                <div className="col-span-2">
                  <MotorDropDown
                    value={getSparteFromFieldDefinitions(row.sparte.sparte)?.zustand || ' '}
                    onChange={(value) => handleSparteZustandChange(sparteIndex, value)}
                    label=""
                    domainId={row.zustandDomainId}
                    hideLabel={true}
                    disabled={!isChecked(row.sparte.sparte, row.sparte.sparte, fieldDefinitions)}
                  />
                </div>

                {/* Zustandsdetail Dropdown */}
                <div className="col-span-2">
                  <MotorDropDown
                    value={getSparteFromFieldDefinitions(row.sparte.sparte)?.stornogrund || ' '}
                    onChange={(value) => handleSparteZustandsdetailChange(sparteIndex, value)}
                    label=""
                    domainId="KraftBoGruppeMoeglStornogruendeSparte"
                    hideLabel={true}
                    disabled={
                      !isChecked(row.sparte.sparte, row.sparte.sparte, fieldDefinitions) ||
                      // Nur editierbar wenn Zustand "S" (Storniert) ist
                      getSparteFromFieldDefinitions(row.sparte.sparte)?.zustand !== 'S'
                    }
                  />
                </div>

                {/* JVB (nicht editierbar) */}
                <div className="col-span-1">
                  <MotorEditNumber
                    value={parseFloat(row.sparte.beitragNetto || '0')}
                    onChange={() => {}} // Nicht editierbar
                    label=""
                    hideLabel={true}
                    generellNichtEditierbar={true}
                    format="currency"
                  />
                </div>

                {/* JZB (nicht editierbar) */}
                <div className="col-span-2">
                  <MotorEditNumber
                    value={parseFloat(row.sparte.beitragBrutto || '0')}
                    onChange={() => {}} // Nicht editierbar
                    label=""
                    hideLabel={true}
                    generellNichtEditierbar={true}
                    format="currency"
                  />
                </div>
              </div>
            </div>

            {/* Baustein-Tree (nur wenn Sparte aktiv UND expandiert) */}
            {isChecked(row.sparte.sparte, row.sparte.sparte, fieldDefinitions) && row.isExpanded && (
              <div className="bg-gray-50 border-t border-gray-100">
                <div className="ml-12">
                  <MotorProduktBausteinTree
                    bausteine={row.sparte.bausteine}
                    sparteAktiv={isChecked(row.sparte.sparte, row.sparte.sparte, fieldDefinitions)}
                    fieldDefinitions={fieldDefinitions}
                    onFieldDefinitionsChange={onFieldDefinitionsChange}
                    filterText={filterText}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer mit Statistik */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex justify-between text-xs text-gray-600">
          <span>
            {spartenRows.filter(row => isChecked(row.sparte.sparte, row.sparte.sparte, fieldDefinitions)).length} von {spartenRows.length} Sparten aktiv
          </span>
          <span>
            {spartenRows.reduce((sum, row) => sum + (row.sparte.bausteine?.length || 0), 0)} Bausteine gesamt
          </span>
        </div>
      </div>
    </div>
  );
};