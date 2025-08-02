"use client"

import React, { useState } from 'react';
import { Plus, Trash2, Table } from 'lucide-react';
import { MotorDate } from './MotorDate';
import { MotorEditText } from './MotorEditText';
import { MotorEditNumber } from './MotorEditNumber';
import { MotorCheckBox } from './MotorCheckBox';
import { MotorDropDown } from './MotorDropDown';
import { TableRow, TableColumn, FieldType } from '@/constants/fieldConfig';
import { useEditMode } from '@/contexts/EditModeContext';

export interface MotorTableProps {
  value: TableRow[];
  onChange: (value: TableRow[]) => void;
  label: string;
  columns: TableColumn[];
  addButtonText?: string;
  emptyText?: string;
  disabled?: boolean;
  maxRows?: number; // Maximale Anzahl von Zeilen
  einzeiligeTabelle?: boolean; // Keine Aktionen-Spalte und kein maxRows Hinweis
}

export const MotorTable: React.FC<MotorTableProps> = ({
  value = [],
  onChange,
  label,
  columns,
  addButtonText = 'Zeile hinzufügen',
  emptyText = 'Keine Daten vorhanden',
  disabled = false,
  maxRows,
  einzeiligeTabelle = false
}) => {
  const { isEditMode } = useEditMode();
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  // Stelle sicher, dass value immer ein Array ist
  const safeValue = Array.isArray(value) ? value : [];
  

  // Neue Zeile erstellen
  const createNewRow = (): TableRow => {
    const newRow: TableRow = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };
    
    columns.forEach(column => {
      switch (column.type) {
        case 'date':
          newRow[column.key] = '0001-01-01';
          break;
        case 'number':
          newRow[column.key] = 0;
          break;
        case 'boolean':
          newRow[column.key] = false;
          break;
        case 'tristate':
          newRow[column.key] = ' ';
          break;
        case 'text':
        case 'select':
        case 'dropdown':
        default:
          newRow[column.key] = '';
          break;
      }
    });
    
    return newRow;
  };

  // Zeile hinzufügen
  const addRow = () => {
    if (disabled) return;
    if (maxRows && safeValue.length >= maxRows) return; // Verhindere Hinzufügen wenn maxRows erreicht
    const newRow = createNewRow();
    onChange([...safeValue, newRow]);
  };

  // Zeile löschen
  const deleteRow = (rowId: string) => {
    if (disabled) return;
    onChange(safeValue.filter(row => row.id !== rowId));
  };

  // Zellenwert aktualisieren
  const updateCell = (rowId: string, columnKey: string, newValue: any) => {
    if (disabled) return;
    const updatedRows = safeValue.map(row => 
      row.id === rowId 
        ? { ...row, [columnKey]: newValue }
        : row
    );
    onChange(updatedRows);
  };

  // Render-Funktion für verschiedene Zelltypen
  const renderCell = (row: TableRow, column: TableColumn) => {
    const cellValue = row[column.key];
    const cellId = `${row.id}-${column.key}`;

    switch (column.type) {
      case 'date':
        return (
          <MotorDate
            key={cellId}
            value={cellValue as string}
            onChange={(newValue) => updateCell(row.id, column.key, newValue)}
            label=""
            disabled={disabled}
            hideLabel={true}
            allowInViewMode={false}
          />
        );

      case 'text':
        return (
          <MotorEditText
            key={cellId}
            value={cellValue as string}
            onChange={(newValue) => updateCell(row.id, column.key, newValue)}
            label=""
            placeholder={column.ui?.placeholder}
            disabled={disabled}
            maxLength={column.validation?.maxLength}
            hideLabel={true}
          />
        );

      case 'number':
        return (
          <MotorEditNumber
            key={cellId}
            value={cellValue as number}
            onChange={(newValue) => updateCell(row.id, column.key, newValue)}
            label=""
            disabled={disabled}
            min={column.validation?.min as number}
            max={column.validation?.max as number}
            format={column.validation?.numberFormat}
            hideLabel={true}
          />
        );

      case 'boolean':
      case 'tristate':
        return (
          <MotorCheckBox
            key={cellId}
            value={cellValue as 'J' | 'N' | ' '}
            onChange={(newValue) => updateCell(row.id, column.key, newValue)}
            label=""
            disabled={disabled}
            hideLabel={true}
          />
        );

      case 'dropdown':
        return (
          <MotorDropDown
            key={cellId}
            value={cellValue as string}
            onChange={(newValue) => updateCell(row.id, column.key, newValue)}
            label=""
            fieldKey={`${column.key}_${row.id}`}
            disabled={disabled}
            domainId={column.dropdown?.domainId || ''}
            placeholder={column.ui?.placeholder || 'Bitte auswählen...'}
            hideLabel={true}
            allowInViewMode={false}
          />
        );

      default:
        return (
          <MotorEditText
            key={cellId}
            value={cellValue as string}
            onChange={(newValue) => updateCell(row.id, column.key, newValue)}
            label=""
            disabled={disabled}
            hideLabel={true}
          />
        );
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Table className="w-4 h-4" />
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
        <span className="text-xs text-gray-500 ml-auto">
          {safeValue.length} {safeValue.length === 1 ? 'Eintrag' : 'Einträge'}
        </span>
      </div>

      {/* Tabelle */}
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        {safeValue.length === 0 ? (
          // Leere Tabelle
          <div className="p-8 text-center text-gray-500 bg-gray-50">
            <Table className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">{emptyText}</p>
          </div>
        ) : (
          // Tabelle mit Daten
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Tabellen-Header */}
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
                      style={{ width: column.width || 'auto' }}
                    >
                      {column.label}
                    </th>
                  ))}
                  {!einzeiligeTabelle && isEditMode && (
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 tracking-wider w-16">
                      Aktionen
                    </th>
                  )}
                </tr>
              </thead>

              {/* Tabellen-Body */}
              <tbody className="bg-white divide-y divide-gray-200">
                {safeValue.map((row, rowIndex) => {
                  // Fallback für fehlende IDs
                  const rowKey = row.id || `row_${rowIndex}_${Date.now()}`;
                  
                  return (
                    <tr
                      key={rowKey}
                      className={`hover:bg-gray-50 transition-colors duration-150 ${
                        rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                      }`}
                      onMouseEnter={() => setHoveredRowId(row.id)}
                      onMouseLeave={() => setHoveredRowId(null)}
                    >
                    {columns.map((column) => (
                      <td
                        key={`${rowKey}-${column.key}`}
                        className="px-4 py-3"
                        style={{ width: column.width || 'auto' }}
                      >
                        {renderCell(row, column)}
                      </td>
                    ))}
                    
                    {/* Aktionen-Spalte (nur im Edit-Modus und nicht bei einzeiliger Tabelle) */}
                    {!einzeiligeTabelle && isEditMode && (
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => deleteRow(row.id)}
                          disabled={disabled}
                          className={`
                            p-1 rounded-md transition-all duration-200
                            ${hoveredRowId === row.id 
                              ? 'text-red-600 hover:bg-red-50 hover:text-red-700' 
                              : 'text-gray-400 hover:text-red-500'
                            }
                            ${disabled 
                              ? 'cursor-not-allowed opacity-50' 
                              : 'cursor-pointer'
                            }
                          `}
                          title="Zeile löschen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Hinzufügen-Button (nur im Edit-Modus und nicht bei einzeiliger Tabelle) */}
      {!einzeiligeTabelle && isEditMode && (!maxRows || safeValue.length < maxRows) && (
        <button
          onClick={addRow}
          disabled={disabled}
          className={`
            flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg
            transition-all duration-200
            ${disabled
              ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
              : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50'
            }
          `}
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">{addButtonText}</span>
        </button>
      )}
      
      {/* Info wenn maxRows erreicht (nicht bei einzeiliger Tabelle) */}
      {!einzeiligeTabelle && maxRows && safeValue.length >= maxRows && (
        <div className="text-center py-2 text-sm text-gray-500">
          Maximale Anzahl von {maxRows} Zeile(n) erreicht
        </div>
      )}
    </div>
  );
};