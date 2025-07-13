// MotorDate Component
export interface MotorDateProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
}

export interface FieldConfig {
  fieldKey: string;        // Eindeutige ID
  label: string;           // Anzeigename 
  synonyms: string[];      // KI-Erkennungsworte
  currentValue: string;    // Aktueller Wert
  onChange: (value: string) => void;  // Update-Funktion
}

// Chat Component
export interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ChatComponentProps {
  fieldConfigs: FieldConfig[];
}

// Interfaces für die API Response
export interface ExtractedDate {
  value: string | null;
  confidence: number;
  source: string;
}

export interface ClaudeResponse {
  extractedDates: {
    beginndatum: ExtractedDate;
    ablaufdatum: ExtractedDate;
    erstzulassungsdatum: ExtractedDate;
    anmeldedatum: ExtractedDate;
    urbeginn: ExtractedDate;
    stornodatum: ExtractedDate;
  };
  overallConfidence: number;
  validationErrors: string[];
  suggestions: string[];
  recognizedPhrases: string[];
  explanation: string;
}
