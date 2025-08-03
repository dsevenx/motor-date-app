"use client"

import React, { useState, useEffect } from 'react';
import { Database, Eye, User, MessageSquare, Code, Download, FileText, Settings } from 'lucide-react';
import { FIELD_DEFINITIONS, generateEchteEingabeValues } from '@/constants/fieldConfig';
import { ServiceABSEinarbeiterHelper } from '@/utils/ServiceABSEinarbeiterHelper';
import { PageTemplate } from '@/components/PageTemplate';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

export default function KbThPage() {
  const echteEingabeValues = generateEchteEingabeValues();
  const [showXmlDetails, setShowXmlDetails] = useState(false);

  // Formatiere Werte für die Anzeige
  const formatDisplayValue = (field: any, value: any) => {
    if (!value || (typeof value === 'string' && (value === '' || value === '0001-01-01'))) {
      return 'Nicht gesetzt';
    }

    if (field.type === 'tristate') {
      return value === 'J' ? 'Ja' : value === 'N' ? 'Nein' : 'Nicht gesetzt';
    }

    if (field.type === 'date') {
      if (value && value !== '0001-01-01') {
        try {
          return new Date(value).toLocaleDateString('de-DE');
        } catch {
          return String(value);
        }
      }
      return 'Nicht gesetzt';
    }

    if (field.type === 'number') {
      if (value && value !== 0) {
        if (field.validation?.numberFormat === 'currency') {
          return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR'
          }).format(value);
        } else {
          return value.toLocaleString('de-DE');
        }
      }
      return 'Nicht gesetzt';
    }

    if (field.type === 'table' || field.type === 'single-line-table') {
      return Array.isArray(value) ? `${value.length} Einträge` : '0 Einträge';
    }

    return String(value);
  };

  // Bestimme Eingabequelle basierend auf Vergleich defaultValue vs echteEingabe
  const getInputSource = (field: any) => {
    const echteEingabe = field.echteEingabe;
    const defaultValue = field.defaultValue;
    
    // Wenn echteEingabe nicht gesetzt oder gleich defaultValue, dann noch keine echte Eingabe
    if (!echteEingabe || echteEingabe === defaultValue) {
      return { source: 'Noch keine Eingabe', icon: Eye, color: 'text-gray-500' };
    }
    
    // Wenn echteEingabe != defaultValue, dann User-Eingabe
    return { source: 'Benutzer-Eingabe', icon: User, color: 'text-blue-600' };
  };

  // Filtere verschiedene Feldtypen
  const dateFields = FIELD_DEFINITIONS.filter(field => field.type === 'date');
  const textFields = FIELD_DEFINITIONS.filter(field => field.type === 'text');
  const numberFields = FIELD_DEFINITIONS.filter(field => field.type === 'number');
  const tristateFields = FIELD_DEFINITIONS.filter(field => field.type === 'tristate');
  const dropdownFields = FIELD_DEFINITIONS.filter(field => field.type === 'dropdown');
  const tableFields = FIELD_DEFINITIONS.filter(field => field.type === 'table' || field.type === 'single-line-table');

  // Funktion für Tabellen-Detail-Anzeige
  const renderTableDetails = (field: any, tableData: any[]) => {
    if (!Array.isArray(tableData) || tableData.length === 0) {
      return <div className="text-gray-500 text-sm">Keine Daten vorhanden</div>;
    }

    return (
      <div className="space-y-2">
        {tableData.map((row, index) => (
          <div key={row.id || index} className="bg-gray-50 rounded p-2 text-sm">
            <div className="font-medium text-gray-700 mb-1">Zeile {index + 1}:</div>
            <div className="grid grid-cols-2 gap-2">
              {field.table?.columns?.map((col: any) => (
                <div key={col.key} className="flex justify-between">
                  <span className="text-gray-600">{col.label}:</span>
                  <span className="font-medium">{row[col.key] || 'Nicht gesetzt'}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };


  // Echte Eingaben Content
  const renderEchteEingabenContent = () => (
    <div className="space-y-8">
        {/* Datums-Felder */}
        {dateFields.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              📅 Termine und Daten
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {dateFields.map(field => {
                const inputInfo = getInputSource(field);
                const IconComponent = inputInfo.icon;
                return (
                  <div key={field.key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <span className="font-medium text-gray-700">{field.label}:</span>
                      <span className="ml-2 text-gray-600">
                        {formatDisplayValue(field, echteEingabeValues[field.key])}
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 ${inputInfo.color}`}>
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm">{inputInfo.source}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Text-Felder */}
        {textFields.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              🚗 Fahrzeugdaten (Text)
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {textFields.map(field => {
                const inputInfo = getInputSource(field);
                const IconComponent = inputInfo.icon;
                return (
                  <div key={field.key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <span className="font-medium text-gray-700">{field.label}:</span>
                      <span className="ml-2 text-gray-600">
                        {formatDisplayValue(field, echteEingabeValues[field.key])}
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 ${inputInfo.color}`}>
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm">{inputInfo.source}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Zahl-Felder */}
        {numberFields.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              🔢 Zahlenwerte
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {numberFields.map(field => {
                const inputInfo = getInputSource(field);
                const IconComponent = inputInfo.icon;
                return (
                  <div key={field.key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <span className="font-medium text-gray-700">{field.label}:</span>
                      <span className="ml-2 text-gray-600">
                        {formatDisplayValue(field, echteEingabeValues[field.key])}
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 ${inputInfo.color}`}>
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm">{inputInfo.source}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TriState-Felder */}
        {tristateFields.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              ☑️ Ja/Nein Optionen
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {tristateFields.map(field => {
                const inputInfo = getInputSource(field);
                const IconComponent = inputInfo.icon;
                return (
                  <div key={field.key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <span className="font-medium text-gray-700">{field.label}:</span>
                      <span className="ml-2 text-gray-600">
                        {formatDisplayValue(field, echteEingabeValues[field.key])}
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 ${inputInfo.color}`}>
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm">{inputInfo.source}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DropDown-Felder */}
        {dropdownFields.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              📋 Auswahl-Felder
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {dropdownFields.map(field => {
                const inputInfo = getInputSource(field);
                const IconComponent = inputInfo.icon;
                return (
                  <div key={field.key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <span className="font-medium text-gray-700">{field.label}:</span>
                      <span className="ml-2 text-gray-600">
                        {formatDisplayValue(field, echteEingabeValues[field.key])}
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 ${inputInfo.color}`}>
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm">{inputInfo.source}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tabellen-Felder */}
        {tableFields.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              📊 Tabellendaten (zeilenweise)
            </h3>
            <div className="space-y-6">
              {tableFields.map(field => {
                const inputInfo = getInputSource(field);
                const IconComponent = inputInfo.icon;
                const tableData = echteEingabeValues[field.key];
                return (
                  <div key={field.key} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-gray-700">{field.label}</h4>
                      <div className={`flex items-center gap-2 ${inputInfo.color}`}>
                        <IconComponent className="w-4 h-4" />
                        <span className="text-sm">{inputInfo.source}</span>
                      </div>
                    </div>
                    {renderTableDetails(field, tableData)}
                  </div>
                );
              })}
            </div>
          </div>
        )}
    </div>
  );

  // ServiceABSEinarbeiter Content  
  const renderServiceABSContent = () => (
    <div className="space-y-8">
        {/* XML-Generierung für ServiceABSEinarbeiter */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            📤 ServiceABSEinarbeiter XML
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Code className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-700">SOAP XML für Persistierung</span>
              </div>
              <button
                onClick={() => setShowXmlDetails(!showXmlDetails)}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                {showXmlDetails ? 'XML verbergen' : 'XML anzeigen'}
              </button>
            </div>

            {/* XML-Statistiken */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded p-3">
                <div className="text-sm text-gray-600">Eingegbene Felder</div>
                <div className="text-lg font-semibold text-blue-600">
                  {ServiceABSEinarbeiterHelper.zaehleEingegebeneFelder(echteEingabeValues)}
                </div>
              </div>
              <div className="bg-white rounded p-3">
                <div className="text-sm text-gray-600">XML-Größe</div>
                <div className="text-lg font-semibold text-green-600">
                  {Math.round(ServiceABSEinarbeiterHelper.erzeugeSendeXML(echteEingabeValues).length / 1024 * 100) / 100} KB
                </div>
              </div>
              <div className="bg-white rounded p-3">
                <div className="text-sm text-gray-600">Status</div>
                <div className="text-lg font-semibold text-purple-600">
                  {ServiceABSEinarbeiterHelper.zaehleEingegebeneFelder(echteEingabeValues) > 0 ? 'Bereit' : 'Keine Daten'}
                </div>
              </div>
            </div>

            {/* Zusammenfassung der zu sendenden Daten */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Zu sendende Daten:</h4>
              <div className="bg-white rounded p-3 max-h-32 overflow-y-auto">
                {ServiceABSEinarbeiterHelper.erstelleZusammenfassung(echteEingabeValues).length > 0 ? (
                  <ul className="text-sm space-y-1">
                    {ServiceABSEinarbeiterHelper.erstelleZusammenfassung(echteEingabeValues).map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-500 text-sm">Keine echten Eingaben vorhanden</div>
                )}
              </div>
            </div>

            {/* XML-Anzeige */}
            {showXmlDetails && (
              <div className="bg-white rounded border">
                <div className="flex items-center justify-between p-3 border-b bg-gray-50">
                  <span className="font-medium text-gray-700">Generiertes SOAP XML</span>
                  <button
                    onClick={() => {
                      const xml = ServiceABSEinarbeiterHelper.erzeugeSendeXML(echteEingabeValues);
                      navigator.clipboard.writeText(xml);
                      alert('XML in Zwischenablage kopiert!');
                    }}
                    className="flex items-center gap-2 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Download className="w-3 h-3" />
                    Kopieren
                  </button>
                </div>
                <div className="p-4">
                  <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto max-h-96 overflow-y-auto">
                    <code className="text-gray-800">
                      {ServiceABSEinarbeiterHelper.formatXML(
                        ServiceABSEinarbeiterHelper.erzeugeSendeXML(echteEingabeValues)
                      )}
                    </code>
                  </pre>
                </div>
              </div>
            )}

            {/* Hinweise */}
            <div className="mt-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
              <div className="text-sm text-blue-800">
                <strong>Hinweis:</strong> Dieses XML wird an den ServiceABSEinarbeiter SOAP-WebService gesendet, 
                wenn im EditModus gespeichert wird. Es enthält nur Felder mit echten Benutzereingaben.
              </div>
            </div>
          </div>
        </div>
    </div>
  );

  return (
    <PageTemplate title="KB-TH: Diagnose & Persistierung" enableSectionNavigation>
      <div className="space-y-8">
        <section id="echte-eingaben">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Echte Eingaben
          </h2>
          <p className="text-gray-600 mb-6">
            Übersicht aller erfassten Benutzereingaben und deren Datenquellen
          </p>
          {renderEchteEingabenContent()}
        </section>
        
        <section id="service-abs">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Code className="w-5 h-5" />
            ServiceABSEinarbeiter
          </h2>
          <p className="text-gray-600 mb-6">
            XML-Generierung für SOAP-Service und Persistierung
          </p>
          {renderServiceABSContent()}
        </section>
      </div>
    </PageTemplate>
  );
}