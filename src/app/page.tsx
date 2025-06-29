"use client"

import { Car } from 'lucide-react';
import { useState } from 'react';
import { MotorDate } from '@/components/MotorDate';
import { ChatComponent } from '@/components/ChatComponent';

// Main Page Component
const Page: React.FC = () => {
  const [beginndatum, setBeginnDatum] = useState<string>('0001-01-01');
  const [ablaufdatum, setAblaufDatum] = useState<string>('0001-01-01');
  const [erstzulassungsdatum, setErstzulassungsDatum] = useState<string>('0001-01-01');
  const [anmeldedatum, setAnmeldeDatum] = useState<string>('0001-01-01');

  const handleReset = () => {
    setBeginnDatum('');
    setAblaufDatum('');
    setErstzulassungsDatum('');
    setAnmeldeDatum('');
  };

  const handleUpdateVehicleData = (field: 'beginndatum' | 'ablaufdatum' | 'erstzulassungsdatum' | 'anmeldedatum', value: string) => {
    switch (field) {
      case 'beginndatum':
        setBeginnDatum(value);
        break;
      case 'ablaufdatum':
        setAblaufDatum(value);
        break;
      case 'erstzulassungsdatum':
        setErstzulassungsDatum(value);
        break;
      case 'anmeldedatum':
        setAnmeldeDatum(value);
        break;
    }
  };

  // Field Configs für Chat-Komponente
  const fieldConfigs = [
    {
      fieldKey: 'beginndatum',
      label: 'Beginndatum',
      synonyms: ['beginndatum', 'startdatum', 'anfangsdatum', 'ab wann', 'von wann', 'vertragsbeginn', 'versicherungsbeginn', 'gültigkeitsbeginn'],
      currentValue: beginndatum,
      onChange: (value: string) => setBeginnDatum(value)
    },
    {
      fieldKey: 'ablaufdatum', 
      label: 'Ablaufdatum',
      synonyms: ['ablaufdatum', 'enddatum', 'gültigkeitsende', 'bis wann', 'vertragsende', 'versicherungsende', 'läuft ab', 'endet', 'frist'],
      currentValue: ablaufdatum,
      onChange: (value: string) => setAblaufDatum(value)
    },
    {
      fieldKey: 'erstzulassungsdatum',
      label: 'Erstzulassungsdatum', 
      synonyms: ['erstzulassung', 'erstmals zugelassen', 'zulassung', 'neuzulassung', 'zum ersten mal angemeldet', 'fahrzeug ist von'],
      currentValue: erstzulassungsdatum,
      onChange: (value: string) => setErstzulassungsDatum(value)
    },
    {
      fieldKey: 'anmeldedatum',
      label: 'Anmeldedatum',
      synonyms: ['anmeldedatum', 'gekauft', 'erworben', 'auto gekauft', 'fahrzeug gekauft', 'kauf', 'kaufdatum', 'übernommen', 'angemeldet'],
      currentValue: anmeldedatum,
      onChange: (value: string) => setAnmeldeDatum(value)
    }
  ];

  const handleSetToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setBeginnDatum(today);
    setAblaufDatum(today);
    setErstzulassungsDatum(today);
    setAnmeldeDatum(today);
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <MotorDate
                  value={beginndatum}
                  onChange={setBeginnDatum}
                  label="Beginndatum"
                  valueText4KiModell="Beginndatum, Startdatum, Anfangsdatum, ab wann, von wann, Vertragsbeginn, Versicherungsbeginn, Gültigkeitsbeginn"
                />

                <MotorDate
                  value={ablaufdatum}
                  onChange={setAblaufDatum}
                  label="Ablaufdatum"
                  valueText4KiModell="Ablaufdatum, Enddatum, Gültigkeitsende, bis wann, Vertragsende, Versicherungsende, läuft ab, endet, Frist"
                />

                <MotorDate
                  value={erstzulassungsdatum}
                  onChange={setErstzulassungsDatum}
                  label="Erstzulassungsdatum"
                  valueText4KiModell="Erstzulassung, erstmals zugelassen, Zulassung, Neuzulassung, zum ersten Mal angemeldet, Fahrzeug ist von"
                  // disabled={true} // Beispiel für deaktiviertes Feld
                />

                <MotorDate
                  value={anmeldedatum}
                  onChange={setAnmeldeDatum}
                  label="Anmeldedatum"
                  valueText4KiModell="Anmeldedatum, gekauft, erworben, Auto gekauft, Fahrzeug gekauft, Kauf, Kaufdatum, übernommen, angemeldet"
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Aktuelle Werte:
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Beginndatum:</span>
                    <span className="text-gray-600">{beginndatum || 'Nicht gesetzt'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Ablaufdatum:</span>
                    <span className="text-gray-600">{ablaufdatum || 'Nicht gesetzt'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Erstzulassungsdatum:</span>
                    <span className="text-gray-600">{erstzulassungsdatum || 'Nicht gesetzt'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Anmeldedatum:</span>
                    <span className="text-gray-600">{anmeldedatum || 'Nicht gesetzt'}</span>
                  </div>
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
                Beispiel mit deaktiviertem Feld:
              </h3>
              <MotorDate
                value="2020-01-01"
                onChange={() => { }} // Dummy-Funktion für deaktiviertes Feld
                label="Deaktiviertes Datum"
                disabled={true}
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