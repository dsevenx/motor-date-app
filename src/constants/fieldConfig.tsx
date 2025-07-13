// fieldConfig.ts - Zentrale Feld-Konfiguration

export type FieldType = 'date' | 'text' | 'number' | 'boolean' | 'select';

export interface FieldDefinition {
  key: string;                    // Eindeutiger Schlüssel
  label: string;                  // Anzeigename
  type: FieldType;               // Datentyp
  defaultValue: string | number | boolean; // Standardwert
  synonyms: string[];            // KI-Erkennungsworte
  required?: boolean;            // Pflichtfeld
  validation?: {
    min?: string | number;       // Mindestvalue (für Datum/Zahl)
    max?: string | number;       // Maximalwert
    pattern?: string;           // Regex-Pattern
    customRule?: string;        // Benutzerdefinierte Regel für KI
  };
  ui?: {
    disabled?: boolean;         // UI-Zustand
    placeholder?: string;       // Platzhalter
    helpText?: string;          // Hilfetext
    group?: string;             // Gruppierung in der UI
  };
  ai?: {
    priority?: 'high' | 'medium' | 'low';  // KI-Priorität
    context?: string;           // Zusätzlicher Kontext für KI
    correctionRules?: string[]; // Spezifische Korrekturregeln
  };
}

// Zentrale Feld-Konfiguration
export const FIELD_DEFINITIONS: FieldDefinition[] = [
  {
    key: 'beginndatum',
    label: 'Beginndatum',
    type: 'date',
    defaultValue: '0001-01-01',
    synonyms: ['beginndatum', 'startdatum', 'anfangsdatum', 'ab wann', 'von wann', 'vertragsbeginn', 'versicherungsbeginn', 'gültigkeitsbeginn'],
    required: true,
    validation: {
      customRule: 'Muss vor Ablaufdatum liegen'
    },
    ai: {
      priority: 'high',
      context: 'Beginndatum ist meist der Vertragsbeginn oder Versicherungsbeginn',
      correctionRules: ['Anmeldedatum ≤ Beginndatum (sonst gleichsetzen)']
    }
  },
  {
    key: 'ablaufdatum',
    label: 'Ablaufdatum',
    type: 'date',
    defaultValue: '0001-01-01',
    synonyms: ['ablaufdatum', 'enddatum', 'gültigkeitsende', 'bis wann', 'vertragsende', 'versicherungsende', 'läuft ab', 'endet', 'frist'],
    validation: {
      customRule: 'Muss nach Beginndatum liegen'
    },
    ai: {
      priority: 'high',
      context: 'Ablaufdatum ist das Ende der Gültigkeit',
      correctionRules: ['Ablaufdatum > Beginndatum (sonst null)']
    }
  },
   {
    key: 'erstzulassungsdatum',
    label: 'Erstzulassungsdatum',
    type: 'date',
    defaultValue: '0001-01-01',
    synonyms: [
      'erstzulassung', 
      'erstmals zugelassen', 
      'zulassung', 
      'neuzulassung', 
      'zum ersten mal angemeldet', 
      'fahrzeug ist von',
      'jahre alt',
      'jahr alt', 
      'baujahr',
      'alter',
      'alt',
      'von 20', // für "von 2020", "von 2021", etc.
      'aus dem jahr',
      'aus 20' // für "aus 2020", etc.
    ],
    ai: {
      priority: 'medium',
      context: 'Erstzulassungsdatum ist das erste Zulassungsdatum des Fahrzeugs. WICHTIG: Bei Altersangaben wie "X Jahre alt" das Erstzulassungsdatum berechnen: aktuelles Jahr - X Jahre.',
      correctionRules: [
        'Erstzulassungsdatum ≤ Anmeldedatum (sonst gleichsetzen)', 
        'Neuwagen: Erstzulassungsdatum = Anmeldedatum',
        'Bei "X Jahre alt": Erstzulassungsdatum = aktuelles Jahr - X Jahre (1. Januar als Default)',
        'Bei "X Jahre altes Auto": Erstzulassungsdatum = aktuelles Jahr - X Jahre'
      ]
    }
  },
  {
    key: 'anmeldedatum',
    label: 'Anmeldedatum',
    type: 'date',
    defaultValue: '0001-01-01',
    synonyms: ['anmeldedatum', 'gekauft', 'erworben', 'auto gekauft', 'fahrzeug gekauft', 'kauf', 'kaufdatum', 'übernommen', 'angemeldet'],
    ai: {
      priority: 'medium',
      context: 'Anmeldedatum ist das Kaufdatum oder Übernahmedatum',
      correctionRules: ['Anmeldedatum ≤ Beginndatum (sonst gleichsetzen)']
    }
  },
  {
    key: 'urbeginn',
    label: 'Urbeginn',
    type: 'date',
    defaultValue: '0001-01-01',
    synonyms: ['urbeginn', 'ursprüngliche Beginn', 'startdatum des ersten vertrags', 'anfangsdatum des ersten vertrags', 'ursprünglicher vertragsbeginn'],
    ai: {
      priority: 'low',
      context: 'Urbeginn ist der ursprüngliche Beginn des ersten Vertrags'
    }
  },
  {
    key: 'stornodatum',
    label: 'Stornodatum/Stilllegung',
    type: 'date',
    defaultValue: '0001-01-01',
    synonyms: ['stornodatum', 'kündigungsdatum', 'stilllegung', 'abmeldung', 'vertrag beenden', 'vertrag kündigen'],
    ai: {
      priority: 'high',
      context: 'Stornodatum ist das Kündigungs- oder Stilllegungsdatum',
      correctionRules: ['Suche nach "musste...abmelden", "aufgrund...am", "wegen...am"']
    }
  },
  // Beispiel für ein weiteres Feld (nicht Datum)
  {
    key: 'fahrzeugmarke',
    label: 'Fahrzeugmarke',
    type: 'text',
    defaultValue: '',
    synonyms: ['marke', 'hersteller', 'auto von', 'fahrzeug von', 'bmw', 'mercedes', 'audi', 'volkswagen', 'opel'],
    ui: {
      placeholder: 'z.B. BMW, Mercedes, Audi...'
    },
    ai: {
      priority: 'medium',
      context: 'Fahrzeugmarke ist der Hersteller des Fahrzeugs'
    }
  },
  {
    key: 'kilometerstand',
    label: 'Kilometerstand',
    type: 'number',
    defaultValue: 0,
    synonyms: ['kilometer', 'km', 'kilometerstand', 'laufleistung', 'gefahren'],
    validation: {
      min: 0,
      max: 1000000
    },
    ui: {
      placeholder: 'Kilometerstand eingeben...'
    },
    ai: {
      priority: 'low',
      context: 'Kilometerstand des Fahrzeugs'
    }
  }
];

// Hilfsfunktionen für die Konfiguration
export const getFieldByKey = (key: string): FieldDefinition | undefined => {
  return FIELD_DEFINITIONS.find(field => field.key === key);
};

export const getFieldsByType = (type: FieldType): FieldDefinition[] => {
  return FIELD_DEFINITIONS.filter(field => field.type === type);
};

export const getFieldsByGroup = (group: string): FieldDefinition[] => {
  return FIELD_DEFINITIONS.filter(field => field.ui?.group === group);
};

export const getAllSynonyms = (): Record<string, string[]> => {
  return FIELD_DEFINITIONS.reduce((acc, field) => {
    acc[field.key] = field.synonyms;
    return acc;
  }, {} as Record<string, string[]>);
};

export const getValidationRules = (): Record<string, string[]> => {
  return FIELD_DEFINITIONS.reduce((acc, field) => {
    if (field.ai?.correctionRules) {
      acc[field.key] = field.ai.correctionRules;
    }
    return acc;
  }, {} as Record<string, string[]>);
};

// Typen für die API-Responses (dynamisch generiert)
export type ExtractedFieldValue = {
  value: string | number | boolean | null;
  confidence: number;
  source: string;
  corrected?: boolean;
  originalValue?: string | number | boolean | null;
};

export type ExtractedData = {
  [K in typeof FIELD_DEFINITIONS[number]['key']]: ExtractedFieldValue;
};

export interface ClaudeResponse {
  extractedData: ExtractedData;
  overallConfidence: number;
  validationErrors: string[];
  suggestions: string[];
  recognizedPhrases: string[];
  explanation: string;
  appliedCorrections: string[];
}

// Generiere Standardwerte für den State
export const generateDefaultValues = (): Record<string, any> => {
  return FIELD_DEFINITIONS.reduce((acc, field) => {
    acc[field.key] = field.defaultValue;
    return acc;
  }, {} as Record<string, any>);
};

// Generiere Field Configs für die Chat-Komponente
export const generateFieldConfigs = (
  values: Record<string, any>,
  setters: Record<string, (value: any) => void>
) => {
  return FIELD_DEFINITIONS.map(field => ({
    fieldKey: field.key,
    label: field.label,
    synonyms: field.synonyms,
    currentValue: values[field.key],
    onChange: setters[field.key],
    type: field.type
  }));
};