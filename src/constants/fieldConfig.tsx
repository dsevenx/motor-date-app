// fieldConfig.ts - Zentrale Feld-Konfiguration mit Tabellen-Unterstützung

export type FieldType = 'date' | 'text' | 'number' | 'boolean' | 'select' | 'table' | 'tristate';

export type NumberFormat = 'currency' | 'integer' | 'decimal' | 'percentage' | 'count';

export interface TableColumn {
  key: string;
  label: string;
  type: FieldType;
  width?: string;
  validation?: {
    min?: string | number;
    max?: string | number;
    numberFormat?: NumberFormat;
    maxLength?: number;
  };
  ui?: {
    placeholder?: string;
  };
}

export interface TableRow {
  id: string;
  [key: string]: any;
}

export interface FieldDefinition {
  key: string;                    // Eindeutiger Schlüssel
  label: string;                  // Anzeigename
  type: FieldType;               // Datentyp
  defaultValue: string | number | boolean | TableRow[] | 'J' | 'N' | ' '; // Standardwert
  synonyms: string[];            // KI-Erkennungsworte
  required?: boolean;            // Pflichtfeld
  validation?: {
    min?: string | number;       // Mindestvalue (für Datum/Zahl)
    max?: string | number;       // Maximalwert
    numberFormat?: NumberFormat; // Zahlenformat
    customRule?: string;         // Benutzerdefinierte Regel für KI
    maxLength?: number;          // Maximale Länge (für Text)
  };
  ui?: {
    disabled?: boolean;          // UI-Zustand
    placeholder?: string;        // Platzhalter
    helpText?: string;           // Hilfetext
    group?: string;              // Gruppierung in der UI
    infoText?: string;           // Info-Text für Tooltip
  };
  ai?: {
    priority?: 'high' | 'medium' | 'low';  // KI-Priorität
    context?: string;            // Zusätzlicher Kontext für KI
    correctionRules?: string[];  // Spezifische Korrekturregeln
  };
  // Tabellen-spezifische Eigenschaften
  table?: {
    columns: TableColumn[];      // Spalten-Definition
    addButtonText?: string;      // Text für Add-Button
    emptyText?: string;          // Text bei leerer Tabelle
    relatedFields?: string[];    // Verbundene Felder für KI-Erkennung
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
      'von 20',
      'aus dem jahr',
      'aus 20'
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
    key: 'neuwert',
    label: 'Neuwert',
    type: 'number',
    defaultValue: 0,
    synonyms: ['Neupreis', 'habe beim Hersteller bezahlt', 'Listenpreis'],
    validation: {
      min: 0,
      max: 2000000,
      numberFormat: 'currency'
    },
    ui: {
      placeholder: 'Neuwert eingeben...'
    },
    ai: {
      priority: 'low',
      context: 'Neuwert des Fahrzeugs'
    }
  },
  // TriState-Felder
  {
    key: 'vorsteuerabzugsberechtigt',
    label: 'Vorsteuerabzugsberechtigt',
    type: 'tristate',
    defaultValue: ' ',
    synonyms: [
      'vorsteuerabzugsberechtigt', 'vorsteuer', 'berechtigt', 'abzugsberechtigt',
      'steuerlich absetzbar', 'absetzbar', 'betrieblich', 'geschäftlich',
      'unternehmen', 'firma', 'selbstständig', 'gewerblich',
      'kann absetzen', 'steuerlich', 'von der steuer absetzen'
    ],
    ai: {
      priority: 'medium',
      context: 'Vorsteuerabzugsberechtigung für geschäftliche/betriebliche Nutzung des Fahrzeugs',
      correctionRules: [
        'Bei geschäftlicher/betrieblicher Nutzung meist "J"',
        'Bei privater Nutzung meist "N"',
        'Bei Unsicherheit " " (unbekannt)'
      ]
    },
    ui: {
      infoText: 'Berechtigung zum Vorsteuerabzug bei geschäftlicher Nutzung'
    }
  },
  {
    key: 'abweichende_fahrzeugdaten',
    label: 'Abweichende Fahrzeugdaten',
    type: 'tristate',
    defaultValue: ' ',
    synonyms: [
      'abweichende fahrzeugdaten', 'abweichend', 'anders', 'unterschiedlich',
      'modifiziert', 'verändert', 'tuning', 'umgebaut', 'angepasst',
      'nicht original', 'nicht serienmäßig', 'custom', 'individuell',
      'besonderheiten', 'abweichungen', 'sonderausstattung'
    ],
    ai: {
      priority: 'medium',
      context: 'Fahrzeug weicht von Standarddaten ab (Tuning, Modifikationen, etc.)',
      correctionRules: [
        'Bei Tuning/Modifikationen meist "J"',
        'Bei Serienfahrzeug meist "N"',
        'Bei Unsicherheit " " (unbekannt)'
      ]
    },
    ui: {
      infoText: 'Fahrzeug wurde modifiziert oder weicht von Seriendaten ab'
    }
  },
  // Tabelle: Kilometerstände
  {
    key: 'kilometerstaende',
    label: 'Kilometerstände',
    type: 'table',
    defaultValue: [],
    synonyms: [
      'kilometer', 'km', 'kilometerstand', 'laufleistung', 'gefahren', 
      'bei antragsaufnahme', 'bei vertragsbeginn', 'bei versicherungsbeginn',
      'zu beginn war', 'aktueller stand', 'jetzt', 'heute', 'momentan'
    ],
    ai: {
      priority: 'medium',
      context: 'Kilometerstände zu verschiedenen Zeitpunkten. Erkenne verschiedene Zeitpunkte und ordne sie zu: Antragsaufnahme, Versicherungsbeginn, Vertragsende, etc.',
      correctionRules: [
        'Datum sollte logisch zum Kontext passen',
        'KM-Stand sollte chronologisch steigen',
        'Bei "zu Beginn" verwende beginndatum',
        'Bei "jetzt/heute/aktuell" verwende aktuelles Datum'
      ]
    },
    table: {
      columns: [
        {
          key: 'datum',
          label: 'Datum',
          type: 'date',
          width: '200px'
        },
        {
          key: 'art',
          label: 'Art des KM-Stands',
          type: 'text',
          width: '250px',
          ui: {
            placeholder: 'z.B. Versicherungsbeginn, Antragsaufnahme...'
          }
        },
        {
          key: 'kmstand',
          label: 'KM-Stand',
          type: 'number',
          width: '150px',
          validation: {
            min: 0,
            max: 1000000,
            numberFormat: 'integer'
          }
        }
      ],
      addButtonText: 'Kilometerstand hinzufügen',
      emptyText: 'Keine Kilometerstände erfasst',
      relatedFields: ['beginndatum', 'anmeldedatum', 'erstzulassungsdatum']
    }
  },
  // Tabelle: Zubehör
  {
    key: 'zubehoer',
    label: 'Zubehör',
    type: 'table',
    defaultValue: [],
    synonyms: [
      'zubehör', 'zusatzausstattung', 'extras', 'sonderausstattung',
      'soundsystem', 'sound', 'musik', 'radio', 'navigation', 'navi',
      'tuning', 'fahrwerk', 'felgen', 'räder', 'reifen',
      'sicherheit', 'alarm', 'diebstahlschutz', 'wegfahrsperre',
      'launch', 'launchcontrol', 'sportauspuff', 'auspuff',
      'habe ein', 'habe eine', 'zusätzlich', 'eingebaut', 'montiert',
      'im wert von', 'kostet', 'wert', 'euro', 'für', 'von'
    ],
    ai: {
      priority: 'medium',
      context: 'Fahrzeug-Zubehör mit Wertangaben. Erkenne Hersteller, Art des Zubehörs, Wert und ob es zuschlagspflichtig ist. Mehrere Zubehörteile in einem Satz sollen als separate Einträge erfasst werden.',
      correctionRules: [
        'Werte über 1000€ sind meist zuschlagspflichtig',
        'Sicherheitssysteme sind meist zuschlagspflichtig',
        'Tuning-Teile sind meist zuschlagspflichtig',
        'Standard-Zubehör wie Radios unter 500€ meist nicht zuschlagspflichtig'
      ]
    },
    table: {
      columns: [
        {
          key: 'hersteller',
          label: 'Hersteller',
          type: 'text',
          width: '200px',
          ui: {
            placeholder: 'z.B. BMW, Bose, Alpine...'
          }
        },
        {
          key: 'art',
          label: 'Art des Zubehörs',
          type: 'text',
          width: '250px',
          ui: {
            placeholder: 'z.B. Soundsystem, Fahrwerkstuning...'
          }
        },
        {
          key: 'zuschlag',
          label: 'Zuschlagspflichtig',
          type: 'boolean',
          width: '120px'
        },
        {
          key: 'wert',
          label: 'Wert in Euro',
          type: 'number',
          width: '150px',
          validation: {
            min: 0,
            max: 100000,
            numberFormat: 'currency'
          }
        }
      ],
      addButtonText: 'Zubehör hinzufügen',
      emptyText: 'Kein Zubehör erfasst',
      relatedFields: ['neuwert']
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

export const getTableFields = (): FieldDefinition[] => {
  return FIELD_DEFINITIONS.filter(field => field.type === 'table');
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

// Hilfsfunktionen für Tabellen
export const createEmptyTableRow = (tableField: FieldDefinition): TableRow => {
  if (!tableField.table) throw new Error('Field is not a table');
  
  const row: TableRow = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
  };
  
  tableField.table.columns.forEach(column => {
    switch (column.type) {
      case 'date':
        row[column.key] = '0001-01-01';
        break;
      case 'number':
        row[column.key] = 0;
        break;
      case 'boolean':
        row[column.key] = false;
        break;
      case 'tristate':
        row[column.key] = ' ';
        break;
      case 'text':
      case 'select':
      default:
        row[column.key] = '';
        break;
    }
  });
  
  return row;
};

export const addTableRow = (tableKey: string, currentRows: TableRow[]): TableRow[] => {
  const field = getFieldByKey(tableKey);
  if (!field || field.type !== 'table') return currentRows;
  
  const newRow = createEmptyTableRow(field);
  return [...currentRows, newRow];
};

export const removeTableRow = (currentRows: TableRow[], rowId: string): TableRow[] => {
  return currentRows.filter(row => row.id !== rowId);
};

export const updateTableRow = (currentRows: TableRow[], rowId: string, updates: Partial<TableRow>): TableRow[] => {
  return currentRows.map(row => 
    row.id === rowId ? { ...row, ...updates } : row
  );
};

// Typen für die API-Responses (dynamisch generiert)
export type ExtractedFieldValue = {
  value: string | number | boolean | TableRow[] | 'J' | 'N' | ' ' | null;
  confidence: number;
  source: string;
  corrected?: boolean;
  originalValue?: string | number | boolean | TableRow[] | 'J' | 'N' | ' ' | null;
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
  newTableRows?: {
    [tableKey: string]: TableRow[];
  };
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
    type: field.type,
    table: field.table
  }));
};