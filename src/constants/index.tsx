import { FieldType } from '@/constants/fieldConfig';

export interface ApiResponse {
  success: boolean;
  message?: string;
  data?: ClaudeResponse;
  error?: string;
  details?: string;
}

// MotorDate Component
export interface MotorDateProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
  hideLabel?: boolean;
}

// MotorDropDown Component Props
export interface MotorDropDownProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
  domainId: string;
  placeholder?: string;
}

export interface DropdownOption {
  classId: string;
  value: string;
  label: string;
}

export interface Datalist {
  classId: string;
  id: string;
  options: DropdownOption[];
}

// Erweiterte Field Config für verschiedene Datentypen
export interface FieldConfig {
  fieldKey: string;        // Eindeutige ID
  label: string;           // Anzeigename 
  synonyms: string[];      // KI-Erkennungsworte
  currentValue: any;       // Aktueller Wert (kann verschiedene Typen haben)
  onChange: (value: any) => void;  // Update-Funktion
  type: FieldType;         // Datentyp
  validation?: {
    min?: string | number;
    max?: string | number;
    pattern?: string;
    required?: boolean;
  };
  ui?: {
    disabled?: boolean;
    placeholder?: string;
    helpText?: string;
  };
  // Ergänzung für DropDown
  dropdown?: {
    domainId: string;
  };
  // Ergänzung für Table
  table?: {
    columns: any[];
    addButtonText?: string;
    emptyText?: string;
    relatedFields?: string[];
  };
}

// Chat Component
export interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  extractedFields?: string[]; // Welche Felder wurden extrahiert
}

export interface ChatComponentProps {
  fieldConfigs: FieldConfig[];
}

// Erweiterte Interfaces für die API Response
export interface ExtractedFieldValue {
  value: string | number | boolean | null;
  confidence: number;
  source: string;
  corrected?: boolean;
  originalValue?: string | number | boolean | null;
  fieldType?: FieldType;
}

// Dynamische Typen basierend auf der Konfiguration
export type ExtractedData = Record<string, ExtractedFieldValue>;

export interface ClaudeResponse {
  extractedData: ExtractedData;
  overallConfidence: number;
  validationErrors: string[];
  suggestions: string[];
  recognizedPhrases: string[];
  explanation: string;
  appliedCorrections: string[];
  isNewVehicle?: boolean;
}

// Hilfsfunktionen für Type Guards
export const isDateField = (field: FieldConfig): boolean => field.type === 'date';
export const isTextField = (field: FieldConfig): boolean => field.type === 'text';
export const isNumberField = (field: FieldConfig): boolean => field.type === 'number';
export const isBooleanField = (field: FieldConfig): boolean => field.type === 'boolean';
export const isSelectField = (field: FieldConfig): boolean => field.type === 'select';
export const isDropdownField = (field: FieldConfig): boolean => field.type === 'dropdown';
export const isTristateField = (field: FieldConfig): boolean => field.type === 'tristate';
export const isTableField = (field: FieldConfig): boolean => field.type === 'table';

// Validierungshelfer
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateFieldValue = (
  field: FieldConfig, 
  value: any
): ValidationResult => {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Pflichtfeld-Validierung
  if (field.validation?.required && (!value || value === '')) {
    result.isValid = false;
    result.errors.push(`${field.label} ist ein Pflichtfeld`);
  }

  // Typ-spezifische Validierung
  switch (field.type) {
    case 'date':
      if (value && value !== '0001-01-01') {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          result.isValid = false;
          result.errors.push(`${field.label} enthält ein ungültiges Datum`);
        }
      }
      break;

    case 'number':
      if (value !== null && value !== undefined && value !== '') {
        const num = Number(value);
        if (isNaN(num)) {
          result.isValid = false;
          result.errors.push(`${field.label} muss eine Zahl sein`);
        } else {
          if (
            field.validation?.min !== undefined &&
            num < Number(field.validation.min)
          ) {
            result.isValid = false;
            result.errors.push(`${field.label} muss mindestens ${field.validation.min} sein`);
          }
          if (
            field.validation?.max !== undefined &&
            num > Number(field.validation.max)
          ) {
            result.isValid = false;
            result.errors.push(`${field.label} darf maximal ${field.validation.max} sein`);
          }
        }
      }
      break;

    case 'text':
      if (value && field.validation?.pattern) {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(value)) {
          result.isValid = false;
          result.errors.push(`${field.label} entspricht nicht dem erwarteten Format`);
        }
      }
      break;

    case 'dropdown':
      // DropDown-Validierung könnte hier erweitert werden
      // Validierung gegen Domain-Daten würde hier stattfinden
      break;

    case 'tristate':
      if (value !== null && value !== 'J' && value !== 'N' && value !== ' ') {
        result.isValid = false;
        result.errors.push(`${field.label} muss J, N oder leer sein`);
      }
      break;
  }

  return result;
};

// Hilfsfunktionen für die Datenkonvertierung
export const convertValueToFieldType = (value: any, type: FieldType): any => {
  switch (type) {
    case 'date':
      return typeof value === 'string' ? value : '';
    case 'number':
      return typeof value === 'number' ? value : (typeof value === 'string' ? parseFloat(value) || 0 : 0);
    case 'boolean':
      return typeof value === 'boolean' ? value : Boolean(value);
    case 'tristate':
      return value === 'J' || value === 'N' || value === ' ' ? value : ' ';
    case 'text':
    case 'select':
    case 'dropdown':
      return typeof value === 'string' ? value : String(value || '');
    case 'table':
      return Array.isArray(value) ? value : [];
    default:
      return value;
  }
};

// Formatierung für die Anzeige
export const formatValueForDisplay = (value: any, type: FieldType): string => {
  if (value === null || value === undefined) return 'Nicht gesetzt';
  
  switch (type) {
    case 'date':
      if (value === '0001-01-01' || value === '') return 'Nicht gesetzt';
      try {
        return new Date(value).toLocaleDateString('de-DE');
      } catch {
        return String(value);
      }
    case 'number':
      return value === 0 ? 'Nicht gesetzt' : value.toLocaleString('de-DE');
    case 'boolean':
      return value ? 'Ja' : 'Nein';
    case 'tristate':
      return value === 'J' ? 'Ja' : value === 'N' ? 'Nein' : 'Nicht gesetzt';
    case 'text':
    case 'select':
    case 'dropdown':
      return value === '' ? 'Nicht gesetzt' : String(value);
    case 'table':
      return Array.isArray(value) ? `${value.length} Einträge` : 'Nicht gesetzt';
    default:
      return String(value);
  }
};

// Hilfsfunktion für DropDown-Label-Auflösung
export const getDropdownDisplayValue = async (
  value: string, 
  domainId: string
): Promise<string> => {
  if (!value || !domainId) return 'Nicht gesetzt';
  
  try {
    // Dynamischer Import um Circular Dependencies zu vermeiden
    const { fetchDomainData } = await import('@/app/api/FetchDomainData');
    const options = await fetchDomainData(domainId);
    const option = options.find(opt => opt.value === value);
    return option?.label || value;
  } catch (error) {
    console.error('Error fetching dropdown display value:', error);
    return value;
  }
};

// Erweiterte Formatierung mit DropDown-Label-Auflösung
export const formatValueForDisplayAsync = async (
  value: any, 
  type: FieldType, 
  domainId?: string
): Promise<string> => {
  if (type === 'dropdown' && domainId) {
    return await getDropdownDisplayValue(value, domainId);
  }
  
  return formatValueForDisplay(value, type);
};