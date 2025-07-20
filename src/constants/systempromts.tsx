import { 
  FIELD_DEFINITIONS, 
  getAllSynonyms, 
  getValidationRules, 
  getFieldsByType,
  getDropdownFields
} from '@/constants/fieldConfig';
import { fetchDomainData } from '@/app/api/FetchDomainData';

const today = new Date();
const todayFormatted = today.toLocaleDateString('de-DE', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});
const currentYear = today.getFullYear();

// Cache für Domain-Daten
let domainDataCache: Record<string, any[]> = {};

// Hilfsfunktion zum Laden aller Domain-Daten
export const loadAllDomainData = async (): Promise<Record<string, any[]>> => {
  const dropdownFields = getDropdownFields();
  const domainIds = [...new Set(dropdownFields.map(field => field.dropdown?.domainId).filter(Boolean))];
  
  for (const domainId of domainIds) {
    if (domainId && !domainDataCache[domainId]) {
      try {
        domainDataCache[domainId] = await fetchDomainData(domainId);
      } catch (error) {
        console.error(`Error loading domain data for ${domainId}:`, error);
        domainDataCache[domainId] = [];
      }
    }
  }
  
  return domainDataCache;
};

// Dynamische Generierung der DropDown-Mappings
const generateDropdownMappings = async (): Promise<string> => {
  await loadAllDomainData();
  
  const dropdownFields = getDropdownFields();
  let mappingText = '\nDROPDOWN-FELD WERTE (verwende immer die VALUE, nicht das LABEL!):\n';
  
  dropdownFields.forEach(field => {
    if (field.dropdown?.domainId && domainDataCache[field.dropdown.domainId]) {
      mappingText += `\n${field.key.toUpperCase()} (${field.label}):\n`;
      
      const options = domainDataCache[field.dropdown.domainId];
      options.forEach(option => {
        if (option.value && option.label) { // Nur nicht-leere Werte
          mappingText += `  - VALUE: "${option.value}" = LABEL: "${option.label}"\n`;
        }
      });
      
      // Zusätzliche intelligente Mapping-Regeln basierend auf Synonymen
      if (field.synonyms && field.synonyms.length > 0) {
        mappingText += `\n  SYNONYME für ${field.key}: ${field.synonyms.join(', ')}\n`;
        
        // Generiere automatische Mapping-Regeln
        mappingText += `  MAPPING-REGELN für ${field.key}:\n`;
        options.forEach(option => {
          if (option.value && option.label) {
            // Einfache Keyword-Matching-Regeln
            const keywords = option.label.toLowerCase().split(/[\s\-\/]+/);
            const relevantKeywords = keywords.filter((k: string) => k.length > 2);
            if (relevantKeywords.length > 0) {
              mappingText += `    - "${relevantKeywords.join('" / "')}" → VALUE: "${option.value}"\n`;
            }
          }
        });
      }
    }
  });
  
  return mappingText;
};

// Erweiterte intelligente Mapping-Regeln
const generateIntelligentMappingRules = async (): Promise<string> => {
  await loadAllDomainData();
  
  let rulesText = '\nINTELLIGENTE MAPPING-REGELN:\n';
  
  const dropdownFields = getDropdownFields();
  dropdownFields.forEach(field => {
    if (field.dropdown?.domainId && domainDataCache[field.dropdown.domainId]) {
      const options = domainDataCache[field.dropdown.domainId];
      
      rulesText += `\n${field.label.toUpperCase()}:\n`;
      
      // Automatische Regeln basierend auf häufigen Mustern
      options.forEach(option => {
        if (option.value && option.label) {
          const label = option.label.toLowerCase();
          
          // Fahrerkreis spezifische Regeln
          if (field.key === 'fahrerkreis') {
            if (label.includes('einzel')) {
              rulesText += `- "allein" / "nur ich" / "einzelfahrer" / "alleiniger fahrer" → VALUE: "${option.value}"\n`;
            } else if (label.includes('partner')) {
              rulesText += `- "partner" / "ehepartner" / "mit partner" → VALUE: "${option.value}"\n`;
            } else if (label.includes('familie')) {
              rulesText += `- "familie" / "kinder" / "familienfahrer" → VALUE: "${option.value}"\n`;
            } else if (label.includes('beliebige') || label.includes('mindestalter')) {
              rulesText += `- "jeder" / "alle" / "beliebige fahrer" → VALUE: "${option.value}"\n`;
            }
          }
          
          // Wirtschaftszweig spezifische Regeln
          else if (field.key === 'wirtschaftszweig') {
            if (label.includes('landwirtschaft')) {
              rulesText += `- "landwirtschaft" / "bauer" / "landwirt" → VALUE: "${option.value}"\n`;
            } else if (label.includes('produzierend') || label.includes('unternehmen')) {
              rulesText += `- "unternehmen" / "firma" / "herstellt" / "produziert" / "möbel" / "tische" / "fabrik" → VALUE: "${option.value}"\n`;
            } else if (label.includes('finanz') || label.includes('versicherung')) {
              rulesText += `- "bank" / "versicherung" / "finanz" → VALUE: "${option.value}"\n`;
            } else if (label.includes('transport') || label.includes('logistik')) {
              rulesText += `- "transport" / "spedition" / "logistik" / "lkw" → VALUE: "${option.value}"\n`;
            }
          }
          
          // Inkassoart spezifische Regeln
          else if (field.key === 'inkassoart') {
            if (label.includes('lastschrift')) {
              rulesText += `- "lastschrift" / "einzug" / "sepa" / "abbuchung" → VALUE: "${option.value}"\n`;
            } else if (label.includes('überweisung')) {
              rulesText += `- "überweisung" / "selbst zahlen" / "dauerauftrag" → VALUE: "${option.value}"\n`;
            } else if (label.includes('vermittler')) {
              rulesText += `- "vermittler" / "makler" / "über makler" → VALUE: "${option.value}"\n`;
            }
          }
          
          // Allgemeine Regel: Direkte Label-Erkennung
          else {
            const keywords = label.split(/[\s\-\/]+/).filter((k: string) => k.length > 2);
            if (keywords.length > 0) {
              rulesText += `- "${keywords.join('" / "')}" → VALUE: "${option.value}"\n`;
            }
          }
        }
      });
    }
  });
  
  return rulesText;
};

// Dynamische Generierung des System Prompts
export const generateSystemPrompt = async (): Promise<string> => {
  const fieldKeys = FIELD_DEFINITIONS.map(field => field.key).join(', ');
  const correctionRules = getValidationRules();
  
  // Generiere Korrektur-Regeln String
  const correctionRulesText = Object.entries(correctionRules)
    .map(([key, rules]) => rules.map(rule => `${key}: ${rule}`))
    .flat()
    .join('\n');

  // Lade Domain-Daten dynamisch
  const dropdownMappingsText = await generateDropdownMappings();
  const intelligentMappingRules = await generateIntelligentMappingRules();

  // Generiere JSON-Schema dynamisch
  const jsonSchema = FIELD_DEFINITIONS.reduce((schema, field) => {
    const defaultValue = field.type === 'date' ? null : 
                        field.type === 'number' ? 0 : 
                        field.type === 'boolean' ? false : 
                        field.type === 'tristate' ? null :
                        field.type === 'table' ? [] :
                        field.type === 'dropdown' ? null : null;
    
    schema[field.key] = {
      value: defaultValue,
      confidence: 0.0,
      source: "",
      corrected: false,
      originalValue: null
    };
    return schema;
  }, {} as Record<string, any>);

  return `Du bist ein Experte für deutsche Fahrzeugdaten-Extraktion. Heute ist ${todayFormatted}.

FELDER: ${fieldKeys}

${dropdownMappingsText}

${intelligentMappingRules}

KORREKTUR-REGELN:
${correctionRulesText}
- Kein Jahr → aktuelles Jahr (${currentYear})
- Neuwagen: Erstzulassungsdatum = Anmeldedatum

JSON-FORMAT:
{
  "extractedData": ${JSON.stringify(jsonSchema, null, 2)},
  "overallConfidence": 0.85,
  "validationErrors": [],
  "suggestions": [],
  "recognizedPhrases": [],
  "explanation": "",
  "isNewVehicle": false,
  "appliedCorrections": []
}

TABELLEN-DATEN (kilometerstaende, zubehoer):
- IMMER als Array von Objekten zurückgeben
- Jedes Objekt MUSS eine "id" haben (generiere UUID-ähnlich)
- Nutze die exakten Spalten-Keys aus der Konfiguration

Beispiel für kilometerstaende:
"kilometerstaende": {
  "value": [
    {
      "id": "km_001",
      "datum": "2024-07-15",
      "art": "A",
      "kmstand": 22000
    }
  ],
  "confidence": 0.9,
  "source": "Text-Bereich"
}

WICHTIG: 
- Für DropDown-Felder IMMER den VALUE verwenden, nicht das LABEL!
- Tabellen-Daten als Array strukturieren
- NUR JSON zurückgeben, keine Erklärungen außerhalb!`;
};

// Cached System Prompt für Performance
let cachedSystemPrompt: string | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 Minuten

export const SYSTEM_PROMPT_FAHRZEUGDATEN = async (): Promise<string> => {
  const now = Date.now();
  
  if (cachedSystemPrompt && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedSystemPrompt;
  }
  
  cachedSystemPrompt = await generateSystemPrompt();
  cacheTimestamp = now;
  
  return cachedSystemPrompt;
};

// Synchrone Version für Backwards Compatibility (lädt Domain-Daten im Hintergrund)
export const SYSTEM_PROMPT_FAHRZEUGDATEN_SYNC = (() => {
  // Lade Domain-Daten asynchron im Hintergrund
  loadAllDomainData().catch(console.error);
  
  // Basis-Prompt ohne Domain-spezifische Daten für sofortige Verwendung
  const fieldKeys = FIELD_DEFINITIONS.map(field => field.key).join(', ');
  const correctionRules = getValidationRules();
  
  const correctionRulesText = Object.entries(correctionRules)
    .map(([key, rules]) => rules.map(rule => `${key}: ${rule}`))
    .flat()
    .join('\n');

  const jsonSchema = FIELD_DEFINITIONS.reduce((schema, field) => {
    const defaultValue = field.type === 'date' ? null : 
                        field.type === 'number' ? 0 : 
                        field.type === 'boolean' ? false : 
                        field.type === 'tristate' ? null :
                        field.type === 'table' ? [] :
                        field.type === 'dropdown' ? null : null;
    
    schema[field.key] = {
      value: defaultValue,
      confidence: 0.0,
      source: "",
      corrected: false,
      originalValue: null
    };
    return schema;
  }, {} as Record<string, any>);

  return `Du bist ein Experte für deutsche Fahrzeugdaten-Extraktion. Heute ist ${todayFormatted}.

FELDER: ${fieldKeys}

KORREKTUR-REGELN:
${correctionRulesText}
- Kein Jahr → aktuelles Jahr (${currentYear})
- Neuwagen: Erstzulassungsdatum = Anmeldedatum

JSON-FORMAT:
{
  "extractedData": ${JSON.stringify(jsonSchema, null, 2)},
  "overallConfidence": 0.85,
  "validationErrors": [],
  "suggestions": [],
  "recognizedPhrases": [],
  "explanation": "",
  "isNewVehicle": false,
  "appliedCorrections": []
}

TABELLEN-DATEN (kilometerstaende, zubehoer):
- IMMER als Array von Objekten zurückgeben
- Jedes Objekt MUSS eine "id" haben (generiere UUID-ähnlich)
- Nutze die exakten Spalten-Keys aus der Konfiguration

Beispiel für kilometerstaende:
"kilometerstaende": {
  "value": [
    {
      "id": "km_001",
      "datum": "2024-07-15",
      "art": "A",
      "kmstand": 22000
    }
  ],
  "confidence": 0.9,
  "source": "Text-Bereich"
}

WICHTIG: 
- Für DropDown-Felder IMMER den VALUE verwenden, nicht das LABEL!
- Tabellen-Daten als Array strukturieren
- NUR JSON zurückgeben, keine Erklärungen außerhalb!`;
})();

// Dynamische Synonyme basierend auf Konfiguration
export const FAHRZEUGDATEN_REGELN = {
  synonyme: getAllSynonyms(),
  
  stornodatumMuster: [
    "musste ich es am [Datum] abmelden",
    "aufgrund [Grund] am [Datum] abmelden", 
    "wegen [Grund] am [Datum] stilllegen",
    "obwohl... gelaufen wäre, musste... am [Datum]",
    "nach Unfall am [Datum]"
  ],
  
  neuwagen: ["neues Auto", "Neuwagen", "wird geliefert", "Lieferung", "Hersteller verspricht"]
};

// Optimierte Prompt-Erstellung für spezifische Fälle
export function createContextualPrompt(text: string, currentValues: any): string {
  const hasStorno = text.includes("musste") || text.includes("aufgrund") || text.includes("wegen") || text.includes("abmelden");
  const hasUrbeginn = text.includes("erstes") || text.includes("vor") || text.includes("Jahren");
  const hasNeuwagen = text.includes("neues") || text.includes("Neuwagen") || text.includes("Lieferung");
  
  let contextHints = "";
  
  if (hasStorno) {
    contextHints += "\nACHTUNG: Text enthält Storno-Indikatoren! Suche nach 'musste...abmelden', 'aufgrund...am', 'wegen...am'.";
  }
  
  if (hasUrbeginn) {
    contextHints += "\nACHTUNG: Text enthält Urbeginn-Indikatoren! Suche nach 'erstes Fahrzeug', 'vor X Jahren'.";
  }
  
  if (hasNeuwagen) {
    contextHints += "\nACHTUNG: Neuwagen erkannt! Erstzulassungsdatum = Anmeldedatum setzen.";
  }
  
  // DropDown-spezifische Hinweise basierend auf geladenen Domain-Daten
  const dropdownFields = getDropdownFields();
  dropdownFields.forEach(field => {
    if (field.synonyms.some(synonym => text.toLowerCase().includes(synonym.toLowerCase()))) {
      contextHints += `\nACHTUNG: ${field.label} erkannt → Verwende VALUE aus Domain-Daten!`;
    }
  });
  
  // Dynamische Feld-Hinweise basierend auf Konfiguration
  FIELD_DEFINITIONS.forEach(field => {
    if (field.ai?.context && field.synonyms.some(synonym => text.toLowerCase().includes(synonym.toLowerCase()))) {
      contextHints += `\nKONTEXT ${field.key}: ${field.ai.context}`;
      
      // Spezielle DropDown-Hinweise
      if (field.type === 'dropdown' && field.dropdown?.domainId) {
        contextHints += `\n→ Verwende VALUE aus ${field.dropdown.domainId}, nicht das Label!`;
      }
    }
  });
  
  return `Text: "${text}"${contextHints}

Aktuelle Werte: ${JSON.stringify(currentValues)}

WICHTIG: Für DropDown-Felder IMMER den VALUE verwenden, nicht das Label!
Extrahiere nur neue/geänderte Daten. Wende Korrektur-Regeln an.`;
}

// Hilfsfunktion für die Validierung der extrahierten Daten
export function validateExtractedData(extractedData: any): string[] {
  const errors: string[] = [];
  
  FIELD_DEFINITIONS.forEach(field => {
    const value = extractedData[field.key]?.value;
    
    if (field.required && !value) {
      errors.push(`${field.label} ist ein Pflichtfeld`);
    }
    
    if (field.type === 'date' && value) {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        errors.push(`${field.label} enthält ein ungültiges Datum`);
      }
    }
    
    if (field.type === 'number' && value !== null) {
      const num = Number(value);
      if (isNaN(num)) {
        errors.push(`${field.label} muss eine Zahl sein`);
      }
      if (field.validation?.min !== undefined && num < Number(field.validation.min)) {
        errors.push(`${field.label} muss mindestens ${field.validation.min} sein`);
      }
      if (field.validation?.max !== undefined && num > Number(field.validation.max)) {
        errors.push(`${field.label} darf maximal ${field.validation.max} sein`);
      }
    }
    
    // DropDown-Validierung gegen geladene Domain-Daten
    if (field.type === 'dropdown' && value && field.dropdown?.domainId) {
      const domainOptions = domainDataCache[field.dropdown.domainId] || [];
      const validValues = domainOptions.map(option => option.value).filter(Boolean);
      if (!validValues.includes(value)) {
        errors.push(`${field.label} enthält einen ungültigen Wert: ${value}. Erlaubte Werte: ${validValues.join(', ')}`);
      }
    }
  });
  
  return errors;
}

// Hilfsfunktion zur automatischen Konvertierung von Labels zu Values
export async function convertLabelsToValues(extractedData: any): Promise<any> {
  await loadAllDomainData();
  
  const convertedData = { ...extractedData };
  
  FIELD_DEFINITIONS.forEach(field => {
    if (field.type === 'dropdown' && field.dropdown?.domainId) {
      const value = extractedData[field.key]?.value;
      if (value && typeof value === 'string') {
        const domainOptions = domainDataCache[field.dropdown.domainId] || [];
        
        // Suche nach exaktem Label-Match
        const matchByLabel = domainOptions.find(option => 
          option.label && option.label.toLowerCase() === value.toLowerCase()
        );
        
        if (matchByLabel && matchByLabel.value) {
          convertedData[field.key] = {
            ...extractedData[field.key],
            value: matchByLabel.value,
            originalValue: value,
            corrected: true
          };
        }
      }
    }
  });
  
  return convertedData;
}