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

// Interface für Domain-Option
interface DomainOption {
  value: string;
  label: string;
}

// Cache für Domain-Daten
const domainDataCache: Record<string, DomainOption[]> = {};

// Hilfsfunktion zum Laden aller Domain-Daten
export const loadAllDomainData = async (): Promise<Record<string, DomainOption[]>> => {
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

// Artifact-basierte DropDown-Referenzierung (Token-optimiert)
const generateArtifactBasedDropdownMappings = (): string => {
  const tableFields = getFieldsByType('table');
  
  // Nur Tabellen-relevante Domains referenzieren
  const tableDropdownDomains = new Set<string>();
  tableFields.forEach(field => {
    if (field.table?.columns) {
      field.table.columns.forEach(column => {
        if (column.dropdown?.domainId) {
          tableDropdownDomains.add(column.dropdown.domainId);
        }
      });
    }
  });
  
  if (tableDropdownDomains.size === 0) {
    return '\nKeine Tabellen-DropDown-Domains konfiguriert.\n';
  }
  
  let mappingText = '\nDROPDOWN-DOMAIN-REFERENZ (Token-optimiert via Artifact):\n';
  mappingText += 'Domain-Daten verfügbar in Artifact "fahrzeug-domains.json"\n\n';
  
  Array.from(tableDropdownDomains).forEach(domainId => {
    mappingText += `DOMAIN: ${domainId}\n`;
    mappingText += `- Nutze VALUE aus Artifact-Domain "${domainId}"\n`;
    mappingText += `- Bei Texterkennung: Label→Value-Mapping via Artifact\n`;
    mappingText += `- Fallback: Intelligente Keyword-Zuordnung\n\n`;
  });
  
  return mappingText;
};

// Artifact-basierte intelligente Mapping-Regeln (Token-optimiert)
const generateArtifactBasedMappingRules = (): string => {
  let rulesText = '\nARTIFACT-BASIERTE MAPPING-REGELN:\n';
  rulesText += 'Nutze Domain-Mapping aus Artifact "fahrzeug-domains.json"\n\n';
  
  // Nur die wichtigsten Tabellen-Domain-Regeln einbinden
  rulesText += 'KILOMETERSTAND-ART (KraftBoGruppeMoeglKmAngabeGrund):\n';
  rulesText += '- "bei antragsaufnahme" / "aufnahme" → VALUE: "6"\n';
  rulesText += '- "zu beginn" / "versicherungsbeginn" → VALUE: "1"\n';
  rulesText += '- "anfrage" / "km-anfrage" → VALUE: "2"\n';
  rulesText += '- "bei änderung" → VALUE: "10"\n';
  rulesText += '- "freiwillig" → VALUE: "8"\n\n';
  
  rulesText += 'ZUBEHÖR-ART (KraftBoGruppeMoeglArtZubehoerteil):\n';
  rulesText += '- "fahrwerk" / "tuning" → VALUE: "ZUB300"\n';
  rulesText += '- "triebwerk" / "motor" → VALUE: "ZUB301"\n';
  rulesText += '- "auspuff" → VALUE: "ZUB302"\n';
  rulesText += '- "innenraum" → VALUE: "ZUB303"\n';
  rulesText += '- "karosserie" → VALUE: "ZUB304"\n';
  rulesText += '- "lackierung" → VALUE: "ZUB305"\n\n';
  
  rulesText += 'WICHTIG: Bei unklaren Fällen nutze Artifact-Fallback-Mapping!\n';
  
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

  // Artifact-basierte Domain-Referenzierung (Token-optimiert)
  const dropdownMappingsText = generateArtifactBasedDropdownMappings();
  const intelligentMappingRules = generateArtifactBasedMappingRules();

  // Generiere JSON-Schema dynamisch
  const jsonSchema: Record<string, unknown> = FIELD_DEFINITIONS.reduce((schema, field) => {
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
  }, {} as Record<string, unknown>);

  return `Du bist ein Experte für deutsche Fahrzeugdaten-Extraktion. Heute ist ${todayFormatted}.

FELDER: ${fieldKeys}

SPARTEN-ERKENNUNG:
Du erkennst aus dem Text auch, welche Versicherungssparten der Nutzer möchte:
- KH = Kfz-Haftpflicht (Pflichtversicherung, "Haftpflicht", "Pflichtversicherung")
- KK = Kfz-Vollkasko ("Vollkasko", "Kasko mit zwei SB-Zahlen wie 300/150")
- EK = Kfz-Teilkasko ("Teilkasko", "Kasko mit einer SB-Zahl wie 150")
- KU = Unfall-Sparte (selten erwähnt)

SPARTEN-REGELN:
- "Kasko 150 SB" = EK (Teilkasko)
- "Kasko 300/150 SB" = KK (Vollkasko) 
- "nur Pflichtversicherung" = KH (und andere deaktivieren)
- "Haftpflicht und Vollkasko" = KH + KK
- "keine Kasko" = EK und KK deaktivieren
- Beachte "nur", "ohne", "kein" für Ausschlüsse

${dropdownMappingsText}

${intelligentMappingRules}

KORREKTUR-REGELN:
${correctionRulesText}
- Kein Jahr → aktuelles Jahr (${currentYear})
- Neuwagen: Erstzulassungsdatum = Anmeldedatum

JSON-FORMAT:
{
  "extractedData": ${JSON.stringify(jsonSchema, null, 2)},
  "spartenActions": {
    "KH": { "active": false, "reason": "" },
    "KK": { "active": false, "reason": "" },
    "EK": { "active": false, "reason": "" },
    "KU": { "active": false, "reason": "" }
  },
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
- FÜR DROPDOWN-WERTE: Nutze Artifact "fahrzeug-domains.json"

Beispiel für kilometerstaende:
"kilometerstaende": {
  "value": [
    {
      "id": "km_001",
      "datum": "2024-07-15",
      "art": "6",
      "kmstand": 22000
    }
  ],
  "confidence": 0.9,
  "source": "Text-Bereich"
}

ARTIFACT-INTEGRATION:
- Domain-Daten verfügbar in Artifact "fahrzeug-domains.json"
- Bei DropDown-Werten: Label→Value-Mapping via Artifact
- Fallback: Verwende Mapping-Regeln aus diesem Prompt

WICHTIG: 
- Für DropDown-Felder IMMER den VALUE verwenden, nicht das LABEL!
- Tabellen-Daten als Array strukturieren
- Artifact-Domains haben Priorität über generische Werte
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

  const jsonSchema: Record<string, unknown> = FIELD_DEFINITIONS.reduce((schema, field) => {
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
  }, {} as Record<string, unknown>);

  return `Du bist ein Experte für deutsche Fahrzeugversicherungsdaten-Extraktion. Heute ist ${todayFormatted}.

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
- FÜR DROPDOWN-WERTE: Nutze Artifact "fahrzeug-domains.json"

Beispiel für kilometerstaende:
"kilometerstaende": {
  "value": [
    {
      "id": "km_001",
      "datum": "2024-07-15",
      "art": "6",
      "kmstand": 22000
    }
  ],
  "confidence": 0.9,
  "source": "Text-Bereich"
}

ARTIFACT-INTEGRATION:
- Domain-Daten verfügbar in Artifact "fahrzeug-domains.json"
- Bei DropDown-Werten: Label→Value-Mapping via Artifact
- Fallback: Verwende Mapping-Regeln aus diesem Prompt

WICHTIG: 
- Für DropDown-Felder IMMER den VALUE verwenden, nicht das LABEL!
- Tabellen-Daten als Array strukturieren
- Artifact-Domains haben Priorität über generische Werte
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
export function createContextualPrompt(text: string, currentValues: Record<string, unknown>): string {
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
export function validateExtractedData(extractedData: Record<string, { value?: unknown }>): string[] {
  const errors: string[] = [];
  
  FIELD_DEFINITIONS.forEach(field => {
    const value = extractedData[field.key]?.value;
    
    if (field.required && !value) {
      errors.push(`${field.label} ist ein Pflichtfeld`);
    }
    
    if (field.type === 'date' && value) {
      const date = new Date(value as string | number | Date);
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
      if (!validValues.includes(value as string)) {
        errors.push(`${field.label} enthält einen ungültigen Wert: ${value}. Erlaubte Werte: ${validValues.join(', ')}`);
      }
    }
  });
  
  return errors;
}

// Hilfsfunktion zur automatischen Konvertierung von Labels zu Values
export async function convertLabelsToValues(extractedData: Record<string, { value?: unknown; [key: string]: unknown }>): Promise<Record<string, { value?: unknown; [key: string]: unknown }>> {
  await loadAllDomainData();
  
  const convertedData = { ...extractedData };
  
  FIELD_DEFINITIONS.forEach(field => {
    if (field.type === 'dropdown' && field.dropdown?.domainId) {
      const fieldData = extractedData[field.key];
      const value = fieldData?.value;
      if (value && typeof value === 'string') {
        const domainOptions = domainDataCache[field.dropdown.domainId] || [];
        
        // Suche nach exaktem Label-Match
        const matchByLabel = domainOptions.find(option => 
          option.label && option.label.toLowerCase() === value.toLowerCase()
        );
        
        if (matchByLabel && matchByLabel.value) {
          convertedData[field.key] = {
            ...fieldData,
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