"use client"

import { Car } from 'lucide-react';
import { useState, useMemo } from 'react';
import { MotorDate } from '@/components/MotorDate';
import { MotorEditText } from '@/components/MotorEditText';
import { MotorEditNumber } from '@/components/MotorEditNumber';
import { MotorCheckBox } from '@/components/MotorCheckBox';
import { MotorDropDown } from '@/components/MotorDropDown';
import { MotorTable } from '@/components/MotorTable';
import { ChatComponent } from '@/components/ChatComponent';
import { MotorProduktSpartenTree } from '@/components/MotorProduktSpartenTree';
import { 
  FIELD_DEFINITIONS, 
  generateDefaultValues, 
  generateFieldConfigs,
  getFieldsByType 
} from '@/constants/fieldConfig';

// Main Page Component
const Page: React.FC = () => {
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

  // Field Configs für Chat-Komponente (dynamisch generiert)
  const fieldConfigs = useMemo(() => 
    generateFieldConfigs(fieldValues, setters), 
    [fieldValues, setters]
  );

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
  const tableFields = FIELD_DEFINITIONS.filter(field => field.type === 'table');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left Column - Fahrzeug Datenverwaltung */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
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
              <div className="space-y-8">
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
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b border-gray-200 pb-2">
                    📊 Detaildaten
                  </h3>
                  <div className="space-y-8">
                    {tableFields.map(field => (
                      <div key={field.key} className="bg-gray-50 rounded-lg p-6">
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
              <div className="border-t pt-6 mt-8">
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
              <div className="flex gap-4 mt-6">
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
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                🔒 Beispiel: Deaktivierte Felder
              </h3>
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

            {/* Produktsparten-Baum Sektion */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                🏗️ Produktsparten-Baum (Demo)
              </h3>
              <MotorProduktSpartenTree
                fieldDefinitions={fieldValues}
                onFieldDefinitionsChange={(updates) => {
                  console.log('🔄 FIELD_DEFINITIONS Update von MotorProduktSpartenTree:', updates);
                  setFieldValues(prev => ({ ...prev, ...updates }));
                }}
              />
            </div>
          </div>

          {/* Right Column - Chat Component */}
          <div className="lg:col-span-1">
            <div className="h-full min-h-[700px]">
              <ChatComponent
                fieldConfigs={fieldConfigs}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;