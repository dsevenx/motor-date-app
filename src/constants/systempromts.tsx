import { 
  FIELD_DEFINITIONS, 
  getAllSynonyms, 
  getValidationRules, 
  getFieldsByType 
} from '@/constants/fieldConfig';

const today = new Date();
const todayFormatted = today.toLocaleDateString('de-DE', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});
const currentYear = today.getFullYear();

// Dynamische Generierung des System Prompts
export const SYSTEM_PROMPT_FAHRZEUGDATEN = (() => {
  const fieldKeys = FIELD_DEFINITIONS.map(field => field.key).join(', ');
  const correctionRules = getValidationRules();
  
  // Generiere Korrektur-Regeln String
  const correctionRulesText = Object.entries(correctionRules)
    .map(([key, rules]) => rules.map(rule => `${key}: ${rule}`))
    .flat()
    .join('\n');

  // Generiere JSON-Schema dynamisch
  const jsonSchema = FIELD_DEFINITIONS.reduce((schema, field) => {
    const defaultValue = field.type === 'date' ? null : 
                        field.type === 'number' ? 0 : 
                        field.type === 'boolean' ? false : null;
    
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

NUR JSON zurückgeben, keine Erklärungen außerhalb!`;
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
  
  // Dynamische Feld-Hinweise basierend auf Konfiguration
  FIELD_DEFINITIONS.forEach(field => {
    if (field.ai?.context && field.synonyms.some(synonym => text.toLowerCase().includes(synonym.toLowerCase()))) {
      contextHints += `\nKONTEXT ${field.key}: ${field.ai.context}`;
    }
  });
  
  return `Text: "${text}"${contextHints}

Aktuelle Werte: ${JSON.stringify(currentValues)}

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
  });
  
  return errors;
}