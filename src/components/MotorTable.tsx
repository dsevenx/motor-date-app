"use client"

import { Trash2, Plus, Table } from 'lucide-react';
import React from "react";
import { MotorDate } from './MotorDate';
import { MotorEditNumber } from './MotorEditNumber';
import { MotorEditText } from './MotorEditText';
import { FieldType, NumberFormat } from '@/constants/fieldConfig';

export interface TableColumn {
  key: string;
  label: string;
  type: FieldType;
  width?: string;
  validation?: {
    min?: string | number;
    max?: string | number;
    numberFormat?: NumberFormat;
    maxLength?: number;
  };
  ui?: {
    placeholder?: string;
  };
}

export interface TableRow {
  id: string;
  [key: string]: any;
}

export interface MotorTableProps {
  label: string;
  columns: TableColumn[];
  rows: TableRow[];
  onChange: (rows: TableRow[]) => void;
  disabled?: boolean;
  addButtonText?: string;
  emptyText?: string;
}

export const MotorTable: React.FC<MotorTableProps> = ({
  label,
  columns,
  rows,
  onChange,
  disabled = false,
  addButtonText = "Zeile hinzufügen",
  emptyText = "Keine Einträge vorhanden"
}) => {
  
  // Neue leere Zeile erstellen
  const createEmptyRow = (): TableRow => {
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
        case 'text':
        case 'select':
        default:
          newRow[column.key] = '';
          break;
      }
    });
    
    return newRow;
  };

  // Zeile hinzufügen
  const handleAddRow = () => {
    if (disabled) return;
    const newRow = createEmptyRow();
    onChange([...rows, newRow]);
  };

  // Zeile löschen
  const handleDeleteRow = (rowId: string) => {
    if (disabled) return;
    onChange(rows.filter(row => row.id !== rowId));
  };

  // Zellenwert ändern
  const handleCellChange = (rowId: string, columnKey: string, value: any) => {
    if (disabled) return;
    
    const updatedRows = rows.map(row => {
      if (row.id === rowId) {
        return { ...row, [columnKey]: value };
      }
      return row;
    });
    
    onChange(updatedRows);
  };

  // Render-Funktion für eine Zelle
  const renderCell = (row: TableRow, column: TableColumn) => {
    const value = row[column.key];
    const cellId = `${row.id}-${column.key}`;
    
    switch (column.type) {
      case 'date':
        return (
          <MotorDate
            value={value}
            onChange={(newValue) => handleCellChange(row.id, column.key, newValue)}
            label=""
            disabled={disabled}
          />
        );
      
      case 'number':
        return (
          <MotorEditNumber
            value={value}
            onChange={(newValue) => handleCellChange(row.id, column.key, newValue)}
            label=""
            placeholder={column.ui?.placeholder}
            disabled={disabled}
            min={column.validation?.min as number}
            max={column.validation?.max as number}
            format={column.validation?.numberFormat || 'decimal'}
          />
        );
      
      case 'boolean':
        return (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleCellChange(row.id, column.key, e.target.checked)}
              disabled={disabled}
              className={`
                w-4 h-4 text-blue-600 rounded border-gray-300 
                focus:ring-blue-500 focus:ring-2
                ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              `}
            />
          </div>
        );
      
      case 'text':
      case 'select':
      default:
        return (
          <MotorEditText
            value={value}
            onChange={(newValue) => handleCellChange(row.id, column.key, newValue)}
            label=""
            placeholder={column.ui?.placeholder}
            disabled={disabled}
            maxLength={column.validation?.maxLength}
          />
        );
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Table className="w-5 h-5 text-gray-700" />
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
        <span className="text-xs text-gray-500 ml-2">
          ({rows.length} Einträge)
        </span>
      </div>

      {/* Tabelle */}
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
        {rows.length === 0 ? (
          // Leere Tabelle
          <div className="p-8 text-center text-gray-500">
            <Table className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">{emptyText}</p>
          </div>
        ) : (
          // Tabelle mit Daten
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Header */}
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ width: column.width }}
                    >
                      {column.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    Aktionen
                  </th>
                </tr>
              </thead>
              
              {/* Body */}
              <tbody className="bg-white divide-y divide-gray-200">
                {rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`hover:bg-gray-50 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className="px-4 py-3 whitespace-nowrap"
                        style={{ width: column.width }}
                      >
                        {renderCell(row, column)}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteRow(row.id)}
                        disabled={disabled}
                        className={`
                          inline-flex items-center justify-center
                          w-8 h-8 rounded-full
                          text-red-600 hover:text-red-800
                          hover:bg-red-50
                          transition-colors duration-200
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Button */}
      {!disabled && (
        <div className="flex justify-start">
          <button
            onClick={handleAddRow}
            className="
              inline-flex items-center gap-2 px-4 py-2
              text-sm font-medium text-blue-600
              border border-blue-300 rounded-md
              hover:bg-blue-50 hover:border-blue-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              transition-colors duration-200
            "
          >
            <Plus className="w-4 h-4" />
            {addButtonText}
          </button>
        </div>
      )}
    </div>
  );
};