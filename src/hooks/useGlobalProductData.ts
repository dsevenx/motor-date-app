/**
 * Global Product Data Management Hook
 * Entkoppelt Produktdaten von der Produkt-Page und stellt sie global zur Verfügung
 * Ermöglicht Chat-Updates von jeder Page aus
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchProduktData } from '@/app/api/FetchProduktData';
import { initializeProductFieldDefinitions, mergeProductDataWithExistingUserData } from '@/utils/fieldDefinitionsHelper';
import { useGlobalFieldDefinitions } from './useGlobalFieldDefinitions';

// Module-level state für globale Produktdaten
let globalProductData: any[] = [];
let isProductDataLoaded = false;
let isProductDataLoading = false;
let productDataListeners: (() => void)[] = [];

// Utility functions für globale State-Verwaltung
const notifyProductDataListeners = () => {
  productDataListeners.forEach(listener => listener());
};

const setGlobalProductData = (data: any[]) => {
  globalProductData = data;
  isProductDataLoaded = true;
  isProductDataLoading = false;
  console.log(`🌐 Global Product Data Updated: ${data.length} Sparten`);
  notifyProductDataListeners();
};

/**
 * Hook für globale Produktdaten-Verwaltung
 * - Lädt Produktdaten einmalig beim ersten Aufruf
 * - Stellt die Daten allen Components zur Verfügung
 * - Integriert automatisch mit FIELD_DEFINITIONS
 */
export const useGlobalProductData = () => {
  const { fieldDefinitions, updateFieldDefinitions } = useGlobalFieldDefinitions();
  const [, forceRender] = useState({});
  
  // Re-render auslösen wenn sich globale Produktdaten ändern
  useEffect(() => {
    const listener = () => forceRender({});
    productDataListeners.push(listener);
    
    return () => {
      productDataListeners = productDataListeners.filter(l => l !== listener);
    };
  }, []);

  /**
   * Lädt Produktdaten von der API und initialisiert FIELD_DEFINITIONS
   * Wird nur einmal beim ersten Aufruf ausgeführt
   */
  const loadProductData = useCallback(async () => {
    if (isProductDataLoaded || isProductDataLoading) {
      console.log(`⏭️ Product Data bereits geladen oder wird geladen - skip`);
      return globalProductData;
    }

    console.log(`🚀 Lade globale Produktdaten...`);
    isProductDataLoading = true;

    try {
      const data = await fetchProduktData();
      setGlobalProductData(data);

      // Initialisiere/Merge FIELD_DEFINITIONS mit Produktdaten
      console.log(`🔄 Initialisiere FIELD_DEFINITIONS mit ${data.length} Sparten`);
      
      // Prüfe ob bereits User-Eingaben vorhanden sind
      const hasExistingUserData = fieldDefinitions && 
        Object.keys(fieldDefinitions).some(key => {
          if (key === 'produktSparten' || key.startsWith('produktBausteine_')) {
            const tableData = fieldDefinitions[key]?.value || [];
            return Array.isArray(tableData) && tableData.some((row: any) => row.echteEingabe === true);
          }
          return false;
        });

      let fieldDefinitionsUpdates;
      if (hasExistingUserData) {
        console.log(`🔄 MERGE: User-Eingaben vorhanden - intelligente Merge-Operation`);
        fieldDefinitionsUpdates = mergeProductDataWithExistingUserData(data, fieldDefinitions);
      } else {
        console.log(`🆕 INIT: Keine User-Eingaben - normale Initialisierung`);
        fieldDefinitionsUpdates = initializeProductFieldDefinitions(data, fieldDefinitions);
      }

      // Update FIELD_DEFINITIONS falls nötig
      if (Object.keys(fieldDefinitionsUpdates).length > 0) {
        updateFieldDefinitions(fieldDefinitionsUpdates);
        console.log(`✅ FIELD_DEFINITIONS aktualisiert:`, Object.keys(fieldDefinitionsUpdates));
      } else {
        console.log(`ℹ️ Keine FIELD_DEFINITIONS Updates nötig`);
      }

      return data;
    } catch (error) {
      console.error('❌ Fehler beim Laden der globalen Produktdaten:', error);
      isProductDataLoading = false;
      throw error;
    }
  }, [fieldDefinitions, updateFieldDefinitions]);

  /**
   * Forciert ein Neuladen der Produktdaten (z.B. nach Änderungen)
   */
  const reloadProductData = useCallback(async () => {
    console.log(`🔄 Forciere Reload der Produktdaten...`);
    isProductDataLoaded = false;
    isProductDataLoading = false;
    return await loadProductData();
  }, [loadProductData]);

  /**
   * Prüft ob Produktdaten verfügbar sind und lädt sie bei Bedarf
   */
  const ensureProductDataLoaded = useCallback(async () => {
    if (!isProductDataLoaded && !isProductDataLoading) {
      await loadProductData();
    }
    return globalProductData;
  }, [loadProductData]);

  return {
    productData: globalProductData,
    isLoaded: isProductDataLoaded,
    isLoading: isProductDataLoading,
    loadProductData,
    reloadProductData,
    ensureProductDataLoaded
  };
};

/**
 * Utility-Funktion um Produktdaten von außerhalb der React-Components zu laden
 * Nützlich für API-Routen oder andere nicht-React Contexts
 */
export const ensureGlobalProductDataLoaded = async () => {
  if (isProductDataLoaded) {
    return globalProductData;
  }

  // Falls noch keine React-Component die Daten geladen hat, lade sie direkt
  if (!isProductDataLoading) {
    console.log(`🚀 Lade Produktdaten außerhalb React-Context...`);
    isProductDataLoading = true;
    try {
      const data = await fetchProduktData();
      setGlobalProductData(data);
      return data;
    } catch (error) {
      console.error('❌ Fehler beim Laden der Produktdaten:', error);
      isProductDataLoading = false;
      throw error;
    }
  }

  return globalProductData;
};