// MotorDate Component
export interface MotorDateProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
  valueText4KiModell?: string;
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

