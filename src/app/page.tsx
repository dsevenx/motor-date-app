"use client"

import { Car } from 'lucide-react';
import { useState, useMemo } from 'react';
import { MotorDate } from '@/components/MotorDate';
import { MotorEditText } from '@/components/MotorEditText';
import { MotorEditNumber } from '@/components/MotorEditNumber';
import { ChatComponent } from '@/components/ChatComponent';
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

              {/* Dynamische Feld-Generierung */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {FIELD_DEFINITIONS.map(field => {
                  if (field.type === 'date') {
                    return (
                      <MotorDate
                        key={field.key}
                        value={fieldValues[field.key] as string}
                        onChange={(value) => handleUpdateVehicleData(field.key, value)}
                        label={field.label}
                        disabled={field.ui?.disabled}
                      />
                    );
                  } else if (field.type === 'text') {
                    return (
                      <MotorEditText
                        key={field.key}
                        value={fieldValues[field.key] as string}
                        onChange={(value) => handleUpdateVehicleData(field.key, value)}
                        label={field.label}
                        placeholder={field.ui?.placeholder}
                        disabled={field.ui?.disabled}
                        maxLength={field.validation?.maxLength}
                      />
                    );
                  } else if (field.type === 'number') {
                    return (
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
                    );
                  }
                  return null;
                })}
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Aktuelle Werte:
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  {FIELD_DEFINITIONS.map(field => (
                    <div key={field.key} className="flex justify-between">
                      <span className="font-medium">{field.label}:</span>
                      <span className="text-gray-600">
                        {fieldValues[field.key] || 'Nicht gesetzt'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200"
                >
                  Zurücksetzen
                </button>
                <button
                  onClick={handleSetToday}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Heute setzen
                </button>
              </div>
            </div>

            {/* Beispiel mit deaktiviertem Feld */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Beispiel mit deaktivierten Feldern:
              </h3>
              <div className="space-y-4">
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
              </div>
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