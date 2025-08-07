/**
 * Helper-Funktionen für FIELD_DEFINITIONS Single Point of Truth
 * Zentrale Logik für Sparten/Baustein State Management
 */

import { FIELD_DEFINITIONS } from '@/constants/fieldConfig';

// Interface für Sparten-Aktion von Claude AI
interface SpartenAction {
  active: boolean;
  reason: string;
}

// Interface für Baustein-Aktion von Claude AI
interface BausteinAction {
  sparte: string;
  knotenId: string;
  beschreibung: string;
  active: boolean;
  betrag?: number;
  reason: string;
}

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
 * Liest den Betrag eines Bausteins aus FIELD_DEFINITIONS
 * @param knotenId - Die knotenId des Bausteins
 * @param sparte - Der Sparten-Code
 * @param fieldDefinitions - Die aktuellen FIELD_DEFINITIONS
 * @returns number - Der Betrag aus FIELD_DEFINITIONS oder 0 als Fallback
 */
export const getBetrag = (knotenId: string, sparte: string, fieldDefinitions: FieldDefinitions): number => {
  try {
    const tableKey = `produktBausteine_${sparte}`;
    const bausteineData = fieldDefinitions[tableKey]?.value || [];
    const bausteinEntry = bausteineData.find((b: any) => b.knotenId === knotenId);
    const betrag = parseFloat(bausteinEntry?.betrag || '0');
    
    return betrag;
    
  } catch (error) {
    console.error(`❌ Fehler in getBetrag(${knotenId}, ${sparte}):`, error);
    return 0;
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
 * WICHTIG: Überschreibt KEINE bestehenden User-Eingaben!
 * @param produktData - Die Daten aus fetchProduktData()
 * @param currentFieldDefinitions - Aktuelle FIELD_DEFINITIONS (um User-Eingaben zu prüfen)
 * @returns Partial<FieldDefinitions> - Die initialisierten FIELD_DEFINITIONS
 */
export const initializeProductFieldDefinitions = (
  produktData: any[], 
  currentFieldDefinitions?: FieldDefinitions
): Partial<FieldDefinitions> => {
  console.log(`🚀 Initialisiere FIELD_DEFINITIONS mit ${produktData.length} Sparten`);
  
  // Prüfe ob bereits User-Eingaben für Produktsparten vorhanden sind (Row-Level + Field-Level)
  const hasExistingSpartenRowData = currentFieldDefinitions?.produktSparten?.value && 
    Array.isArray(currentFieldDefinitions.produktSparten.value) && 
    currentFieldDefinitions.produktSparten.value.length > 0 &&
    currentFieldDefinitions.produktSparten.value.some((s: any) => s.echteEingabe === true);
  
  // Prüfe auch Field-Level echteEingabe (wichtig für generateEchteEingabeValues)
  const produktSpartenField = FIELD_DEFINITIONS.find(f => f.key === 'produktSparten');
  const hasExistingSpartenFieldData = produktSpartenField?.echteEingabe !== undefined && 
    produktSpartenField?.echteEingabe !== produktSpartenField?.defaultValue;
  
  if (hasExistingSpartenRowData || hasExistingSpartenFieldData) {
    console.log(`🔄 MERGE: Produktsparten bereits mit User-Eingaben vorhanden - merge mit neuen Strukturdaten!`);
    // Führe intelligente Merge-Operation durch statt komplett zu skippen
    return mergeProductDataWithExistingUserData(produktData, currentFieldDefinitions);
  }
  
  const updates: Partial<FieldDefinitions> = {};
  
  // 1. Initialisiere Sparten-Tabelle
  const spartenEntries = produktData
    .filter(sparte => sparte.sparte && sparte.beschreibung)
    .map(sparte => {
      const isChecked = sparte.check || false;
      return {
        id: sparte.sparte,
        beschreibung: sparte.beschreibung,
        check: isChecked,
        zustand: isChecked ? 'A' : ' ', // Bei angeixten Sparten "A" (Aktiv), sonst " " (Leerzeichen)
        stornogrund: ' ', // Immer Leerzeichen als Standard
        beitragNetto: parseFloat(sparte.beitragNetto || '0'),
        beitragBrutto: parseFloat(sparte.beitragBrutto || '0'),
        echteEingabe: false // Initial: keine echte User-Eingabe
      };
    });
  
  updates.produktSparten = { value: spartenEntries };
  console.log(`✅ ${spartenEntries.length} Sparten initialisiert`);
  
  // 2. Initialisiere Bausteine-Tabellen für jede Sparte (ALLE Bausteine für vollständige Tabellen)
  produktData.forEach(sparte => {
    if (!sparte.sparte || !sparte.bausteine) return;
    
    const tableKey = `produktBausteine_${sparte.sparte}`;
    
    // Prüfe ob bereits User-Eingaben für diese Bausteine vorhanden sind
    const hasExistingBausteineData = currentFieldDefinitions?.[tableKey]?.value && 
      Array.isArray(currentFieldDefinitions[tableKey].value) && 
      currentFieldDefinitions[tableKey].value.length > 0 &&
      currentFieldDefinitions[tableKey].value.some((b: any) => b.echteEingabe === true);
    
    if (hasExistingBausteineData) {
      console.log(`⏭️ SKIP: ${tableKey} bereits mit User-Eingaben vorhanden - überschreibe NICHT!`);
      return; // Skip diese Sparte
    }
    
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


/**
 * Verarbeitet spartenActions von Claude AI und aktualisiert FIELD_DEFINITIONS
 * Nutzt dieselbe Logik wie handleSparteCheckChange aus MotorProduktSpartenTree,
 * aber verarbeitet mehrere Sparten in einem Batch-Update.
 * @param spartenActions - Die spartenActions von Claude AI
 * @param fieldDefinitions - Die aktuellen FIELD_DEFINITIONS
 * @returns Updates für FIELD_DEFINITIONS (alle Änderungen in einem Update)
 */
export const processSpartenActions = (
  spartenActions: Record<string, SpartenAction>,
  fieldDefinitions: FieldDefinitions
): Record<string, any> => {
  console.log('🤖 Verarbeite spartenActions von Claude AI:', spartenActions);
  
  // Arbeite mit einer lokalen Kopie der spartenData, um alle Änderungen zu sammeln
  const spartenData = [...(fieldDefinitions.produktSparten?.value || [])];
  let hasChanges = false;
  
  // Verarbeite alle spartenActions auf der lokalen Kopie
  Object.entries(spartenActions).forEach(([sparteCode, action]) => {
    console.log(`🤖 KI-Update: Sparte ${sparteCode} = ${action.active ? 'aktivieren' : 'deaktivieren'} (${action.reason})`);
    
    // Ignoriere "nicht explizit erwähnt" Fälle - keine Änderung an bestehenden Sparten
    if (!action.active && action.reason.toLowerCase().includes('nicht explizit erwähnt')) {
      console.log(`⏭️ Sparte ${sparteCode} übersprungen: nicht explizit erwähnt (keine Änderung)`);
      return;
    }
    
    const sparteFieldIndex = spartenData.findIndex((s: any) => s.id === sparteCode);
    
    if (sparteFieldIndex >= 0) {
      const oldCheck = spartenData[sparteFieldIndex].check;
      const newCheck = action.active;
      
      // Nur updaten wenn sich der Zustand ändert
      if (oldCheck !== newCheck) {
        spartenData[sparteFieldIndex] = { 
          ...spartenData[sparteFieldIndex], 
          check: newCheck,
          echteEingabe: true, // Markiere als echte Eingabe (von KI)
          zustand: newCheck ? 'A' : ' ', // Bei Aktivierung "A" (Aktiv), bei Deaktivierung " " (Leerzeichen)
          stornogrund: ' ' // Zustandsdetail immer leer, da weder "A" noch " " = "S" (Storniert)
        };
        
        console.log(`✅ Sparte ${sparteCode} aktualisiert: ${oldCheck} → ${newCheck}`, spartenData[sparteFieldIndex]);
        hasChanges = true;
      } else {
        console.log(`ℹ️ Sparte ${sparteCode} bereits im gewünschten Zustand: ${newCheck}`);
      }
    } else {
      console.warn(`⚠️ Sparte ${sparteCode} nicht in FIELD_DEFINITIONS gefunden`);
    }
  });
  
  // Nur zurückgeben wenn es Änderungen gab
  if (hasChanges) {
    const updates = {
      produktSparten: { value: spartenData }
    };
    console.log('🔄 Finale Sparten-Updates für FIELD_DEFINITIONS:', updates);
    return updates;
  } else {
    console.log('ℹ️ Keine Sparten-Änderungen notwendig');
    return {};
  }
};

/**
 * Intelligente Baustein-Matching-Logik für Claude AI knotenId → reale KnotenId
 * 
 * LANGFRISTIGE ERWEITERUNG: Der Produktservice könnte um ein "synonyme" Feld erweitert werden:
 * {
 *   knotenId: "KBV00002",
 *   beschreibung: "Selbstbeteiligung Vollkasko", 
 *   synonyme: ["vollkasko_sb", "vk_sb", "selbstbeteiligung_vollkasko"]
 * }
 * 
 * @param claudeKnotenId - Die von Claude AI gelieferte semantische knotenId (z.B. "teilkasko_sb")
 * @param claudeBeschreibung - Die von Claude AI gelieferte Beschreibung 
 * @param sparte - Der Sparten-Code (KH, KK, EK, KU)
 * @param bausteineData - Die verfügbaren Bausteine für diese Sparte
 * @returns Gefundenen Baustein oder null
 */
const findBausteinByIntelligentMatching = (
  claudeKnotenId: string,
  claudeBeschreibung: string,
  sparte: string,
  bausteineData: any[]
): any | null => {
  console.log(`🧠 Intelligente Suche: claudeKnotenId="${claudeKnotenId}", beschreibung="${claudeBeschreibung}", sparte="${sparte}"`);
  
  // 1. Exakte KnotenId-Übereinstimmung (falls Claude zufällig die echte ID hat)
  let match = bausteineData.find((b: any) => b.knotenId === claudeKnotenId);
  if (match) {
    console.log(`✅ Exakte KnotenId-Übereinstimmung gefunden: ${match.knotenId}`);
    return match;
  }
  
  // 1.5. Zukünftige Synonyme-Unterstützung (wenn Produktservice erweitert wird)
  match = bausteineData.find((b: any) => 
    b.synonyme && Array.isArray(b.synonyme) && 
    b.synonyme.includes(claudeKnotenId)
  );
  if (match) {
    console.log(`✅ Synonyme-Übereinstimmung gefunden: ${match.knotenId} (Synonym: ${claudeKnotenId})`);
    return match;
  }
  
  // 2. Keyword-basierte Matching-Regeln
  const matchingRules: Record<string, { keywords: string[]; betragsLabel?: string; sparten?: string[] }> = {
    // Selbstbeteiligung Patterns
    "teilkasko_sb": { 
      keywords: ["teilkasko", "selbstbeteiligung"], 
      betragsLabel: "Selbstbeteiligung",
      sparten: ["EK", "KK"] // Teilkasko kann auch in Vollkasko-Sparte sein
    },
    "vollkasko_sb": { 
      keywords: ["vollkasko", "selbstbeteiligung"], 
      betragsLabel: "Selbstbeteiligung",
      sparten: ["KK"]
    },
    "vk_sb": { 
      keywords: ["vollkasko", "selbstbeteiligung"], 
      betragsLabel: "Selbstbeteiligung",
      sparten: ["KK"]
    },
    "tk_sb": { 
      keywords: ["teilkasko", "selbstbeteiligung"], 
      betragsLabel: "Selbstbeteiligung",
      sparten: ["EK", "KK"]
    },
    // Schutzbrief Patterns
    "schutzbrief": { 
      keywords: ["schutzbrief", "premium"], 
      sparten: ["KH", "KK", "EK", "KU"]
    },
    "premium_schutzbrief": { 
      keywords: ["premium", "schutzbrief"], 
      sparten: ["KH", "KK", "EK", "KU"]
    },
    // Weitere häufige Patterns
    "neuwert": { 
      keywords: ["neupreis", "neuwert", "entschädigung"], 
      sparten: ["KK"]
    },
    "werkstatt": { 
      keywords: ["werkstatt", "reparatur", "partner"], 
      sparten: ["KK", "EK"]
    }
  };
  
  // 3. Anwendung der Matching-Regeln
  const rule = matchingRules[claudeKnotenId.toLowerCase()];
  if (rule) {
    console.log(`🔍 Anwendung Regel für "${claudeKnotenId}":`, rule);
    
    // Sparten-Check (falls Regel sparten-spezifisch ist)
    if (rule.sparten && !rule.sparten.includes(sparte)) {
      console.log(`⚠️ Sparte ${sparte} nicht in erlaubten Sparten ${rule.sparten.join(', ')}`);
      return null;
    }
    
    // Suche nach Keywords in Beschreibung
    match = bausteineData.find((b: any) => {
      const beschreibung = (b.beschreibung || '').toLowerCase();
      const betragsLabel = (b.betragsLabel || '').toLowerCase();
      
      // Prüfe ob alle Keywords vorkommen
      const keywordMatch = rule.keywords.every(keyword => 
        beschreibung.includes(keyword.toLowerCase()) || 
        betragsLabel.includes(keyword.toLowerCase())
      );
      
      // Zusätzlicher Check auf BetragsLabel falls definiert
      const betragsLabelMatch = !rule.betragsLabel || 
        betragsLabel.includes(rule.betragsLabel.toLowerCase());
      
      return keywordMatch && betragsLabelMatch;
    });
    
    if (match) {
      console.log(`✅ Keyword-Match gefunden: ${match.knotenId} - ${match.beschreibung}`);
      return match;
    }
  }
  
  // 4. Fallback: Fuzzy-Matching auf Claude-Beschreibung
  if (claudeBeschreibung) {
    console.log(`🔍 Fallback: Fuzzy-Matching auf Beschreibung "${claudeBeschreibung}"`);
    
    const beschreibungWords = claudeBeschreibung.toLowerCase().split(/\s+/);
    
    // Suche nach Baustein mit höchster Übereinstimmung
    let bestMatch: any = null;
    let bestScore = 0;
    
    bausteineData.forEach((b: any) => {
      const bausteinBeschreibung = (b.beschreibung || '').toLowerCase();
      const bausteinBetragsLabel = (b.betragsLabel || '').toLowerCase();
      const combinedText = `${bausteinBeschreibung} ${bausteinBetragsLabel}`;
      
      // Score basierend auf gemeinsamen Wörtern
      let score = 0;
      beschreibungWords.forEach(word => {
        if (word.length > 2 && combinedText.includes(word)) {
          score += word.length; // Längere Wörter bekommen höhere Gewichtung
        }
      });
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = b;
      }
    });
    
    if (bestMatch && bestScore > 3) { // Mindest-Score für Relevanz
      console.log(`✅ Fuzzy-Match gefunden: ${bestMatch.knotenId} - ${bestMatch.beschreibung} (Score: ${bestScore})`);
      return bestMatch;
    }
  }
  
  console.log(`❌ Kein Match gefunden für "${claudeKnotenId}" in Sparte ${sparte}`);
  return null;
};

/**
 * Verarbeitet bausteinActions von Claude AI und aktualisiert FIELD_DEFINITIONS
 * Nutzt intelligente Matching-Logik um Claude's semantische knotenIds auf echte Bausteine zu mappen.
 * @param bausteinActions - Die bausteinActions von Claude AI
 * @param fieldDefinitions - Die aktuellen FIELD_DEFINITIONS
 * @returns Updates für FIELD_DEFINITIONS (alle Änderungen in einem Update)
 */
export const processBausteinActions = (
  bausteinActions: BausteinAction[],
  fieldDefinitions: FieldDefinitions
): Record<string, any> => {
  console.log('🤖 Verarbeite bausteinActions von Claude AI:', bausteinActions);
  
  const allUpdates: Record<string, any> = {};
  let hasChanges = false;
  
  // Gruppiere Bausteine nach Sparten für effiziente Verarbeitung
  const bausteineBySpart: Record<string, BausteinAction[]> = {};
  bausteinActions.forEach(action => {
    if (!bausteineBySpart[action.sparte]) {
      bausteineBySpart[action.sparte] = [];
    }
    bausteineBySpart[action.sparte].push(action);
  });
  
  // Verarbeite jede Sparte
  Object.entries(bausteineBySpart).forEach(([sparteCode, sparteActions]) => {
    const tableKey = `produktBausteine_${sparteCode}`;
    console.log(`🔧 Verarbeite Bausteine für Sparte ${sparteCode}:`, sparteActions);
    
    // Arbeite mit einer lokalen Kopie der Baustein-Daten
    const bausteineData = [...(fieldDefinitions[tableKey]?.value || [])];
    
    sparteActions.forEach(action => {
      console.log(`🤖 Baustein-Update: ${action.knotenId} = ${action.active ? 'aktivieren' : 'deaktivieren'} (${action.reason})`);
      
      // Ignoriere "nicht explizit erwähnt" Fälle
      if (!action.active && action.reason.toLowerCase().includes('nicht explizit erwähnt')) {
        console.log(`⏭️ Baustein ${action.knotenId} übersprungen: nicht explizit erwähnt (keine Änderung)`);
        return;
      }
      
      // Finde den Baustein mit intelligenter Matching-Logik
      const matchedBaustein = findBausteinByIntelligentMatching(
        action.knotenId,
        action.beschreibung,
        sparteCode,
        bausteineData
      );
      
      if (matchedBaustein) {
        const bausteinIndex = bausteineData.findIndex((b: any) => b.knotenId === matchedBaustein.knotenId);
        const oldCheck = bausteineData[bausteinIndex].check;
        const oldBetrag = bausteineData[bausteinIndex].betrag;
        const newCheck = action.active;
        const newBetrag = action.betrag !== undefined ? action.betrag : oldBetrag;
        
        // Prüfe ob sich etwas ändert
        if (oldCheck !== newCheck || oldBetrag !== newBetrag) {
          bausteineData[bausteinIndex] = {
            ...bausteineData[bausteinIndex],
            check: newCheck,
            betrag: newBetrag,
            echteEingabe: true // Markiere als echte Eingabe (von KI)
          };
          
          console.log(`✅ Baustein ${matchedBaustein.knotenId} (Claude: ${action.knotenId}) aktualisiert: check ${oldCheck}→${newCheck}, betrag ${oldBetrag}→${newBetrag}`);
          hasChanges = true;
        } else {
          console.log(`ℹ️ Baustein ${matchedBaustein.knotenId} (Claude: ${action.knotenId}) bereits im gewünschten Zustand`);
        }
      } else {
        console.warn(`⚠️ Intelligente Suche für Claude-Baustein "${action.knotenId}" in ${tableKey} erfolglos`);
      }
    });
    
    // Speichere Updates für diese Sparte
    if (bausteineData.length > 0) {
      allUpdates[tableKey] = { value: bausteineData };
    }
  });
  
  if (hasChanges) {
    console.log('🔄 Finale Baustein-Updates für FIELD_DEFINITIONS:', allUpdates);
    return allUpdates;
  } else {
    console.log('ℹ️ Keine Baustein-Änderungen notwendig');
    return {};
  }
};

/**
 * Intelligente Merge-Operation: Kombiniert neue Produktdaten mit bestehenden User-Eingaben
 * WICHTIG: Überschreibt NIEMALS echteEingabe=true Markierungen!
 * @param produktData - Neue Produktdaten aus fetchProduktData()
 * @param currentFieldDefinitions - Bestehende FIELD_DEFINITIONS mit User-Eingaben
 * @returns Partial<FieldDefinitions> - Gemergete Daten mit User-Eingaben geschützt
 */
export function mergeProductDataWithExistingUserData(
  produktData: any[], 
  currentFieldDefinitions?: FieldDefinitions
): Partial<FieldDefinitions> {
  console.log(`🔄 Starte intelligente Merge-Operation...`);
  console.log(`📊 Produktdaten:`, produktData.length, `Sparten`);
  console.log(`📊 Bestehende FieldDefinitions:`, Object.keys(currentFieldDefinitions || {}));
  
  const updates: Partial<FieldDefinitions> = {};
  
  // 1. MERGE PRODUKTSPARTEN: Kombiniere neue Struktur mit bestehenden User-Eingaben
  console.log(`🔄 Merge Produktsparten...`);
  const existingSpartenData = currentFieldDefinitions?.produktSparten?.value || [];
  const newSpartenEntries = produktData
    .filter(sparte => sparte.sparte && sparte.beschreibung)
    .map(sparte => {
      // Suche bestehende User-Eingabe für diese Sparte
      const existingSparte = existingSpartenData.find((s: any) => s.id === sparte.sparte);
      
      if (existingSparte && existingSparte.echteEingabe === true) {
        console.log(`🔒 PRESERVE User-Eingabe: Sparte ${sparte.sparte} (echteEingabe: true)`);
        // Behalte User-Eingaben, aktualisiere nur Struktur-Daten
        return {
          ...existingSparte, // User-Eingaben bleiben erhalten (check, zustand, stornogrund, echteEingabe)
          beschreibung: sparte.beschreibung, // Struktur-Update
          beitragNetto: parseFloat(sparte.beitragNetto || '0'), // Struktur-Update
          beitragBrutto: parseFloat(sparte.beitragBrutto || '0') // Struktur-Update
          // echteEingabe bleibt true!
        };
      } else {
        console.log(`🆕 NEW/UPDATE Struktur: Sparte ${sparte.sparte} (keine User-Eingabe)`);
        // Neue Sparte oder keine User-Eingabe vorhanden
        const isChecked = sparte.check || false;
        return {
          id: sparte.sparte,
          beschreibung: sparte.beschreibung,
          check: isChecked,
          zustand: isChecked ? 'A' : ' ',
          stornogrund: ' ',
          beitragNetto: parseFloat(sparte.beitragNetto || '0'),
          beitragBrutto: parseFloat(sparte.beitragBrutto || '0'),
          echteEingabe: false // Keine User-Eingabe vorhanden
        };
      }
    });
  
  updates.produktSparten = { value: newSpartenEntries };
  console.log(`✅ ${newSpartenEntries.length} Sparten gemerged`);
  
  // 2. MERGE PRODUKTBAUSTEINE: Für jede Sparte, kombiniere neue Struktur mit User-Eingaben
  console.log(`🔄 Merge Produktbausteine...`);
  produktData.forEach(sparte => {
    if (!sparte.sparte || !sparte.bausteine) return;
    
    const tableKey = `produktBausteine_${sparte.sparte}`;
    const existingBausteineData = currentFieldDefinitions?.[tableKey]?.value || [];
    
    console.log(`🔍 Merge ${tableKey}: ${existingBausteineData.length} bestehende vs ${sparte.bausteine.length} neue`);
    
    // Rekursive Sammlung aller neuen Bausteine
    const collectAllBausteine = (bausteine: any[], level: number = 0): any[] => {
      const result: any[] = [];
      
      bausteine.forEach(baustein => {
        if (baustein.knotenId && baustein.knotenId.trim() !== '') {
          // Suche bestehende User-Eingabe für diesen Baustein
          const existingBaustein = existingBausteineData.find((b: any) => b.knotenId === baustein.knotenId);
          
          if (existingBaustein && existingBaustein.echteEingabe === true) {
            console.log(`🔒 PRESERVE User-Eingabe: Baustein ${baustein.knotenId} (echteEingabe: true)`);
            // Behalte User-Eingaben, aktualisiere nur Struktur
            result.push({
              ...existingBaustein, // User-Eingaben bleiben (check, betrag, echteEingabe)
              beschreibung: baustein.beschreibung, // Struktur-Update
              betragsLabel: baustein.betragsLabel || '', // Struktur-Update
              // echteEingabe bleibt true!
            });
          } else {
            console.log(`🆕 NEW/UPDATE Struktur: Baustein ${baustein.knotenId} (keine User-Eingabe)`);
            // Neuer Baustein oder keine User-Eingabe
            result.push({
              id: `${sparte.sparte}_${baustein.knotenId}`,
              beschreibung: baustein.beschreibung,
              check: baustein.check || false,
              betrag: parseFloat(baustein.betrag || '0'),
              betragsLabel: baustein.betragsLabel || '',
              knotenId: baustein.knotenId,
              echteEingabe: false // Keine User-Eingabe
            });
          }
        }
        
        // Rekursiv für Subbausteine
        if (baustein.subBausteine && baustein.subBausteine.length > 0) {
          result.push(...collectAllBausteine(baustein.subBausteine, level + 1));
        }
      });
      
      return result;
    };
    
    const mergedBausteineEntries = collectAllBausteine(sparte.bausteine);
    
    if (mergedBausteineEntries.length > 0) {
      updates[tableKey] = { value: mergedBausteineEntries };
      console.log(`✅ ${mergedBausteineEntries.length} Bausteine für ${sparte.sparte} gemerged`);
    }
  });
  
  console.log(`✅ Merge-Operation abgeschlossen. Updates:`, Object.keys(updates));
  return updates;
}