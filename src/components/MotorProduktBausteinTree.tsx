"use client"

import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Produktbaustein } from '@/constants';
import { MotorEditNumber } from './MotorEditNumber';
import { MotorEditText } from './MotorEditText';
import { MotorCheckBox } from './MotorCheckBox';
import { isChecked, updateCheckStatus, updateBetragStatus } from '@/utils/fieldDefinitionsHelper';

export interface MotorProduktBausteinTreeProps {
  bausteine: Produktbaustein[];
  sparteAktiv: boolean;
  filterText?: string;
  // FIELD_DEFINITIONS für Single Point of Truth
  fieldDefinitions: any;
  onFieldDefinitionsChange: (updates: any) => void;
}

interface BausteinTreeItemProps {
  baustein: Produktbaustein;
  index: number;
  level: number;
  sparte: string; // Sparten-Code für FIELD_DEFINITIONS Lookup
  sparteAktiv: boolean;
  filterText?: string;
  // FIELD_DEFINITIONS für Single Point of Truth
  fieldDefinitions: any;
  onFieldDefinitionsChange: (updates: any) => void;
}

// Hilfsfunktion für stabile eindeutige Keys
const generateStableKey = (baustein: Produktbaustein, index: number, level: number, prefix: string = 'baustein'): string => {
  // Verwende Index + Beschreibung-Hash für stabile Keys
  const descriptionHash = baustein.knotenId + "_"+ baustein.beschreibung
    .replace(/[^\w]/g, '') // Nur Wörter
    .slice(0, 10) + baustein.beschreibung.length; // Kurz + Länge für Eindeutigkeit
  

   // console.log(`--> generateStableKey: ${prefix}-${level}-${index}-${descriptionHash}`);

  return `${prefix}-${level}-${index}-${descriptionHash}`;
};

const BausteinTreeItem: React.FC<BausteinTreeItemProps> = ({
  baustein,
  index,
  level,
  sparte,
  sparteAktiv,
  filterText,
  fieldDefinitions,
  onFieldDefinitionsChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Filter-Logik: Zeige Baustein wenn Beschreibung den Filter-Text enthält
  const matchesFilter = !filterText || 
    baustein.beschreibung.toLowerCase().includes(filterText.toLowerCase());
  
  // Zeige auch wenn Sub-Bausteine den Filter matchen
  const hasMatchingSubBaustein = baustein.subBausteine?.some(sub => 
    sub.beschreibung.toLowerCase().includes(filterText?.toLowerCase() || '')
  );
  
  const shouldShow = matchesFilter || hasMatchingSubBaustein;
  
  if (!shouldShow) {
    return null;
  }

  const hasSubBausteine = baustein.subBausteine && baustein.subBausteine.length > 0;
  const indentSize = level * 24; // 24px pro Ebene

  const handleCheckboxChange = (value: 'J' | 'N') => {
    // Nur editierbare Bausteine können geändert werden
    const hasRealKnotenId = baustein.knotenId && baustein.knotenId.trim() !== '';
    const isPflicht = baustein.verhalten === 'P';
    
    console.log(`🔧 handleCheckboxChange [${baustein.beschreibung}]:`, {
      knotenId: baustein.knotenId,
      verhalten: baustein.verhalten,
      hasRealKnotenId,
      isPflicht,
      newValue: value
    });
    
    if (hasRealKnotenId && !isPflicht) {
      const checked = value === 'J';
      console.log(`✅ Direktes FIELD_DEFINITIONS Update: ${baustein.knotenId} = ${checked}`);
      
      // Direktes Update in FIELD_DEFINITIONS (Single Point of Truth)
      updateCheckStatus(baustein.knotenId, sparte, checked, fieldDefinitions, onFieldDefinitionsChange, true);
      
      // Auto-Expand: Wenn Baustein angeixt wird und Subbausteine hat, dann expandieren
      if (checked && hasSubBausteine && !isExpanded) {
        console.log(`🔄 Auto-Expand für: ${baustein.beschreibung}`);
        setIsExpanded(true);
      }
    } else {
      console.log(`❌ Baustein nicht editierbar: ${baustein.beschreibung}`, {hasRealKnotenId, isPflicht});
    }
  };

  const handleBetragChange = (value: number) => {
    console.log(`💰 handleBetragChange [${baustein.beschreibung}]: ${baustein.knotenId} = ${value}`);
    
    const hasRealKnotenId = baustein.knotenId && baustein.knotenId.trim() !== '';
    const isPflicht = baustein.verhalten === 'P';
    
    if (hasRealKnotenId && !isPflicht) {
      console.log(`✅ FIELD_DEFINITIONS Betrag Update: ${baustein.knotenId} = ${value}`);
      
      // Direktes Update in FIELD_DEFINITIONS (Single Point of Truth)
      updateBetragStatus(baustein.knotenId, sparte, value, fieldDefinitions, onFieldDefinitionsChange);
    } else {
      console.log(`❌ Betrag nicht editierbar: ${baustein.beschreibung}`, {hasRealKnotenId, isPflicht});
    }
  };

  const toggleExpanded = () => {
    if (hasSubBausteine) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="w-full">
      {/* Hauptbaustein */}
      <div 
        className="flex items-center py-1 hover:bg-gray-50 min-h-[32px] px-4"
        style={{ paddingLeft: `${indentSize + 16}px` }}
      >
        {/* Checkbox */}
        <div className="flex items-center mr-3">
          <MotorCheckBox
            value={
              // Pflicht-Bausteine sind immer angeixt
              baustein.verhalten === 'P' || 
              // Bausteine ohne knotenId sind immer angeixt  
              !baustein.knotenId || 
              baustein.knotenId.trim() === '' ||
              // Single Point of Truth: FIELD_DEFINITIONS Lookup
              isChecked(baustein.knotenId, sparte, fieldDefinitions)
              ? 'J' : 'N'
            }
            onChange={handleCheckboxChange}
            label=""
            hideLabel={true}
            disabled={
              !sparteAktiv || 
              !baustein.knotenId || 
              baustein.knotenId.trim() === '' || 
              baustein.verhalten === 'P' // Pflicht-Bausteine sind nicht editierbar
            }
          />
        </div>

        {/* Beschreibung (nicht editierbar) mit Expand-Button */}
        <div className="flex-1 min-w-0 mr-4 flex items-center gap-2">
          {hasSubBausteine ? (
            <button
              onClick={toggleExpanded}
              className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
              disabled={!sparteAktiv || !(
                baustein.verhalten === 'P' || 
                !baustein.knotenId || 
                baustein.knotenId.trim() === '' ||
                isChecked(baustein.knotenId, sparte, fieldDefinitions)
              )}
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-gray-600" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-600" />
              )}
            </button>
          ) : (
            <div className="w-5 flex-shrink-0" /> // Platzhalter für Alignment
          )}
          <div className="flex-1">
            <MotorEditText
              value={baustein.beschreibung}
              onChange={() => {}} // Nicht editierbar
              label=""
              hideLabel={true}
              generellNichtEditierbar={true}
            />
          </div>
        </div>

        {/* Betrags-Label und Eingabefeld */}
        {baustein.betragsLabel && (
          <div className="flex items-center space-x-2 min-w-0">
            <MotorEditText
              value={baustein.betragsLabel}
              onChange={() => {}} // Nicht editierbar
              label=""
              hideLabel={true}
              generellNichtEditierbar={true}
            />
            <div className="w-24">
              <MotorEditNumber
                value={parseFloat(baustein.betrag || '0')}
                onChange={handleBetragChange}
                label=""
                hideLabel={true}
                disabled={
                  !sparteAktiv || 
                  !(baustein.verhalten === 'P' || 
                    !baustein.knotenId || 
                    baustein.knotenId.trim() === '' ||
                    isChecked(baustein.knotenId, sparte, fieldDefinitions)
                  ) || 
                  !baustein.knotenId || 
                  baustein.knotenId.trim() === '' || 
                  baustein.verhalten === 'P' // Pflicht-Bausteine sind nicht editierbar
                }
                format="currency"
                min={0}
                placeholder="0,00"
              />
            </div>
          </div>
        )}

      </div>

      {/* Sub-Bausteine (rekursiv) - zeige wenn expandiert und Parent angeixt */}  
      {hasSubBausteine && isExpanded && (
        baustein.verhalten === 'P' || 
        !baustein.knotenId || 
        baustein.knotenId.trim() === '' ||
        isChecked(baustein.knotenId, sparte, fieldDefinitions)
      ) && (
        <div className="border-l border-gray-200 ml-4">
          {baustein.subBausteine.map((subBaustein, subIndex) => (
            <BausteinTreeItem
              key={generateStableKey(subBaustein, subIndex, level + 1, `sub-${index}`)}
              baustein={subBaustein}
              index={subIndex}
              level={level + 1}
              sparte={sparte}
              sparteAktiv={sparteAktiv && (
                baustein.verhalten === 'P' || 
                !baustein.knotenId || 
                baustein.knotenId.trim() === '' ||
                isChecked(baustein.knotenId, sparte, fieldDefinitions)
              )}
              filterText={filterText}
              fieldDefinitions={fieldDefinitions}
              onFieldDefinitionsChange={onFieldDefinitionsChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const MotorProduktBausteinTree: React.FC<MotorProduktBausteinTreeProps> = ({
  bausteine,
  sparteAktiv,
  filterText,
  fieldDefinitions,
  onFieldDefinitionsChange
}) => {
  // Extrahiere Sparten-Code aus ersten Baustein für FIELD_DEFINITIONS Lookup
  const sparte = bausteine.length > 0 ? bausteine[0].parentKnotenId : 'KH';
  if (!bausteine || bausteine.length === 0) {
    return (
      <div className="py-4 text-center text-gray-500 text-sm">
        Keine Bausteine verfügbar
      </div>
    );
  }

  // Filtere Root-Level Bausteine
  const visibleBausteine = bausteine.filter(baustein => {
    if (!filterText) return true;
    
    const matchesDescription = baustein.beschreibung.toLowerCase().includes(filterText.toLowerCase());
    const hasMatchingSubBaustein = baustein.subBausteine?.some(sub => 
      sub.beschreibung.toLowerCase().includes(filterText.toLowerCase())
    );
    
    return matchesDescription || hasMatchingSubBaustein;
  });

  if (filterText && visibleBausteine.length === 0) {
    return (
      <div className="py-4 text-center text-gray-500 text-sm">
        Keine Bausteine gefunden für &ldquo;{filterText}&rdquo;
      </div>
    );
  }

  return (
    <div className="bg-white">
      {visibleBausteine.map((baustein, index) => (
        <BausteinTreeItem
          key={generateStableKey(baustein, index, 0, 'root')}
          baustein={baustein}
          index={index}
          level={0}
          sparte={sparte}
          sparteAktiv={sparteAktiv}
          filterText={filterText}
          fieldDefinitions={fieldDefinitions}
          onFieldDefinitionsChange={onFieldDefinitionsChange}
        />
      ))}
    </div>
  );
};