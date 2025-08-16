// API Route für Verarbeitung von extrahierten Claude-Daten
// Gleiche Logik wie ChatComponent -> Aktualisiert FIELD_DEFINITIONS -> Generiert echteEingabeValues

import { NextRequest, NextResponse } from 'next/server';
import { FIELD_DEFINITIONS, generateEchteEingabeValues, generateFieldConfigs, generateDefaultValues } from '@/constants/fieldConfig';
import { ServiceABSEinarbeiterHelper } from '@/utils/ServiceABSEinarbeiterHelper';

interface ExtractedFieldValue {
  value: any;
  confidence: number;
  source?: string;
}

interface ClaudeResponse {
  extractedData: Record<string, ExtractedFieldValue>;
  overallConfidence: number;
  validationErrors?: string[];
  suggestions?: string[];
  recognizedPhrases?: string[];
}

// Helper-Funktionen aus ChatComponent übernommen
function convertValueToFieldType(value: any, fieldType: string): any {
  switch (fieldType) {
    case 'date':
      return String(value);
    case 'number':
      return Number(value) || 0;
    case 'boolean':
      return Boolean(value);
    case 'tristate':
      return ['J', 'N', ' '].includes(value) ? value : ' ';
    case 'table':
    case 'single-line-table':
      return Array.isArray(value) ? value : [];
    default:
      return String(value);
  }
}

function mergeTableData(currentTable: any[], aiTable: any[], fieldKey: string): any[] {
  console.log(`🔄 Merge ${fieldKey}:`, { current: currentTable?.length || 0, ai: aiTable?.length || 0 });
  console.log(`🔍 MERGE INPUT currentTable:`, currentTable);
  console.log(`🔍 MERGE INPUT aiTable:`, aiTable);
  
  if (!Array.isArray(aiTable) || aiTable.length === 0) {
    return currentTable || [];
  }
  
  /*
  if (!Array.isArray(currentTable) || currentTable.length === 0) {
    return aiTable.map((row: any, index: number) => ({
      ...row,
      id: row.id || (index + 1).toString(),
      echteEingabe: true
    }));
  }
  */
  
  // Intelligente Merge-Logik
  const merged = [...currentTable];
  
  aiTable.forEach((aiRow: any) => {
    console.log(`🔍 MERGE DEBUG: Processing aiRow for ${fieldKey}:`, aiRow);
    console.log(`🔍 MERGE DEBUG: aiRow.id=${aiRow.id}, !aiRow.id=${!aiRow.id}`);
    if (!aiRow.id) {
      // Neue Zeile ohne ID -> Hinzufügen
      const processedRow = {
        ...aiRow,
        id: (merged.length + 1).toString(),
        echteEingabe: true
      };
      
      // Spezielle Behandlung für produktSparten: zustand basierend auf check (NACH spread, IMMER setzen)
      if (fieldKey === 'produktSparten') {
        const checkValue = aiRow.check !== undefined ? aiRow.check : processedRow.check;
        processedRow.zustand = checkValue ? 'A' : ' ';
        console.log(`🔄 ProductSparte NEW ${aiRow.id}: check=${checkValue} → zustand='${processedRow.zustand}' (FORCED)`);
        console.log(`🔄 ProductSparte NEW COMPLETE ROW:`, processedRow);
      }
      
      // Spezielle Behandlung für produktBausteine: knotenId von id kopieren
      if (fieldKey.startsWith('produktBausteine_') && aiRow.id) {
        processedRow.knotenId = aiRow.id;
        console.log(`🔄 ProductBaustein ${aiRow.id}: knotenId='${processedRow.knotenId}' hinzugefügt`);
      }
      
      // FINAL zustand assignment for produktSparten (after all processing)
      if (fieldKey === 'produktSparten') {
        const finalCheckValue = processedRow.check !== undefined ? processedRow.check : false;
        processedRow.zustand = finalCheckValue ? 'A' : ' ';
        console.log(`🔄 FINAL ProductSparte NEW ${processedRow.id}: finalCheck=${finalCheckValue} → zustand='${processedRow.zustand}' (ULTIMATE OVERRIDE)`);
      }
      
      merged.push(processedRow);
    } else {
      // Zeile mit ID -> Aktualisieren oder Hinzufügen
      const existingIndex = merged.findIndex(row => row.id === aiRow.id);
      console.log(`🔍 EXISTING CHECK: Looking for id=${aiRow.id}, found at index=${existingIndex}`);
      if (existingIndex >= 0) {
        console.log(`🔍 EXISTING FOUND: Updating existing row:`, merged[existingIndex]);
        // Betrag-Unterstützung: Preserve existing betrag if AI doesn't specify it
        const existingBetrag = merged[existingIndex].betrag;
        const processedRow = {
          ...merged[existingIndex],
          ...aiRow,
          betrag: aiRow.betrag !== undefined ? aiRow.betrag : existingBetrag,
          echteEingabe: true
        };
        
        // Spezielle Behandlung für produktSparten: zustand basierend auf check (NACH spread, IMMER setzen)
        if (fieldKey === 'produktSparten') {
          const checkValue = aiRow.check !== undefined ? aiRow.check : processedRow.check;
          console.log(`🔍 DEBUG CHECK VALUE: aiRow.check=${aiRow.check} (${typeof aiRow.check}), processedRow.check=${processedRow.check} (${typeof processedRow.check}), final checkValue=${checkValue} (${typeof checkValue})`);
          processedRow.zustand = checkValue ? 'A' : ' ';
          console.log(`🔄 ProductSparte UPDATE ${aiRow.id}: check=${checkValue} → zustand='${processedRow.zustand}' (FORCED)`);
          console.log(`🔄 ProductSparte UPDATE FINAL ROW:`, processedRow);
        }
        
        // Spezielle Behandlung für produktBausteine: knotenId von id kopieren
        if (fieldKey.startsWith('produktBausteine_') && aiRow.id) {
          processedRow.knotenId = aiRow.id;
          console.log(`🔄 ProductBaustein ${aiRow.id}: knotenId='${processedRow.knotenId}' hinzugefügt`);
        }
        
        // FINAL zustand assignment for produktSparten (after all processing)
        if (fieldKey === 'produktSparten') {
          const finalCheckValue = processedRow.check !== undefined ? processedRow.check : false;
          processedRow.zustand = finalCheckValue ? 'A' : ' ';
          console.log(`🔄 FINAL ProductSparte UPDATE ${processedRow.id}: finalCheck=${finalCheckValue} → zustand='${processedRow.zustand}' (ULTIMATE OVERRIDE)`);
        }
        
        merged[existingIndex] = processedRow;
      } else {
        const processedRow = {
          ...aiRow,
          echteEingabe: true
        };
        
        // Spezielle Behandlung für produktSparten: zustand basierend auf check (NACH spread, IMMER setzen)
        if (fieldKey === 'produktSparten') {
          const checkValue = aiRow.check !== undefined ? aiRow.check : processedRow.check;
          processedRow.zustand = checkValue ? 'A' : ' ';
          console.log(`🔄 ProductSparte ADD ${aiRow.id}: check=${checkValue} → zustand='${processedRow.zustand}' (FORCED)`);
          console.log(`🔄 ProductSparte ADD COMPLETE ROW:`, processedRow);
        }
        
        // Spezielle Behandlung für produktBausteine: knotenId von id kopieren
        if (fieldKey.startsWith('produktBausteine_') && aiRow.id) {
          processedRow.knotenId = aiRow.id;
          console.log(`🔄 ProductBaustein ${aiRow.id}: knotenId='${processedRow.knotenId}' hinzugefügt`);
        }
        
        // FINAL zustand assignment for produktSparten (after all processing)
        if (fieldKey === 'produktSparten') {
          const finalCheckValue = processedRow.check !== undefined ? processedRow.check : false;
          processedRow.zustand = finalCheckValue ? 'A' : ' ';
          console.log(`🔄 FINAL ProductSparte ADD ${processedRow.id}: finalCheck=${finalCheckValue} → zustand='${processedRow.zustand}' (ULTIMATE OVERRIDE)`);
        }
        
        merged.push(processedRow);
      }
    }
  });
  
  // FINAL FINAL FINAL zustand override for all produktSparten (absolute last chance)
  if (fieldKey === 'produktSparten') {
    console.log(`🔥 ULTIMATE FINAL ZUSTAND CHECK for produktSparten:`);
    merged.forEach((row: any, index: number) => {
      const oldZustand = row.zustand;
      row.zustand = row.check ? 'A' : ' ';
      console.log(`🔥 Row ${index}: id=${row.id}, check=${row.check}, zustand: "${oldZustand}" → "${row.zustand}"`);
    });
  }
  
  console.log(`🔍 MERGE RESULT for ${fieldKey}:`, merged);
  return merged;
}

export async function POST(request: NextRequest) {
  try {
    const { extractedData, currentFieldDefinitions } = await request.json();
    
    console.log('🚀 ===== PROCESS-EXTRACTED-DATA START =====');
    console.log('🚀 Eingangsdaten:', {
      extractedDataKeys: Object.keys(extractedData || {}),
      hasCurrentFieldDefinitions: !!currentFieldDefinitions
    });
    
    if (!extractedData || typeof extractedData !== 'object') {
      throw new Error('Invalid extractedData provided');
    }
    
    // 1. Generiere default values und Setters (wie in ChatComponent)
    const defaultValues = generateDefaultValues();
    console.log('🔍 Default values keys:', Object.keys(defaultValues));
    console.log('🔍 Default values beginndatum:', defaultValues.beginndatum);
    
    // Mock setters für API context (nicht verwendet, aber für generateFieldConfigs benötigt)
    const mockSetters: Record<string, (value: any) => void> = {};
    Object.keys(defaultValues).forEach(key => {
      mockSetters[key] = () => {}; // No-op setter for API context
    });
    
    let fieldConfigs: any[];
    try {
      // Generiere FieldConfigs mit aktuellen Werten
      fieldConfigs = generateFieldConfigs(defaultValues, mockSetters);
      console.log('✅ FieldConfigs generiert:', fieldConfigs.length);
    } catch (configError) {
      console.error('❌ Fehler bei generateFieldConfigs:', configError);
      if (configError instanceof Error) {
        throw new Error(`generateFieldConfigs failed: ${configError.message}`);
      } else {
        throw new Error('generateFieldConfigs failed: Unknown error');
      }
    }
    
    // 2. Sammle alle Updates (wie in ChatComponent processExtractedData)
    const updatedFieldDefinitions = [...FIELD_DEFINITIONS]; // Kopiere Array
    const processedFields: string[] = [];
    
    Object.entries(extractedData).forEach(([fieldKey, extractedValue]) => {
      console.log(`🔍 Verarbeite Feld: ${fieldKey}`, extractedValue);
      
      const typedExtractedValue = extractedValue as ExtractedFieldValue;
      
      // Confidence-Check
      if (!typedExtractedValue.value || typedExtractedValue.confidence <= 0.5) {
        console.log(`⏭️ Überspringe ${fieldKey} - niedrige Confidence (${typedExtractedValue.confidence})`);
        return;
      }
      
      // Passende FieldConfig finden
      const fieldConfig = fieldConfigs.find(config => config.fieldKey === fieldKey);
      if (!fieldConfig) {
        console.log(`⚠️ Keine FieldConfig gefunden für: ${fieldKey}`);
        return;
      }
      
      try {
        // Wert konvertieren basierend auf Feldtyp
        let newValue: any;
        const convertedValue = convertValueToFieldType(typedExtractedValue.value, fieldConfig.type);
        
        // Bei Tabellen-Feldern mit intelligenter Merge-Logik
        if (fieldConfig.type === 'table' || fieldConfig.type === 'single-line-table') {
          const currentTableValue = fieldConfig.currentValue || [];
          const aiTableValue = Array.isArray(convertedValue) ? convertedValue : [];
          
          console.log(`🔍 TABLE PROCESSING: fieldKey=${fieldKey}, type=${fieldConfig.type}`);
          console.log(`🔍 TABLE PROCESSING: currentTableValue.length=${currentTableValue.length}, aiTableValue.length=${aiTableValue.length}`);
          
          if (fieldConfig.type === 'single-line-table' && aiTableValue.length > 0) {
            // Spezielle Behandlung für einzeilige Tabellen
            if (Array.isArray(currentTableValue) && currentTableValue.length > 0) {
              const existingRow = currentTableValue[0];
              const aiRow = aiTableValue[0];
              
              newValue = [{
                ...existingRow,
                ...aiRow,
                id: existingRow.id || '1',
                echteEingabe: true
              }];
            } else {
              newValue = aiTableValue.map((row: any, index: number) => ({
                ...row,
                id: row.id || (index + 1).toString(),
                echteEingabe: true
              }));
            }
              console.log(`✅ SingleLine Zweig ${fieldKey} :`, newValue);
          } else {
            // Verwende intelligente Merge-Funktion für normale Tabellen
            newValue = mergeTableData(currentTableValue, aiTableValue, fieldKey);
           console.log(`✅ mergeTableData Zweig ${fieldKey} :`, newValue);
          }
        } else {
           console.log(`✅ convertedValue Zweig ${fieldKey} :`, newValue);
          newValue = convertedValue;
        }
        
        // Update FIELD_DEFINITIONS
        const fieldDefIndex = updatedFieldDefinitions.findIndex(def => def.key === fieldKey);
        if (fieldDefIndex >= 0) {
          updatedFieldDefinitions[fieldDefIndex] = {
            ...updatedFieldDefinitions[fieldDefIndex],
            defaultValue: newValue,
            echteEingabeValue: newValue
          };
          
          processedFields.push(fieldKey);
          console.log(`✅ -hier war der Merge Bereits-> ${fieldKey} aktualisiert:`, newValue);
          if (fieldKey === 'produktSparten') {
            console.log(`🔍 FIELD UPDATE: produktSparten value after merge:`, JSON.stringify(newValue, null, 2));
          }
        } else {
          console.log(`⚠️ Feld ${fieldKey} nicht in FIELD_DEFINITIONS gefunden - überspringe`);
        }
        
      } catch (error) {
        console.error(`❌ Fehler beim Verarbeiten von ${fieldKey}:`, error);
      }
    });
    
    // 3. Generiere echteEingabeValues (lokale Version da generateEchteEingabeValues keine Parameter akzeptiert)
    /*
    console.log('🔧 Generiere echteEingabeValues lokal...');
    console.log('🔍 Updated Field Definitions für echteEingabeValues:', {
      kilometerstaende: updatedFieldDefinitions.find(f => f.key === 'kilometerstaende')?.defaultValue,
      produktSparten: updatedFieldDefinitions.find(f => f.key === 'produktSparten')?.defaultValue,
      produktBausteine_KK: updatedFieldDefinitions.find(f => f.key === 'produktBausteine_KK')?.defaultValue,
      KraftDmKfzVorfahrl: updatedFieldDefinitions.find(f => f.key === 'KraftDmKfzVorfahrl')?.defaultValue
    });
    */
    
    // Lokale generateEchteEingabeValues Implementation
    const echteEingabeValues = updatedFieldDefinitions.reduce((acc, field) => {
      const value = field.echteEingabeValue || field.defaultValue;
      
      // Deep clone arrays and objects to prevent mutation
      if (Array.isArray(value)) {
        acc[field.key] = value.map(item => 
          typeof item === 'object' && item !== null ? { ...item } : item
        );
      } else if (typeof value === 'object' && value !== null) {
        acc[field.key] = { ...(value as object) };
      } else {
        acc[field.key] = value;
      }
      
      return acc;
    }, {} as Record<string, any>);
    
    console.log('🔍 ------->Generierte echteEingabeValues:', {
      kilometerstaende: echteEingabeValues.kilometerstaende,
      produktSparten: echteEingabeValues.produktSparten,
      produktBausteine_KK: echteEingabeValues.produktBausteine_KK,
      KraftDmKfzVorfahrl: echteEingabeValues.KraftDmKfzVorfahrl
    });
    
    // 4. Aktualisiere globale FIELD_DEFINITIONS mit echteEingabe-Flags
    console.log('🔄 Aktualisiere globale FIELD_DEFINITIONS mit echteEingabe-Flags...');
    processedFields.forEach(fieldKey => {
      const fieldIndex = FIELD_DEFINITIONS.findIndex(f => f.key === fieldKey);
      if (fieldIndex >= 0) {
        const updatedField = updatedFieldDefinitions[fieldIndex];
        FIELD_DEFINITIONS[fieldIndex].echteEingabeValue = updatedField.echteEingabeValue;
        console.log(`✅ Globale FIELD_DEFINITIONS[${fieldKey}].echteEingabe = ${updatedField.echteEingabeValue !== undefined}`);
      }
    });
    
    // 5. Generiere XML mit verarbeiteten Daten (verwendet jetzt globale FIELD_DEFINITIONS)
    console.log('📄 ------->Generiere XML mit ServiceABSEinarbeiterHelper...');
    const xml = ServiceABSEinarbeiterHelper.erzeugeSendeXML(echteEingabeValues);
    
    console.log('✅ ===== PROCESS-EXTRACTED-DATA COMPLETE =====');
    console.log('✅ Verarbeitete Felder:', processedFields);
    console.log('✅ XML Länge:', xml.length);
    
    return NextResponse.json({
      success: true,
      processedFields,
      updatedFieldDefinitions,
      echteEingabeValues,
      xml
    });
    
  } catch (error) {
    console.error('❌ ===== PROCESS-EXTRACTED-DATA ERROR =====');
    console.error('❌ Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}