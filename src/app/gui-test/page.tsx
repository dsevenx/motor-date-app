"use client"

import { Car } from 'lucide-react';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { MotorDate } from '@/components/MotorDate';
import { MotorEditText } from '@/components/MotorEditText';
import { MotorEditNumber } from '@/components/MotorEditNumber';
import { MotorCheckBox } from '@/components/MotorCheckBox';
import { MotorButton } from '@/components/MotorButton';
import { MotorDropDown } from '@/components/MotorDropDown';
import { MotorTable } from '@/components/MotorTable';
import { setGlobalChatConfig } from '@/hooks/useGlobalChatConfig';
import { 
  FIELD_DEFINITIONS, 
  generateDefaultValues, 
  generateFieldConfigs,
  getFieldsByType 
} from '@/constants/fieldConfig';
import { processSpartenActions, processBausteinActions } from '@/utils/fieldDefinitionsHelper';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

// GUI Test Page Component
const GuiTestPage: React.FC = () => {
  // Generiere State und Setter basierend auf der Konfiguration
  const defaultValues = useMemo(() => generateDefaultValues(), []);
  const [fieldValues, setFieldValues] = useState(defaultValues);

  // Generiere individuelle Setter für jedes Feld
  const setters = useMemo(() => {
    return FIELD_DEFINITIONS.reduce((acc, field) => {
      acc[field.key] = (value: any) => {
        setFieldValues(prev => ({
          ...prev,
          [field.key]: value
        }));
      };
      return acc;
    }, {} as Record<string, (value: any) => void>);
  }, []);

  const handleReset = () => {
    setFieldValues(generateDefaultValues());
  };

  const handleUpdateVehicleData = (field: string, value: any) => {
    setFieldValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handler für Sparten-Updates
  const handleFieldDefinitionsChange = useCallback((updates: Record<string, any>) => {
    console.log('🔄 Empfange Updates in gui-test page:', updates);
    
    let allUpdates: Record<string, any> = {};
    
    // Verarbeite spartenActions
    if (updates.spartenActions) {
      console.log('🔄 Verarbeite spartenActions mit fieldDefinitionsHelper');
      const spartenUpdates = processSpartenActions(updates.spartenActions, fieldValues);
      Object.assign(allUpdates, spartenUpdates);
    }
    
    // Verarbeite bausteinActions
    if (updates.bausteinActions) {
      console.log('🔄 Verarbeite bausteinActions mit fieldDefinitionsHelper');
      const bausteinUpdates = processBausteinActions(updates.bausteinActions, fieldValues);
      Object.assign(allUpdates, bausteinUpdates);
    }
    
    // Verarbeite normale Updates
    if (!updates.spartenActions && !updates.bausteinActions) {
      allUpdates = updates;
    }
    
    // Alle Updates anwenden
    if (Object.keys(allUpdates).length > 0) {
      setFieldValues(prev => ({ ...prev, ...allUpdates }));
    }
  }, [fieldValues]);

  // Field Configs für Chat-Komponente (dynamisch generiert)
  const fieldConfigs = useMemo(() => 
    generateFieldConfigs(fieldValues, setters, handleFieldDefinitionsChange), 
    [fieldValues, setters, handleFieldDefinitionsChange]
  );

  // Setze die GUI-Test fieldConfigs als globale Chat-Konfiguration
  useEffect(() => {
    setGlobalChatConfig(fieldConfigs);
    
    // Cleanup: Entferne globale Config wenn Komponente unmounted wird
    return () => {
      setGlobalChatConfig(null);
    };
  }, [fieldConfigs]);

  const handleSetToday = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayValues = { ...fieldValues };
    
    // Nur Datumsfelder auf heute setzen
    getFieldsByType('date').forEach(field => {
      todayValues[field.key] = today;
    });
    
    setFieldValues(todayValues);
  };

  // Filtere Felder nach Typ für bessere Organisation
  const dateFields = FIELD_DEFINITIONS.filter(field => field.type === 'date');
  const textFields = FIELD_DEFINITIONS.filter(field => field.type === 'text');
  const numberFields = FIELD_DEFINITIONS.filter(field => field.type === 'number');
  const tristateFields = FIELD_DEFINITIONS.filter(field => field.type === 'tristate');
  const dropdownFields = FIELD_DEFINITIONS.filter(field => field.type === 'dropdown');
  // Filtere Sparten- und Baustein-Tabellen aus, da diese über MotorProduktSpartenTree verwaltet werden
  const tableFields = FIELD_DEFINITIONS.filter(field => 
    field.type === 'table' && 
    field.key !== 'produktSparten' && 
    !field.key.startsWith('produktBausteine_')
  );

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Car className="w-8 h-8 text-blue-600" />
                  <h1 className="text-3xl font-bold text-gray-800">
                    Fahrzeug Datenverwaltung
                  </h1>
                </div>
                <p className="text-gray-600">
                  Verwalten Sie wichtige Fahrzeugdaten und Termine
                </p>
              </div>

              {/* Basis-Felder in Grid-Layout */}
              <div className="space-y-4">
                {/* Datums-Felder */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                    📅 Termine und Daten
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dateFields.map(field => (
                      <MotorDate
                        key={field.key}
                        value={fieldValues[field.key] as string}
                        onChange={(value) => handleUpdateVehicleData(field.key, value)}
                        label={field.label}
                        fieldKey={field.key}
                        disabled={field.ui?.disabled}
                      />
                    ))}
                  </div>
                </div>

                {/* Text- und Zahlfelder */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                    🚗 Fahrzeugdaten
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {textFields.map(field => (
                      <MotorEditText
                        key={field.key}
                        value={fieldValues[field.key] as string}
                        onChange={(value) => handleUpdateVehicleData(field.key, value)}
                        label={field.label}
                        fieldKey={field.key}
                        placeholder={field.ui?.placeholder}
                        disabled={field.ui?.disabled}
                        maxLength={field.validation?.maxLength}
                      />
                    ))}
                    {numberFields.map(field => (
                      <MotorEditNumber
                        key={field.key}
                        value={fieldValues[field.key] as number}
                        onChange={(value) => handleUpdateVehicleData(field.key, value)}
                        label={field.label}
                        fieldKey={field.key}
                        placeholder={field.ui?.placeholder}
                        disabled={field.ui?.disabled}
                        min={field.validation?.min as number}
                        max={field.validation?.max as number}
                        format={field.validation?.numberFormat}
                      />
                    ))}
                  </div>
                </div>

                {/* TriState-Felder */}
                {tristateFields.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                      ☑️ Ja/Nein Optionen
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tristateFields.map(field => (
                        <MotorCheckBox
                          key={field.key}
                          value={fieldValues[field.key] as 'J' | 'N' | ' '}
                          onChange={(value) => handleUpdateVehicleData(field.key, value)}
                          label={field.label}
                          fieldKey={field.key}
                          disabled={field.ui?.disabled}
                          infoText={field.ui?.infoText}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* DropDown-Felder */}
                {dropdownFields.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                      📋 Auswahl-Felder
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dropdownFields.map(field => (
                        <MotorDropDown
                          key={field.key}
                          value={fieldValues[field.key] as string}
                          onChange={(value) => handleUpdateVehicleData(field.key, value)}
                          label={field.label}
                          disabled={field.ui?.disabled}
                          domainId={field.dropdown?.domainId || ''}
                          placeholder={field.ui?.placeholder || 'Bitte auswählen...'}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tabellen-Sektion */}
              {tableFields.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                    📊 Detaildaten
                  </h3>
                  <div className="space-y-4">
                    {tableFields.map(field => (
                      <div key={field.key} className="bg-gray-50 rounded-lg p-4">
                        <MotorTable
                          value={fieldValues[field.key] as any[]}
                          onChange={(value) => handleUpdateVehicleData(field.key, value)}
                          label={field.label}
                          columns={field.table?.columns || []}
                          addButtonText={field.table?.addButtonText}
                          emptyText={field.table?.emptyText}
                          disabled={field.ui?.disabled}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Aktuelle Werte Übersicht */}
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    📈 Aktuelle Werte:
                  </h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm max-h-64 overflow-y-auto">
                  {FIELD_DEFINITIONS.map(field => {
                    let displayValue = 'Nicht gesetzt';
                    
                    if (field.type === 'tristate') {
                      displayValue = fieldValues[field.key] === 'J' ? 'Ja' 
                        : fieldValues[field.key] === 'N' ? 'Nein' 
                        : 'Nicht gesetzt';
                    } else if (field.type === 'table') {
                      const tableData = fieldValues[field.key];
                      displayValue = Array.isArray(tableData) ? `${tableData.length} Einträge` : '0 Einträge';
                    } else if (field.type === 'date') {
                      const dateValue = fieldValues[field.key];
                      if (dateValue && dateValue !== '0001-01-01') {
                        try {
                          displayValue = new Date(dateValue).toLocaleDateString('de-DE');
                        } catch {
                          displayValue = String(dateValue);
                        }
                      }
                    } else if (field.type === 'number') {
                      const numValue = fieldValues[field.key];
                      if (numValue && numValue !== 0) {
                        if (field.validation?.numberFormat === 'currency') {
                          displayValue = new Intl.NumberFormat('de-DE', {
                            style: 'currency',
                            currency: 'EUR'
                          }).format(numValue);
                        } else {
                          displayValue = numValue.toLocaleString('de-DE');
                        }
                      }
                    } else {
                      displayValue = fieldValues[field.key] || 'Nicht gesetzt';
                    }

                    return (
                      <div key={field.key} className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">{field.label}:</span>
                        <span className={`text-gray-600 ${
                          field.type === 'table' && Array.isArray(fieldValues[field.key]) && fieldValues[field.key].length > 0
                            ? 'font-medium text-blue-600'
                            : ''
                        }`}>
                          {displayValue}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 font-medium"
                >
                  🔄 Zurücksetzen
                </button>
                <button
                  onClick={handleSetToday}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  📅 Heute setzen
                </button>
              </div>
            </div>

            {/* Beispiel-Sektion mit deaktivierten Feldern */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                🔒 Beispiel: Deaktivierte Felder & MotorButton
              </h3>
              
              {/* MotorButton Beispiele */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-700 mb-3">MotorButton (basierend auf Screenshots):</h4>
                <div className="flex flex-wrap gap-3">
                  <MotorButton onClick={() => alert('Normal Primary')} variant="primary" size="medium">
                    PRIMARY
                  </MotorButton>
                  <MotorButton onClick={() => {}} variant="primary" disabled>
                    DISABLED
                  </MotorButton>
                  <MotorButton onClick={() => alert('Secondary Button')} variant="secondary" size="medium">
                    Secondary
                  </MotorButton>
                  <MotorButton onClick={() => alert('Mit Icon')} variant="primary" size="small">
                    Mit Icon
                  </MotorButton>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MotorDate
                  value="2020-01-01"
                  onChange={() => { }} // Dummy-Funktion für deaktiviertes Feld
                  label="Deaktiviertes Datum"
                  disabled={true}
                />
                <MotorEditText
                  value="BMW X5"
                  onChange={() => { }}
                  label="Deaktiviertes Textfeld"
                  disabled={true}
                />
                <MotorEditNumber
                  value={25000}
                  onChange={() => { }}
                  label="Deaktiviertes Zahlenfeld"
                  disabled={true}
                />
                <MotorCheckBox
                  value="J"
                  onChange={() => { }}
                  label="Deaktivierte Checkbox"
                  disabled={true}
                  infoText="Dies ist eine deaktivierte Checkbox"
                />
                <MotorDropDown
                  value="E"
                  onChange={() => { }}
                  label="Deaktiviertes Dropdown"
                  disabled={true}
                  domainId="KraftBoGruppeMoeglFahrerkreis"
                  placeholder="Deaktiviert..."
                />
              </div>
              
              {/* Beispiel für deaktivierte Tabelle */}
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <MotorTable
                  value={[
                    { id: '1', datum: '2024-01-01', art: 'V', kmstand: 15000 },
                    { id: '2', datum: '2024-06-01', art: 'H', kmstand: 22000 }
                  ]}
                  onChange={() => { }}
                  label="Deaktivierte Tabelle (Beispieldaten)"
                  columns={[
                    { key: 'datum', label: 'Datum', type: 'date', width: '200px' },
                    { key: 'art', label: 'Art', type: 'text', width: '200px' },
                    { key: 'kmstand', label: 'KM-Stand', type: 'number', width: '150px' }
                  ]}
                  disabled={true}
                  emptyText="Keine Daten"
                  addButtonText="Hinzufügen (deaktiviert)"
                />
              </div>
            </div>
    </>
  );
};

export default GuiTestPage;