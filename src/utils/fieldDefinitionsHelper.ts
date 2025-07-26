/**
 * Helper-Funktionen für FIELD_DEFINITIONS Single Point of Truth
 * Zentrale Logik für Sparten/Baustein State Management
 */

export interface FieldDefinitions {
  [key: string]: {
    value: any[];
  };
}

/**
 * Prüft ob eine Sparte oder ein Baustein in FIELD_DEFINITIONS als checked markiert ist
 * @param knotenId - Die knotenId des Elements (oder Sparten-Code für Sparten)
 * @param sparte - Der Sparten-Code (KH, KK, EK, KU)
 * @param fieldDefinitions - Die aktuellen FIELD_DEFINITIONS
 * @returns boolean - true wenn checked, false sonst
 */
export const isChecked = (knotenId: string, sparte: string, fieldDefinitions: FieldDefinitions): boolean => {
  try {
    // 1. Sparten-Check: Wenn knotenId === sparte, dann ist es eine Sparten-Abfrage
    if (knotenId === sparte) {
      const spartenData = fieldDefinitions.produktSparten?.value || [];
      const sparteEntry = spartenData.find((s: any) => s.id === sparte);
      const result = sparteEntry?.check === true;
      
      // Weniger Debug-Spam, nur bei wichtigen Sparten-Checks
      if (sparte === 'KH' || sparte === 'KK') {
        console.log(`🔍 isChecked Sparte [${sparte}]:`, { 
          'fieldDefinitions.produktSparten': fieldDefinitions.produktSparten,
          sparteEntry, 
          result 
        });
      }
      return result;
    }
    
    // 2. Baustein-Check: Suche in der entsprechenden Bausteine-Tabelle
    const tableKey = `produktBausteine_${sparte}`;
    const bausteineData = fieldDefinitions[tableKey]?.value || [];
    const bausteinEntry = bausteineData.find((b: any) => b.knotenId === knotenId);
    const result = bausteinEntry?.check === true;
    
    // Debug nur bei Level 0 für weniger Spam
    if (knotenId && knotenId.startsWith('KBH')) {
      console.log(`🔍 isChecked Baustein [${knotenId}] in [${sparte}]:`, { bausteinEntry, result });
    }
    return result;
    
  } catch (error) {
    console.error(`❌ Fehler in isChecked(${knotenId}, ${sparte}):`, error);
    return false;
  }
};

/**
 * Aktualisiert den Check-Status einer Sparte oder eines Bausteins in FIELD_DEFINITIONS
 * @param knotenId - Die knotenId des Elements
 * @param sparte - Der Sparten-Code
 * @param checked - Der neue Check-Status
 * @param fieldDefinitions - Die aktuellen FIELD_DEFINITIONS
 * @param updateFieldDefinitions - Callback zum Aktualisieren der FIELD_DEFINITIONS
 * @param isUserInput - Ob es sich um echte User-Eingabe handelt (default: true)
 */
export const updateCheckStatus = (
  knotenId: string, 
  sparte: string, 
  checked: boolean, 
  fieldDefinitions: FieldDefinitions,
  updateFieldDefinitions: (updates: Partial<FieldDefinitions>) => void,
  isUserInput: boolean = true
): void => {
  try {
    console.log(`📝 updateCheckStatus: ${knotenId} in ${sparte} = ${checked} (userInput: ${isUserInput})`);
    
    // 1. Sparten-Update
    if (knotenId === sparte) {
      const spartenData = [...(fieldDefinitions.produktSparten?.value || [])];
      console.log(`🔍 Sparten-Update Debug:`, {
        knotenId,
        sparte, 
        checked,
        isUserInput,
        'fieldDefinitions.produktSparten': fieldDefinitions.produktSparten,
        'spartenData.length': spartenData.length,
        'spartenData': spartenData.map(s => ({ id: s.id, check: s.check }))
      });
      
      const sparteIndex = spartenData.findIndex((s: any) => s.id === sparte);
      console.log(`🔍 Gefundener sparteIndex für ${sparte}:`, sparteIndex);
      
      if (sparteIndex >= 0) {
        const beforeUpdate = { ...spartenData[sparteIndex] };
        spartenData[sparteIndex] = { 
          ...spartenData[sparteIndex], 
          check: checked,
          echteEingabe: isUserInput // Markiere als echte Eingabe
        };
        const afterUpdate = { ...spartenData[sparteIndex] };
        
        console.log(`🔍 Sparte Update:`, { beforeUpdate, afterUpdate });
        
        updateFieldDefinitions({
          produktSparten: { value: spartenData }
        });
        console.log(`✅ Sparte ${sparte} updated to ${checked} (echteEingabe: ${isUserInput})`);
      } else {
        console.log(`❌ Sparte ${sparte} nicht gefunden in spartenData`);
      }
      return;
    }
    
    // 2. Baustein-Update
    const tableKey = `produktBausteine_${sparte}`;
    const bausteineData = [...(fieldDefinitions[tableKey]?.value || [])];
    const bausteinIndex = bausteineData.findIndex((b: any) => b.knotenId === knotenId);
    
    if (bausteinIndex >= 0) {
      bausteineData[bausteinIndex] = { 
        ...bausteineData[bausteinIndex], 
        check: checked,
        echteEingabe: isUserInput // Markiere als echte Eingabe
      };
      updateFieldDefinitions({
        [tableKey]: { value: bausteineData }
      });
      console.log(`✅ Baustein ${knotenId} in ${sparte} updated to ${checked} (echteEingabe: ${isUserInput})`);
    } else {
      console.log(`⚠️ Baustein ${knotenId} nicht gefunden in ${tableKey}`);
    }
    
  } catch (error) {
    console.error(`❌ Fehler in updateCheckStatus(${knotenId}, ${sparte}, ${checked}):`, error);
  }
};

/**
 * Aktualisiert den Betrag eines Bausteins in FIELD_DEFINITIONS
 * @param knotenId - Die knotenId des Bausteins
 * @param sparte - Der Sparten-Code
 * @param betrag - Der neue Betrag
 * @param fieldDefinitions - Die aktuellen FIELD_DEFINITIONS
 * @param updateFieldDefinitions - Callback zum Aktualisieren der FIELD_DEFINITIONS
 */
export const updateBetragStatus = (
  knotenId: string,
  sparte: string,
  betrag: number,
  fieldDefinitions: FieldDefinitions,
  updateFieldDefinitions: (updates: Partial<FieldDefinitions>) => void
): void => {
  try {
    console.log(`💰 updateBetragStatus: ${knotenId} in ${sparte} = ${betrag}`);
    
    const tableKey = `produktBausteine_${sparte}`;
    const bausteineData = [...(fieldDefinitions[tableKey]?.value || [])];
    const bausteinIndex = bausteineData.findIndex((b: any) => b.knotenId === knotenId);
    
    if (bausteinIndex >= 0) {
      bausteineData[bausteinIndex] = { 
        ...bausteineData[bausteinIndex], 
        betrag: betrag,
        echteEingabe: true // Markiere als echte Eingabe
      };
      updateFieldDefinitions({
        [tableKey]: { value: bausteineData }
      });
      console.log(`✅ Betrag ${knotenId} in ${sparte} updated to ${betrag}`);
    } else {
      console.log(`⚠️ Baustein ${knotenId} nicht gefunden in ${tableKey}`);
    }
    
  } catch (error) {
    console.error(`❌ Fehler in updateBetragStatus(${knotenId}, ${sparte}, ${betrag}):`, error);
  }
};

/**
 * Initialisiert FIELD_DEFINITIONS mit Produkt-Daten
 * @param produktData - Die Daten aus fetchProduktData()
 * @returns Partial<FieldDefinitions> - Die initialisierten FIELD_DEFINITIONS
 */
export const initializeProductFieldDefinitions = (produktData: any[]): Partial<FieldDefinitions> => {
  console.log(`🚀 Initialisiere FIELD_DEFINITIONS mit ${produktData.length} Sparten`);
  
  const updates: Partial<FieldDefinitions> = {};
  
  // 1. Initialisiere Sparten-Tabelle
  const spartenEntries = produktData
    .filter(sparte => sparte.sparte && sparte.beschreibung)
    .map(sparte => ({
      id: sparte.sparte,
      beschreibung: sparte.beschreibung,
      check: sparte.check || false, // Verwende vorhandenen check-Status oder false
      zustand: sparte.verhalten || '',
      zustandsdetail: '',
      beitragNetto: parseFloat(sparte.beitragNetto || '0'),
      beitragBrutto: parseFloat(sparte.beitragBrutto || '0'),
      echteEingabe: false // Initial: keine echte User-Eingabe
    }));
  
  updates.produktSparten = { value: spartenEntries };
  console.log(`✅ ${spartenEntries.length} Sparten initialisiert`);
  
  // 2. Initialisiere Bausteine-Tabellen für jede Sparte (ALLE Bausteine für vollständige Tabellen)
  produktData.forEach(sparte => {
    if (!sparte.sparte || !sparte.bausteine) return;
    
    const tableKey = `produktBausteine_${sparte.sparte}`;
    
    // Rekursive Funktion um alle Bausteine (auch Subbausteine) zu sammeln
    const collectAllBausteine = (bausteine: any[], level: number = 0): any[] => {
      const result: any[] = [];
      
      bausteine.forEach(baustein => {
        // Nur Bausteine mit echtem knotenId (editierbare Bausteine)
        if (baustein.knotenId && baustein.knotenId.trim() !== '') {
          result.push({
            id: `${sparte.sparte}_${baustein.knotenId}`,
            beschreibung: baustein.beschreibung,
            check: baustein.check || false, // Default: false (keine echte Eingabe initial)
            betrag: parseFloat(baustein.betrag || '0'),
            betragsLabel: baustein.betragsLabel || '',
            knotenId: baustein.knotenId,
            echteEingabe: false // Initial: keine echte User-Eingabe
          });
        }
        
        // Rekursiv Subbausteine hinzufügen
        if (baustein.subBausteine && baustein.subBausteine.length > 0) {
          result.push(...collectAllBausteine(baustein.subBausteine, level + 1));
        }
      });
      
      return result;
    };
    
    const bausteineEntries = collectAllBausteine(sparte.bausteine);
    
    if (bausteineEntries.length > 0) {
      updates[tableKey] = { value: bausteineEntries };
      console.log(`✅ ${bausteineEntries.length} Bausteine (inkl. Subbausteine) für ${sparte.sparte} initialisiert`);
    }
  });
  
  return updates;
};