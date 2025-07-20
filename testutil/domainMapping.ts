// Domain-Mapping Utilities für Artifact-Fallback

export interface DomainMapping {
  value: string;
  label: string;
}

export interface ArtifactDomainData {
  version: string;
  lastUpdated: string;
  domains: Record<string, DomainMapping[]>;
  mappingRules: Record<string, Record<string, string>>;
}

// Lokaler Fallback für Domain-Daten
const fallbackDomainData: ArtifactDomainData = {
  version: "1.0",
  lastUpdated: "2025-01-20",
  domains: {
    "KraftBoGruppeMoeglKmAngabeGrund": [
      { value: "6", label: "Antragsaufnahme" },
      { value: "1", label: "Versicherungsbeginn" },
      { value: "2", label: "km-Anfrage" },
      { value: "10", label: "bei Änderung" },
      { value: "8", label: "freiwillige Meldung VN" }
    ],
    "KraftBoGruppeMoeglArtZubehoerteil": [
      { value: "ZUB300", label: "Fahrwerktuning" },
      { value: "ZUB301", label: "Triebwerktuning" },
      { value: "ZUB302", label: "Auspufftuning" },
      { value: "ZUB303", label: "Innenraumtuning" },
      { value: "ZUB304", label: "Karosserietuning" }
    ]
  },
  mappingRules: {
    "KraftBoGruppeMoeglKmAngabeGrund": {
      "bei antragsaufnahme": "6",
      "zu beginn": "1",
      "versicherungsbeginn": "1",
      "bei aufnahme": "6",
      "anfrage": "2"
    },
    "KraftBoGruppeMoeglArtZubehoerteil": {
      "fahrwerk": "ZUB300",
      "triebwerk": "ZUB301",
      "motor": "ZUB301",
      "auspuff": "ZUB302",
      "tuning": "ZUB300"
    }
  }
};

// Artifact-Daten laden (mit Fallback) - Browser-kompatibel
export const loadArtifactDomainData = async (): Promise<ArtifactDomainData> => {
  try {
    // Versuche Artifact-Daten über HTTP zu laden (nur im Browser)
    if (typeof window !== 'undefined') {
      const response = await fetch('/data/fahrzeug-domains.json');
      if (response.ok) {
        return await response.json() as ArtifactDomainData;
      }
    }
    
    // Fallback für Server-Side oder bei Fehlern
    console.warn('Artifact-Datei nicht verfügbar, verwende Fallback-Daten');
    return fallbackDomainData;
  } catch (error) {
    console.warn('Fehler beim Laden der Artifact-Daten:', error);
    return fallbackDomainData;
  }
};

// Smart Domain-Value-Mapping
export const mapLabelToValue = async (
  domainId: string,
  inputText: string,
  artifactData?: ArtifactDomainData
): Promise<string | null> => {
  const data = artifactData || await loadArtifactDomainData();
  
  if (!data.domains[domainId]) {
    console.warn(`Domain ${domainId} nicht in Artifact gefunden`);
    return null;
  }
  
  const inputLower = inputText.toLowerCase().trim();
  
  // 1. Exakte Label-Übereinstimmung
  const exactMatch = data.domains[domainId].find(
    item => item.label.toLowerCase() === inputLower
  );
  if (exactMatch) return exactMatch.value;
  
  // 2. Mapping-Regeln verwenden
  if (data.mappingRules[domainId]) {
    const mappingRule = Object.entries(data.mappingRules[domainId]).find(
      ([key]) => inputLower.includes(key.toLowerCase())
    );
    if (mappingRule) return mappingRule[1];
  }
  
  // 3. Keyword-basierte Suche
  const keywordMatch = data.domains[domainId].find(item => {
    const labelWords = item.label.toLowerCase().split(/[\s\-\/]+/);
    return labelWords.some(word => 
      word.length > 2 && inputLower.includes(word)
    );
  });
  if (keywordMatch) return keywordMatch.value;
  
  console.log(`Keine Zuordnung gefunden für "${inputText}" in Domain ${domainId}`);
  return null;
};

// Validierung eines Domain-Values
export const validateDomainValue = async (
  domainId: string,
  value: string,
  artifactData?: ArtifactDomainData
): Promise<boolean> => {
  const data = artifactData || await loadArtifactDomainData();
  
  if (!data.domains[domainId]) return false;
  
  return data.domains[domainId].some(item => item.value === value);
};

// Get all valid values for a domain
export const getDomainValues = async (
  domainId: string,
  artifactData?: ArtifactDomainData
): Promise<string[]> => {
  const data = artifactData || await loadArtifactDomainData();
  
  if (!data.domains[domainId]) return [];
  
  return data.domains[domainId].map(item => item.value);
};

// Performance-Monitoring für Artifact-Zugriffe
export class ArtifactPerformanceMonitor {
  private static accessCount = 0;
  private static fallbackCount = 0;
  private static startTime = Date.now();
  
  static recordArtifactAccess() {
    this.accessCount++;
  }
  
  static recordFallback() {
    this.fallbackCount++;
  }
  
  static getStats() {
    const runtime = Date.now() - this.startTime;
    return {
      totalAccess: this.accessCount,
      fallbackCount: this.fallbackCount,
      successRate: this.accessCount > 0 ? 
        ((this.accessCount - this.fallbackCount) / this.accessCount) * 100 : 0,
      runtime: runtime
    };
  }
  
  static reset() {
    this.accessCount = 0;
    this.fallbackCount = 0;
    this.startTime = Date.now();
  }
}

const domainMappingUtils = {
  loadArtifactDomainData,
  mapLabelToValue,
  validateDomainValue,
  getDomainValues,
  ArtifactPerformanceMonitor
};

export default domainMappingUtils;