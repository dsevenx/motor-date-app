"use client"

import React from 'react';
import { Database, Eye, User, MessageSquare } from 'lucide-react';
import { FIELD_DEFINITIONS, generateEchteEingabeValues } from '@/constants/fieldConfig';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

export default function KbThPage() {
  const echteEingabeValues = generateEchteEingabeValues();

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

    if (field.type === 'table') {
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
  const tableFields = FIELD_DEFINITIONS.filter(field => field.type === 'table');

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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Database className="w-8 h-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-800">
            KB-TH: Echte Eingaben
          </h1>
        </div>
        <p className="text-gray-600">
          Übersicht aller erfassten Benutzereingaben und deren Datenquellen
        </p>
      </div>

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
    </div>
  );
}