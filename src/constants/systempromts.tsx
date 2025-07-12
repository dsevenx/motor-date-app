const today = new Date();
const todayFormatted = today.toLocaleDateString('de-DE', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});
const currentYear = today.getFullYear();

// Basis System Prompt (kurz und effizient)
export const SYSTEM_PROMPT_FAHRZEUGDATEN = `Du bist ein Experte für deutsche Fahrzeugdaten-Extraktion. Heute ist ${todayFormatted}.

FELDER: beginndatum, ablaufdatum, erstzulassungsdatum, anmeldedatum, urbeginn, stornodatum

KORREKTUR-REGELN:
1. Ablaufdatum > Beginndatum (sonst null)
2. Erstzulassungsdatum ≤ Anmeldedatum (sonst gleichsetzen)
3. Anmeldedatum ≤ Beginndatum (sonst gleichsetzen)
4. Kein Jahr → aktuelles Jahr (${currentYear})
5. Neuwagen: Erstzulassungsdatum = Anmeldedatum

JSON-FORMAT:
{
  "extractedDates": {
    "beginndatum": {"value": "YYYY-MM-DD", "confidence": 0.95, "source": "text", "corrected": false, "originalValue": null},
    "ablaufdatum": {"value": null, "confidence": 0.0, "source": "", "corrected": false, "originalValue": null},
    "erstzulassungsdatum": {"value": null, "confidence": 0.0, "source": "", "corrected": false, "originalValue": null},
    "anmeldedatum": {"value": null, "confidence": 0.0, "source": "", "corrected": false, "originalValue": null},
    "urbeginn": {"value": null, "confidence": 0.0, "source": "", "corrected": false, "originalValue": null},
    "stornodatum": {"value": null, "confidence": 0.0, "source": "", "corrected": false, "originalValue": null}
  },
  "overallConfidence": 0.85,
  "validationErrors": [],
  "suggestions": [],
  "recognizedPhrases": [],
  "explanation": "",
  "isNewVehicle": false,
  "appliedCorrections": []
}

NUR JSON zurückgeben, keine Erklärungen außerhalb!`;

// Detaillierte Regeln als separates Artefakt/Kontext
export const FAHRZEUGDATEN_REGELN = {
  synonyme: {
    beginndatum: ["Startdatum", "Vertragsbeginn", "ab wann", "von wann", "Versicherungsbeginn"],
    ablaufdatum: ["Enddatum", "bis wann", "läuft ab", "Vertragsende", "Versicherungsende"],
    erstzulassungsdatum: ["Erstzulassung", "erstmals zugelassen", "Zulassung", "Neuzulassung"],
    anmeldedatum: ["gekauft", "erworben", "Auto gekauft", "Kauf", "Kaufdatum", "angemeldet"],
    urbeginn: ["erstes Fahrzeug", "erste Auto", "zum ersten Mal gefahren", "vor X Jahren"],
    stornodatum: ["außerordentliche Kündigung", "Abmeldung", "musste abmelden", "aufgrund", "wegen", "Totalschaden", "Unfall"]
  },
  
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
  
  return `Text: "${text}"${contextHints}

Aktuelle Werte: ${JSON.stringify(currentValues)}

Extrahiere nur neue/geänderte Daten. Wende Korrektur-Regeln an.`;
}