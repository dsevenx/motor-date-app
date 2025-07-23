"use client"

import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Produktbaustein } from '@/constants';
import { MotorEditNumber } from './MotorEditNumber';
import { MotorEditText } from './MotorEditText';
import { MotorCheckBox } from './MotorCheckBox';

export interface MotorProduktBausteinTreeProps {
  bausteine: Produktbaustein[];
  onBausteinChange: (bausteinPath: number[], field: string, value: any) => void;
  sparteAktiv: boolean;
  filterText?: string;
}

interface BausteinTreeItemProps {
  baustein: Produktbaustein;
  index: number;
  level: number;
  parentPath: number[];
  onBausteinChange: (bausteinPath: number[], field: string, value: any) => void;
  sparteAktiv: boolean;
  filterText?: string;
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
  parentPath,
  onBausteinChange,
  sparteAktiv,
  filterText
}) => {
  const currentPath = [...parentPath, index];
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
    // Debug-Ausgaben für Subbausteine
    if (level > 0) {
      console.log(`🔧 DEBUG Subbaustein [${baustein.beschreibung}]:`, {
        level,
        sparteAktiv,
        'baustein.check': baustein.check,
        'baustein.knotenId': baustein.knotenId,
        'baustein.knotenId.trim()': baustein.knotenId?.trim(),
        'baustein.verhalten': baustein.verhalten,
        hasRealKnotenId: baustein.knotenId && baustein.knotenId.trim() !== '',
        isPflicht: baustein.verhalten === 'P',
        disabledCheckbox: !sparteAktiv || !baustein.knotenId || baustein.knotenId.trim() === '' || baustein.verhalten === 'P'
      });
    }
    
    // Nur editierbare Bausteine können geändert werden
    const hasRealKnotenId = baustein.knotenId && baustein.knotenId.trim() !== '';
    const isPflicht = baustein.verhalten === 'P';
    
    if (hasRealKnotenId && !isPflicht) {
      console.log(`✅ onChange wird aufgerufen für: ${baustein.beschreibung}, Pfad:`, currentPath);
      onBausteinChange(currentPath, 'check', value === 'J');
      
      // Auto-Expand: Wenn Baustein angeixt wird und Subbausteine hat, dann expandieren
      if (value === 'J' && hasSubBausteine && !isExpanded) {
        console.log(`🔄 Auto-Expand für: ${baustein.beschreibung}`);
        setIsExpanded(true);
      }
    } else {
      console.log(`❌ onChange wird NICHT aufgerufen für: ${baustein.beschreibung}`, {hasRealKnotenId, isPflicht});
    }
  };

  const handleBetragChange = (value: number) => {
    onBausteinChange(currentPath, 'betrag', value.toString());
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
            value={baustein.check || 
              !baustein.knotenId || 
              baustein.knotenId.trim() === '' || 
              baustein.verhalten === 'P' // Pflicht-Bausteine sind nicht editierbar
              
              ? 'J' : 'N'}
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
              disabled={!sparteAktiv || !baustein.check}
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
                  !baustein.check || 
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

      {/* Sub-Bausteine (rekursiv) */}
      {hasSubBausteine && isExpanded && baustein.check && (
        <div className="border-l border-gray-200 ml-4">
          {(() => {
            console.log(`🔧 DEBUG Parent-Baustein [${baustein.beschreibung}]:`, {
              'parent.check': baustein.check,
              'parent.sparteAktiv': sparteAktiv,
              'newSparteAktiv': sparteAktiv && baustein.check,
              subBausteineCount: baustein.subBausteine.length
            });
            return null;
          })()}
          {baustein.subBausteine.map((subBaustein, subIndex) => (
            <BausteinTreeItem
              key={generateStableKey(subBaustein, subIndex, level + 1, `sub-${index}`)}
              baustein={subBaustein}
              index={subIndex}
              level={level + 1}
              parentPath={currentPath}
              onBausteinChange={onBausteinChange}
              sparteAktiv={sparteAktiv && baustein.check}
              filterText={filterText}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const MotorProduktBausteinTree: React.FC<MotorProduktBausteinTreeProps> = ({
  bausteine,
  onBausteinChange,
  sparteAktiv,
  filterText
}) => {
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
        Keine Bausteine gefunden für "{filterText}"
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
          parentPath={[]}
          onBausteinChange={onBausteinChange}
          sparteAktiv={sparteAktiv}
          filterText={filterText}
        />
      ))}
    </div>
  );
};