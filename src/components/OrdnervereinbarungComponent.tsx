"use client"

import React from 'react';
import { FileText } from 'lucide-react';
import { Ordnervereinbarung } from '@/types/contractTypes';

interface OrdnervereinbarungComponentProps {
  ordnervereinbarungen: Ordnervereinbarung[];
}

export const OrdnervereinbarungComponent: React.FC<OrdnervereinbarungComponentProps> = ({
  ordnervereinbarungen
}) => {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 bg-blue-50 border-b border-blue-200 p-3">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Ordnervereinbarung
        </h3>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="p-3 space-y-1">
          {ordnervereinbarungen.map((item) => (
            <div
              key={item.id}
              className="text-sm text-gray-800 leading-relaxed py-1"
            >
              {item.text}
            </div>
          ))}
          
          {ordnervereinbarungen.length === 0 && (
            <div className="text-sm text-gray-500 italic">
              Keine Ordnervereinbarungen verfügbar
            </div>
          )}
        </div>
      </div>
    </div>
  );
};