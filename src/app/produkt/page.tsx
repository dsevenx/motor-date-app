"use client"

import React, { useState, useEffect } from 'react';
import { PageTemplate } from '@/components/PageTemplate';
import { MotorProduktSpartenTree } from '@/components/MotorProduktSpartenTree';
import { useGlobalFieldDefinitions } from '@/hooks/useGlobalFieldDefinitions';
import { generateEchteEingabeValues, setFieldValueWithEchteEingabe } from '@/constants/fieldConfig';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

export default function ProduktPage() {
  const { fieldDefinitions: globalFieldValues, updateFieldDefinitions } = useGlobalFieldDefinitions();
  
  // Generiere State basierend auf echten Eingabewerten (nicht nur Defaults)
  // Verwende lazy initial state um immer die aktuellsten echteEingabe Werte zu bekommen
  const [fieldValues, setFieldValues] = useState(() => generateEchteEingabeValues());

  // Sync with global field values from Chat updates (avoid circular updates)
  useEffect(() => {
    if (globalFieldValues && Object.keys(globalFieldValues).length > 0) {
      setFieldValues(prev => {
        let hasChanges = false;
        const updates = { ...prev };
        
        Object.keys(globalFieldValues).forEach(key => {
          const newValue = globalFieldValues[key];
          const currentValue = prev[key];
          
          // Vergleiche auf JSON-Ebene für deep equality
          if (JSON.stringify(currentValue) !== JSON.stringify(newValue)) {
            console.log(`🔄 Produkt-Page Update: ${key}`, { from: currentValue, to: newValue });
            updates[key] = newValue;
            hasChanges = true;
          }
        });
        
        return hasChanges ? updates : prev;
      });
    }
  }, [globalFieldValues]);

  return (
    <PageTemplate title="Produkt" enableSectionNavigation>
      <div className="space-y-8">
        <section id="liste">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Liste</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <MotorProduktSpartenTree
              fieldDefinitions={fieldValues}
              onFieldDefinitionsChange={(updates) => {
                console.log('🔄 Produkt-Page Local Update:', updates);
                
                // Für jedes Update: setze echteEingabe UND lokalen State
                Object.keys(updates).forEach(fieldKey => {
                  const value = updates[fieldKey];
                  
                  // Setze echteEingabe in FIELD_DEFINITIONS (Field-Level!)
                  setFieldValueWithEchteEingabe(fieldKey, value, (newValue) => {
                    console.log(`🔧 echteEingabe auf Field-Level gesetzt für ${fieldKey}:`, newValue);
                  });
                });
                
                // Update lokale fieldValues
                setFieldValues(prev => ({ ...prev, ...updates }));
                // Update globale fieldDefinitions für andere Pages
                updateFieldDefinitions(updates);
              }}
            />
          </div>
        </section>

        <hr className="border-gray-200" />

        <section id="nachlaesse-zuschlaege">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Nachlässe/Zuschläge</h2>
          <p className="text-gray-600">Nachlässe und Zuschläge werden hier angezeigt.</p>
        </section>

        <hr className="border-gray-200" />

        <section id="fahrer">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Fahrer</h2>
          <p className="text-gray-600">Fahrerangaben werden hier angezeigt.</p>
        </section>

        <hr className="border-gray-200" />

        <section id="merkmale">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Merkmale</h2>
          <p className="text-gray-600">Produktmerkmale werden hier angezeigt.</p>
        </section>

        <hr className="border-gray-200" />

        <section id="tarifangaben">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Tarifangaben</h2>
          <p className="text-gray-600">Tarifangaben werden hier angezeigt.</p>
        </section>
      </div>
    </PageTemplate>
  );
}