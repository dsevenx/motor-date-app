import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { ClaudeResponse } from '@/constants';

// Claude Client initialisieren
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const today = new Date();
  const todayFormatted = today.toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

// System Prompt für Datumsextraktion
const SYSTEM_PROMPT = `Du bist ein Experte für die Extraktion von Fahrzeug-Datumsinformationen aus deutschen Texten.

WICHTIGE ZEITANGABE:
Das heutige Datum ist der ${todayFormatted}. Verwende dieses Datum für alle Berechnungen und Validierungen.

GESCHÄFTSREGELN:
1. Ablaufdatum muss größer als Beginndatum sein
2. Erstzulassungsdatum muss kleiner als Anmeldedatum sein  
3. Anmeldedatum muss kleiner-gleich Beginndatum sein
4. Wenn das Jahr nicht angegeben ist, dann bitte aktuelles Tagesdatum verwenden

DATUMS-SYNONYME:
- Beginndatum: Startdatum, Vertragsbeginn, ab wann, von wann, Versicherungsbeginn, Gültigkeitsbeginn
- Ablaufdatum: Enddatum, bis wann, läuft ab, Vertragsende, Versicherungsende, Gültigkeitsende, Frist
- Erstzulassungsdatum: Erstzulassung, erstmals zugelassen, Zulassung, Neuzulassung, zum ersten Mal angemeldet, Fahrzeug ist von
- Anmeldedatum: gekauft, erworben, Auto gekauft, Fahrzeug gekauft, Kauf, Kaufdatum, übernommen, angemeldet

AUSGABEFORMAT:
Antworte IMMER mit einem gültigen JSON-Objekt in diesem Format:
{
  "extractedDates": {
    "beginndatum": {
      "value": "YYYY-MM-DD oder null",
      "confidence": 0.95,
      "source": "am 1.7.2025 beginnen"
    },
    "ablaufdatum": {
      "value": "YYYY-MM-DD oder null",
      "confidence": 0.90,
      "source": "am 1.12.2025 enden"
    },
    "erstzulassungsdatum": {
      "value": null,
      "confidence": 0.0,
      "source": ""
    },
    "anmeldedatum": {
      "value": null,
      "confidence": 0.0,
      "source": ""
    }
  },
  "overallConfidence": 0.85,
  "validationErrors": ["Liste von Regelverstößen"],
  "suggestions": ["Verbesserungsvorschläge"],
  "recognizedPhrases": ["Erkannte relevante Textteile"],
  "explanation": "Kurze Erläuterung der Extraktion"
}

WICHTIG: Antworte NUR mit dem JSON-Objekt, ohne zusätzlichen Text davor oder danach!

CONFIDENCE-BEWERTUNG:
- 1.0: Eindeutiges Datum mit klarem Feldverweis
- 0.8-0.9: Datum klar, Feldverweis sehr wahrscheinlich
- 0.6-0.7: Datum erkannt, Feldverweis unsicher
- 0.3-0.5: Datum möglich, Feldverweis unklar
- 0.0-0.2: Kein relevantes Datum gefunden

Erkenne Daten in verschiedenen Formaten: DD.MM.YYYY, DD/MM/YYYY, DD.MM.YY, "am 1. Juli 2025", etc.
Prüfe alle Geschäftsregeln und gib Warnungen aus.`;

// Hilfsfunktion zum Extrahieren von JSON aus Text
function extractJsonFromText(text: string): { json: string; explanation?: string } {
  // Versuche zuerst, den gesamten Text als JSON zu parsen
  try {
    JSON.parse(text);
    return { json: text };
  } catch {
    // Falls das nicht funktioniert, suche nach JSON-Block
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonStr = jsonMatch[0];
      // Text nach dem JSON als Erläuterung extrahieren
      const afterJson = text.substring(jsonMatch.index! + jsonStr.length).trim();
      return { 
        json: jsonStr, 
        explanation: afterJson || undefined 
      };
    }
    throw new Error('Kein gültiges JSON gefunden');
  }
}

export async function POST(request: NextRequest) {
  console.log('API Route wurde aufgerufen!');

  try {
    const { text, currentValues } = await request.json();

    console.log('Empfangene Daten:', { text, currentValues });

    // Claude API aufrufen
    const userPrompt = `
Analysiere folgenden Text und extrahiere alle Datumsinformationen:

Text: "${text}"

Aktuelle Feldwerte:
- Beginndatum: ${currentValues.beginndatum || 'nicht gesetzt'}
- Ablaufdatum: ${currentValues.ablaufdatum || 'nicht gesetzt'}  
- Erstzulassungsdatum: ${currentValues.erstzulassungsdatum || 'nicht gesetzt'}
- Anmeldedatum: ${currentValues.anmeldedatum || 'nicht gesetzt'}

Extrahiere nur die Daten, die im Text erwähnt sind. Bereits gesetzte Werte nicht überschreiben, außer sie werden explizit im Text geändert.
`;

    console.log('Sende Request an Claude...');

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
      max_tokens: 1000,
      temperature: 0.1 // Niedrig für konsistente Ergebnisse
    });

    console.log('Claude Response erhalten:', response);

    // Response-Text extrahieren und typen
    const responseContent = response.content[0];

    if (responseContent.type !== 'text') {
      console.error('Unerwarteter Content-Type von Claude');
      return NextResponse.json({
        success: false,
        error: 'Unerwarteter Content-Type von Claude'
      }, { status: 500 });
    }

    const responseText: string = responseContent.text;
    console.log('Claude Response Text:', responseText);

    // JSON aus Text extrahieren
    let extractedData: ClaudeResponse;
    let explanation: string | undefined;
    
    try {
      const { json, explanation: extractedExplanation } = extractJsonFromText(responseText);
      extractedData = JSON.parse(json) as ClaudeResponse;
      explanation = extractedExplanation;

      // Basis-Validierung der Response-Struktur
      if (!extractedData.extractedDates) {
        throw new Error('Fehlende extractedDates in Claude Response');
      }

      // Explanation aus dem JSON ins Objekt integrieren, falls nicht schon vorhanden
      if (explanation && !extractedData.explanation) {
        extractedData.explanation = explanation;
      }

    } catch (parseError: unknown) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unbekannter Parsing-Fehler';
      console.error('JSON Parse Error:', errorMessage);
      return NextResponse.json({
        success: false,
        error: 'Ungültige JSON-Antwort von Claude',
        details: errorMessage,
        rawResponse: responseText
      }, { status: 500 });
    }

    const result = {
      success: true,
      message: "Datums-Extraktion erfolgreich!",
      data: extractedData,
      originalText: text,
      timestamp: new Date().toISOString()
    };

    console.log('Sende finale Antwort:', result);

    return NextResponse.json(result);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Server-Fehler';
    console.error('Fehler in API Route:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Server error',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

// Für Debugging auch GET erlauben
export async function GET() {
  console.log('GET Request an extract-dates API');
  return NextResponse.json({
    message: "Extract-dates API ist aktiv!",
    timestamp: new Date().toISOString()
  });
}