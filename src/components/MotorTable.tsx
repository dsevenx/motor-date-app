"use client"

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { MotorDate } from './MotorDate';
import { MotorEditText } from './MotorEditText';
import { MotorEditNumber } from './MotorEditNumber';
import { MotorCheckBox } from './MotorCheckBox';
import { MotorDropDown } from './MotorDropDown';
import { TableRow, TableColumn } from '@/constants/fieldConfig';

export interface MotorTableProps {
  value: TableRow[];
  onChange: (value: TableRow[]) => void;
  label: string;
  columns: TableColumn[];
  addButtonText?: string;
  emptyText?: string;
  disabled?: boolean;
}

export const MotorTable: React.FC<MotorTableProps> = ({
  value = [],
  onChange,
  label,
  columns,
  addButtonText = 'Neue Zeile hinzufügen',
  emptyText = 'Keine Daten vorhanden',
  disabled = false
}) => {
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

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
    const newRow = createNewRow();
    onChange([...value, newRow]);
  };

  // Zeile löschen
  const deleteRow = (rowId: string) => {
    if (disabled) return;
    onChange(value.filter(row => row.id !== rowId));
  };

  // Zellenwert aktualisieren
  const updateCell = (rowId: string, columnKey: string, newValue: any) => {
    if (disabled) return;
    const updatedRows = value.map(row => 
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
            disabled={disabled}
            domainId={column.dropdown?.domainId || ''}
            placeholder={column.ui?.placeholder || 'Bitte auswählen...'}
            hideLabel={true}
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
    <div className="relative w-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
        <span className="text-xs text-gray-500 ml-auto">
          {value.length} {value.length === 1 ? 'Eintrag' : 'Einträge'}
        </span>
      </div>

      {/* Table Container */}
      <div className="border border-gray-300 rounded-lg bg-white overflow-visible">
        {value.length === 0 ? (
          // Leere Tabelle
          <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 mx-auto mb-2 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
            </div>
            <p className="text-sm">{emptyText}</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="bg-gray-50 border-b border-gray-200">
              <div 
                className="grid gap-2 p-3" 
                style={{ 
                  gridTemplateColumns: `repeat(${columns.length}, 1fr) 50px` 
                }}
              >
                {columns.map((column) => (
                  <div 
                    key={column.key} 
                    className="text-sm font-medium text-gray-700 px-2 py-1 flex items-center"
                    style={{ width: column.width || 'auto' }}
                  >
                    {column.label}
                  </div>
                ))}
                <div className="text-xs font-medium text-gray-500 text-center flex items-center justify-center">
                  Aktionen
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200 overflow-visible">
              {value.map((row, rowIndex) => (
                <div
                  key={row.id}
                  className={`grid gap-2 p-3 hover:bg-gray-50 transition-colors overflow-visible ${
                    hoveredRowId === row.id ? 'bg-gray-50' : rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                  }`}
                  style={{ 
                    gridTemplateColumns: `repeat(${columns.length}, 1fr) 50px` 
                  }}
                  onMouseEnter={() => setHoveredRowId(row.id)}
                  onMouseLeave={() => setHoveredRowId(null)}
                >
                  {columns.map((column) => (
                    <div 
                      key={`${row.id}-${column.key}`} 
                      className="px-2 py-1 flex items-center overflow-visible relative"
                      style={{ width: column.width || 'auto' }}
                    >
                      {renderCell(row, column)}
                    </div>
                  ))}
                  
                  {/* Aktionen-Spalte */}
                  <div className="flex items-center justify-center px-2 py-1">
                    <button
                      onClick={() => deleteRow(row.id)}
                      disabled={disabled}
                      className={`
                        w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200
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
                      type="button"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Add Button Row */}
        <div className="border-t border-gray-200 p-3">
          <button
            onClick={addRow}
            disabled={disabled}
            className={`
              w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md
              transition-colors duration-200
              ${disabled
                ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                : 'text-green-600 hover:bg-green-50 hover:text-green-700'
              }
            `}
            type="button"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm font-medium">{addButtonText}</span>
          </button>
        </div>
      </div>

      {/* Info Text */}
      <div className="text-xs text-gray-500 mt-2">
        {value.length} {value.length === 1 ? 'Eintrag' : 'Einträge'}
      </div>
    </div>
  );
};