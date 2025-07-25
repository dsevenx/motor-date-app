"use client"

import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, ChevronDown } from 'lucide-react';
import { Produktsparte } from '@/constants';
import { fetchProduktData } from '@/app/api/FetchProduktData';
import { MotorProduktBausteinTree } from './MotorProduktBausteinTree';
import { MotorDropDown } from './MotorDropDown';
import { MotorEditNumber } from './MotorEditNumber';
import { MotorEditText } from './MotorEditText';
import { MotorCheckBox } from './MotorCheckBox';
import { isChecked, updateCheckStatus, initializeProductFieldDefinitions } from '@/utils/fieldDefinitionsHelper';

export interface MotorProduktSpartenTreeProps {
  // Callbacks für die 5 Tabellen aus fieldConfig (nur bei User-Interaktion)
  onSpartenChange: (sparten: any[]) => void;
  onBausteineChange: (sparte: string, bausteine: any[]) => void;
  // FIELD_DEFINITIONS für Single Point of Truth
  fieldDefinitions: any;
  onFieldDefinitionsChange: (updates: any) => void;
}

interface SpartenRowState {
  sparte: Produktsparte;
  isExpanded: boolean;
  zustandsdetailDomainId: string;
}

export const MotorProduktSpartenTree: React.FC<MotorProduktSpartenTreeProps> = ({
  onSpartenChange,
  onBausteineChange,
  fieldDefinitions,
  onFieldDefinitionsChange
}) => {
  const [spartenRows, setSpartenRows] = useState<SpartenRowState[]>([]);
  const [filterText, setFilterText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [forceRender, setForceRender] = useState(0);
  
  // Domain-Mapping für Zustandsdetail pro Sparte
  const getZustandsdetailDomainId = (sparte: string): string => {
    switch (sparte) {
      case 'KH': return 'KraftBoGruppeMoeglVertragZustandKH';
      case 'KK': return 'KraftBoGruppeMoeglVertragZustandVK';
      case 'EK': return 'KraftBoGruppeMoeglVertragZustandTK';
      case 'KU': return 'KraftBoGruppeMoeglVertragZustandKU';
      default: return 'KraftBoGruppeMoeglStornogruendeSparte';
    }
  };

  // Produktdaten beim Mount laden
  useEffect(() => {
    const loadProduktData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchProduktData();
        
        // Initialisiere Sparten-Rows mit echten Daten aus fetchProduktData
        const initialRows: SpartenRowState[] = data.map(sparte => ({
          sparte: {
            ...sparte,
            // Verwende die echten Werte aus fetchProduktData für Display
            // Checkbox bleibt erstmal false (wird über FIELD_DEFINITIONS gesteuert)
            check: false
          },
          isExpanded: false, // User muss manuell öffnen
          zustandsdetailDomainId: getZustandsdetailDomainId(sparte.sparte)
        }));
        
        setSpartenRows(initialRows);
        
        // Initialisiere FIELD_DEFINITIONS mit Produktdaten (Single Point of Truth)
        console.log(`🚀 Initialisiere FIELD_DEFINITIONS mit loadProduktData`);
        const fieldDefinitionsUpdates = initializeProductFieldDefinitions(data);
        onFieldDefinitionsChange(fieldDefinitionsUpdates);
        console.log(`✅ FIELD_DEFINITIONS initialisiert:`, fieldDefinitionsUpdates);
        
        // KEINE Initial-Callbacks - nur bei User-Interaktion
        
      } catch (error) {
        console.error('Fehler beim Laden der Produktdaten:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProduktData();
  }, []);

  // Debug: Überwache spartenRows State-Änderungen
  useEffect(() => {
    console.log(`🔄 spartenRows State geändert:`, spartenRows.map(r => ({
      sparte: r.sparte.sparte, 
      check: r.sparte.check, 
      expanded: r.isExpanded
    })));
  }, [spartenRows]);

  // Sparten-Checkbox ändern (FIELD_DEFINITIONS Single Point of Truth)
  const handleSparteCheckChange = (sparteIndex: number, value: 'J' | 'N') => {
    const checked = value === 'J';
    const sparteCode = spartenRows[sparteIndex].sparte.sparte;
    
    console.log(`🔍 Sparten-Checkbox geändert: ${sparteCode} = ${checked}`);
    
    // Update FIELD_DEFINITIONS (Single Point of Truth)
    updateCheckStatus(sparteCode, sparteCode, checked, fieldDefinitions, onFieldDefinitionsChange);
    
    // Update lokaler State für Expand-Verhalten
    setSpartenRows(prevRows => {
      const newRows = [...prevRows];
      newRows[sparteIndex] = {
        ...newRows[sparteIndex],
        isExpanded: checked // Auto-Expand bei Aktivierung
      };
      return newRows;
    });
    
    // Force re-render and callback
    setForceRender(prev => prev + 1);
    setTimeout(() => updateSpartenCallback(), 0);
  };

  // Sparten-Zustand Dropdown ändern
  const handleSparteZustandChange = (sparteIndex: number, value: string) => {
    const newRows = [...spartenRows];
    newRows[sparteIndex].sparte.zustand = value;
    setSpartenRows(newRows);
    updateSpartenCallback();
  };

  // Sparten-Zustandsdetail Dropdown ändern  
  const handleSparteZustandsdetailChange = (sparteIndex: number, value: string) => {
    const newRows = [...spartenRows];
    // Zustandsdetail müsste in der Produktsparte gespeichert werden
    // Für jetzt als temporäre Lösung in einem zusätzlichen Feld
    (newRows[sparteIndex].sparte as any).zustandsdetail = value;
    setSpartenRows(newRows);
    updateSpartenCallback();
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
    
    // Force re-render
    setForceRender(prev => prev + 1);
  };

  // Legacy-Callback für fieldConfig Updates (wird durch FIELD_DEFINITIONS gesteuert)
  const updateBausteineCallback = (sparteCode: string) => {
    console.log(`📤 updateBausteineCallback für Sparte: ${sparteCode}`);
    
    // Erstelle Bausteine-Array aus FIELD_DEFINITIONS (Single Point of Truth)
    const tableKey = `produktBausteine_${sparteCode}`;
    const bausteineData = fieldDefinitions[tableKey]?.value || [];
    
    // Filtere nur angeixte Bausteine mit echteEingabe für Legacy-Callback
    const activeBausteine = bausteineData.filter((b: any) => b.check === true && b.echteEingabe === true);
    
    console.log(`✅ ${activeBausteine.length} aktive Bausteine für ${sparteCode}:`, activeBausteine);
    onBausteineChange(sparteCode, activeBausteine);
  };

  // Update Sparten-Callback
  const updateSpartenCallback = () => {
    console.log(`📤 updateSpartenCallback aufgerufen - spartenRows.length: ${spartenRows.length}`);
    
    const spartenForFieldConfig = spartenRows.map(row => ({
      id: row.sparte.sparte,
      beschreibung: row.sparte.beschreibung,
      check: row.sparte.check,
      zustand: row.sparte.verhalten,
      zustandsdetail: (row.sparte as any).zustandsdetail || '',
      beitragNetto: parseFloat(row.sparte.beitragNetto || '0'),
      beitragBrutto: parseFloat(row.sparte.beitragBrutto || '0')
    }));
    
    console.log(`📤 FIELD_DEFINITIONS Update - spartenForFieldConfig:`, spartenForFieldConfig);
    onSpartenChange(spartenForFieldConfig);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        <span className="ml-2 text-gray-600">Lade Produktdaten...</span>
      </div>
    );
  }

  // Debug Render-Info
  console.log(`🖼️ Component Render - forceRender: ${forceRender}, spartenRows.length: ${spartenRows.length}`);

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
                    value={row.sparte.verhalten}
                    onChange={(value) => handleSparteZustandChange(sparteIndex, value)}
                    label=""
                    domainId="KraftBoGruppeMoeglStornogruendeSparte"
                    hideLabel={true}
                    disabled={!row.sparte.check}
                  />
                </div>

                {/* Zustandsdetail Dropdown */}
                <div className="col-span-2">
                  <MotorDropDown
                    value={(row.sparte as any).zustandsdetail || ''}
                    onChange={(value) => handleSparteZustandsdetailChange(sparteIndex, value)}
                    label=""
                    domainId={row.zustandsdetailDomainId}
                    hideLabel={true}
                    disabled={!row.sparte.check}
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