"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { PageTemplate } from '@/components/PageTemplate';
import { Car, Info } from 'lucide-react';
import { MotorEditNumber } from '@/components/MotorEditNumber';
import { MotorEditText } from '@/components/MotorEditText';
import { MotorTable } from '@/components/MotorTable';
import { 
  generateDefaultValues, 
  generateEchteEingabeValues,
  getFieldByKey,
  TableRow
} from '@/constants/fieldConfig';
import { useGlobalFieldDefinitions } from '@/hooks/useGlobalFieldDefinitions';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

export default function ObjektPage() {
  const { fieldDefinitions: globalFieldValues, updateFieldDefinitions } = useGlobalFieldDefinitions();
  
  // Generiere State basierend auf echten Eingabewerten (nicht nur Defaults)
  const echteEingabeValues = generateEchteEingabeValues();
  const [fieldValues, setFieldValues] = useState(echteEingabeValues);

  // Sync with global field values from Chat updates (avoid circular updates)
  useEffect(() => {
    if (globalFieldValues && Object.keys(globalFieldValues).length > 0) {
      setFieldValues(prev => {
        // Handle regular fields (non single-line-table)
        const regularUpdates: Record<string, any> = {};
        // Handle single-line-table fields separately
        const singleLineUpdates: Record<string, any> = {};
        
        Object.keys(globalFieldValues).forEach(key => {
          const field = getFieldByKey(key);
          if (field?.type === 'single-line-table') {
            singleLineUpdates[key] = globalFieldValues[key];
          } else {
            regularUpdates[key] = globalFieldValues[key];
          }
        });
        
        let hasChanges = false;
        let updates = { ...prev };
        
        // Update regular fields
        if (Object.keys(regularUpdates).length > 0) {
          const regularChanges = Object.keys(regularUpdates).some(key => {
            const currentValue = prev[key];
            const newValue = regularUpdates[key];
            
            if (Array.isArray(currentValue) && Array.isArray(newValue)) {
              return JSON.stringify(currentValue) !== JSON.stringify(newValue);
            }
            
            return currentValue !== newValue;
          });
          
          if (regularChanges) {
            updates = { ...updates, ...regularUpdates };
            hasChanges = true;
          }
        }
        
        // Update single-line-table fields with special handling
        if (Object.keys(singleLineUpdates).length > 0) {
          Object.keys(singleLineUpdates).forEach(key => {
            const currentValue = prev[key];
            const newValue = singleLineUpdates[key];
            
            // For single-line-table, always update to ensure AI changes are reflected
            if (Array.isArray(newValue) && newValue.length > 0) {
              updates = { ...updates, [key]: newValue };
              hasChanges = true;
              
              // echteEingabe wird automatisch durch ChatComponent → handleFieldChange → markAsEchteEingabe gesetzt
              
              console.log(`Single-line-table update for ${key}:`, newValue);
            }
          });
        }
        
        return hasChanges ? updates : prev;
      });
    }
  }, [globalFieldValues]);

  const handleFieldChange = (fieldKey: string, value: any) => {
    setFieldValues(prev => {
      // Only update if value actually changed
      const currentValue = prev[fieldKey];
      const hasChanged = Array.isArray(currentValue) && Array.isArray(value)
        ? JSON.stringify(currentValue) !== JSON.stringify(value)
        : currentValue !== value;
        
      if (!hasChanged) {
        return prev;
      }
      
      // echteEingabe wird automatisch durch Motor-Komponenten über setFieldValueWithEchteEingabe gesetzt
      
      // Propagate to global state for Chat component
      updateFieldDefinitions({ [fieldKey]: value });
      
      return {
        ...prev,
        [fieldKey]: value
      };
    });
  };

  // Typ-/Regionalklasse Dummy-Daten (reine Anzeige)
  const typRegionalklasseData = [
    { typ: 'Typklasse', haftpflicht: 11, vollkasko: 10, teilkasko: 12 },
    { typ: 'Regionalklasse', haftpflicht: 12, vollkasko: 9, teilkasko: 11 }
  ];

  // Field Definitions für die einzelnen Felder
  const fahrleistungField = getFieldByKey('KraftDmKfzVorfahrl');
  const kilometerstaendeField = getFieldByKey('kilometerstaende');
  const zubehoerField = getFieldByKey('zubehoer');
  const manuelleTypklasseField = getFieldByKey('manuelleTypklasse');

  return (
    <PageTemplate title="Objekt" enableSectionNavigation>
      <div className="space-y-8">
        <section id="stamm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Stamm</h2>
          <p className="text-gray-600">Stammdaten des Objekts werden hier angezeigt.</p>
        </section>

        <hr className="border-gray-200" />

        <section id="detail">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Car className="w-6 h-6 text-blue-600" />
            Detail
          </h2>
          
          <div className="space-y-6">
            {/* Fahrleistung Section */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                🚗 Fahrleistung
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fahrleistungField && (
                  <MotorEditNumber
                    value={fieldValues[fahrleistungField.key] as number}
                    onChange={(value) => handleFieldChange(fahrleistungField.key, value)}
                    label={fahrleistungField.label}
                    fieldKey={fahrleistungField.key}
                    placeholder={fahrleistungField.ui?.placeholder}
                    min={fahrleistungField.validation?.min as number}
                    max={fahrleistungField.validation?.max as number}
                    format={fahrleistungField.validation?.numberFormat}
                  />
                )}
                
                {/* Kilometerklasse - nur Anzeige */}
                <MotorEditText
                  value=""
                  onChange={() => {}}
                  label="Kilometerklasse"
                  disabled={true}
                  placeholder="Wird automatisch berechnet"
                />
              </div>
            </div>

            {/* Kilometerstand Section */}
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                📊 Kilometerstand
              </h3>
              {kilometerstaendeField && (
                <MotorTable
                  value={fieldValues[kilometerstaendeField.key] as TableRow[]}
                  onChange={(value) => handleFieldChange(kilometerstaendeField.key, value)}
                  label={kilometerstaendeField.label}
                  columns={kilometerstaendeField.table?.columns || []}
                  addButtonText={kilometerstaendeField.table?.addButtonText}
                  emptyText={kilometerstaendeField.table?.emptyText}
                />
              )}
            </div>

            {/* Zubehör Section */}
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
                🔧 Zubehör
              </h3>
              {zubehoerField && (
                <MotorTable
                  value={fieldValues[zubehoerField.key] as TableRow[]}
                  onChange={(value) => handleFieldChange(zubehoerField.key, value)}
                  label={zubehoerField.label}
                  columns={zubehoerField.table?.columns || []}
                  addButtonText={zubehoerField.table?.addButtonText}
                  emptyText={zubehoerField.table?.emptyText}
                />
              )}
            </div>

            {/* Typ- und Regionalklasse Section (nur Anzeige) */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                📋 Typ- und Regionalklasse
                <Info className="w-4 h-4 text-gray-500" />
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">
                        Typ- und Regionalklasse
                      </th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700 border-b">
                        Haftpflicht
                      </th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700 border-b">
                        Vollkasko
                      </th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700 border-b">
                        Teilkasko
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {typRegionalklasseData.map((row, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2 text-sm text-gray-900 border-b">
                          {row.typ}
                        </td>
                        <td className="px-4 py-2 text-sm text-center text-gray-900 border-b">
                          {row.haftpflicht}
                        </td>
                        <td className="px-4 py-2 text-sm text-center text-gray-900 border-b">
                          {row.vollkasko}
                        </td>
                        <td className="px-4 py-2 text-sm text-center text-gray-900 border-b">
                          {row.teilkasko}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Manuelle Typklasse Section */}
            <div className="bg-orange-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center gap-2">
                ⚙️ Manuelle Typklasse
              </h3>
              {manuelleTypklasseField && (
                <MotorTable
                  value={fieldValues[manuelleTypklasseField.key] as TableRow[]}
                  onChange={(value) => handleFieldChange(manuelleTypklasseField.key, value)}
                  label={manuelleTypklasseField.label}
                  columns={manuelleTypklasseField.table?.columns || []}
                  emptyText={manuelleTypklasseField.table?.emptyText}
                  fieldType={manuelleTypklasseField.type}
                />
              )}
            </div>
          </div>
        </section>
      </div>
    </PageTemplate>
  );
}