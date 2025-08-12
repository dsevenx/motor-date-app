"use client"

import React, { useState, useEffect } from 'react';
import { PageTemplate } from '@/components/PageTemplate';
import { MotorProduktSpartenTree } from '@/components/MotorProduktSpartenTree';
import { useGlobalFieldDefinitions } from '@/hooks/useGlobalFieldDefinitions';
import { useGlobalProductData } from '@/hooks/useGlobalProductData';
import { generateEchteEingabeValues, setFieldValueWithEchteEingabe } from '@/constants/fieldConfig';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

export default function ProduktPage() {
  const { fieldDefinitions: globalFieldValues, updateFieldDefinitions } = useGlobalFieldDefinitions();
  
  // 🌐 Verwende globale Produktdaten für korrekte Initialisierung
  const { isLoaded: isProductDataLoaded, ensureProductDataLoaded } = useGlobalProductData();
  
  // Initialisiere State erst NACH dem Laden der Produktdaten
  const [fieldValues, setFieldValues] = useState<Record<string, any>>(() => {
    // Initial leerer State - wird später über useEffect gefüllt
    return {};
  });
  
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialisierung: Warte auf Produktdaten, dann initialisiere fieldValues
  useEffect(() => {
    const initializeFieldValues = async () => {
      if (!isInitialized) {
        console.log('🚀 Produkt-Page: Initialisiere Field Values...');
        
        // Stelle sicher, dass Produktdaten geladen sind
        await ensureProductDataLoaded();
        
        // Jetzt können wir generateEchteEingabeValues() verwenden - Produktdaten sind verfügbar
        const initialValues = generateEchteEingabeValues();
        console.log('🔄 Produkt-Page: Initial Field Values generiert:', Object.keys(initialValues));
        
        setFieldValues(initialValues);
        setIsInitialized(true);
      }
    };
    
    initializeFieldValues();
  }, [isInitialized, ensureProductDataLoaded]);

  // Sync with global field values from Chat updates (avoid circular updates)
  useEffect(() => {
    if (isInitialized && globalFieldValues && Object.keys(globalFieldValues).length > 0) {
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
  }, [isInitialized, globalFieldValues]);

  // Show loading state until initialized
  if (!isInitialized || Object.keys(fieldValues).length === 0) {
    return (
      <PageTemplate title="Produkt" enableSectionNavigation>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="ml-2 text-gray-600">Lade Produktdaten...</span>
        </div>
      </PageTemplate>
    );
  }

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