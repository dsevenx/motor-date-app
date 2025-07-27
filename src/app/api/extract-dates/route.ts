import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { ClaudeResponse,FIELD_DEFINITIONS } from '@/constants/fieldConfig';
import { 
  SYSTEM_PROMPT_FAHRZEUGDATEN, 
  validateExtractedData 
} from '@/constants/systempromts';

// Claude Client initialisieren
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

    // WICHTIG: System Prompt asynchron laden!
    const SYSTEM_PROMPT = await SYSTEM_PROMPT_FAHRZEUGDATEN();

    // Dynamisches User-Prompt basierend auf konfigurierten Feldern
    const fieldList = FIELD_DEFINITIONS.map(field => 
      `- ${field.label} (${field.key}): ${currentValues[field.key] || 'nicht gesetzt'}`
    ).join('\n');

    const userPrompt = `
Analysiere folgenden Text und extrahiere alle relevanten Informationen:

Text: "${text}"

Aktuelle Feldwerte:
${fieldList}

Extrahiere nur die Daten, die im Text erwähnt sind. Bereits gesetzte Werte nicht überschreiben, außer sie werden explizit im Text geändert.

WICHTIG: Achte besonders auf folgende Felder und deren Synonyme:
${FIELD_DEFINITIONS.map(field => 
  `- ${field.label}: ${field.synonyms.join(', ')}`
).join('\n')}

${FIELD_DEFINITIONS.find(f => f.key === 'stornodatum') ? 
  'SPEZIAL - Stornodatum: Formulierungen wie "musste ich es am [Datum] abmelden", "aufgrund [Grund] am [Datum]", "wegen [Grund] am [Datum]" deuten auf ein Stornodatum hin.' : ''}

WICHTIG: Antworte NUR mit JSON im angegebenen Format. Keine zusätzlichen Erklärungen!
`;

    console.log('Sende Request an Claude...');
    console.log('System Prompt Length:', SYSTEM_PROMPT.length);

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
      max_tokens: 1500, // Erhöht für komplexere Responses
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
      if (!extractedData.extractedData) {
        throw new Error('Fehlende extractedData in Claude Response');
      }

      // Validierung der extrahierten Daten
      const validationErrors = validateExtractedData(extractedData.extractedData);
      if (validationErrors.length > 0) {
        extractedData.validationErrors = [...(extractedData.validationErrors || []), ...validationErrors];
      }

      // Verarbeite Sparten-Aktionen falls vorhanden
      if (extractedData.spartenActions) {
        console.log('🔄 Verarbeite Sparten-Aktionen:', extractedData.spartenActions);
        
        // Verarbeite jede Sparte
        Object.entries(extractedData.spartenActions).forEach(([sparteKey, action]) => {
          if (action.active) {
            console.log(`✅ Aktiviere Sparte ${sparteKey}: ${action.reason}`);
            
            // Füge Sparten-Update zu extractedData hinzu
            const spartenField = `produktSparten`;
            if (!extractedData.extractedData[spartenField]) {
              extractedData.extractedData[spartenField] = {
                value: [],
                confidence: 0.9,
                source: 'Sparten-Erkennung',
                corrected: false,
                originalValue: null
              };
            }
            
            // Stelle sicher, dass der Wert ein Array ist
            const currentSparten = Array.isArray(extractedData.extractedData[spartenField].value) 
              ? extractedData.extractedData[spartenField].value 
              : [];
            
            // Füge die aktivierte Sparte hinzu, falls nicht bereits vorhanden
            const existingSparteIndex = currentSparten.findIndex((s: { sparte: string }) => s.sparte === sparteKey);
            if (existingSparteIndex === -1) {
              currentSparten.push({
                id: `sparte_${sparteKey}_${Date.now()}`,
                sparte: sparteKey,
                zustand: 'A',
                zustandsdetail: ' '
              });
              
              extractedData.extractedData[spartenField].value = currentSparten;
              extractedData.extractedData[spartenField].confidence = Math.max(
                extractedData.extractedData[spartenField].confidence || 0,
                0.9
              );
              
              // Füge Erklärung hinzu
              if (!extractedData.recognizedPhrases.includes(action.reason)) {
                extractedData.recognizedPhrases.push(action.reason);
              }
            }
          }
        });
      }

      // Explanation aus dem JSON ins Objekt integrieren, falls nicht schon vorhanden
      if (explanation && !extractedData.explanation) {
        extractedData.explanation = explanation;
      }

    } catch (parseError: unknown) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unbekannter Parsing-Fehler';
      console.error('JSON Parse Error:', errorMessage);
      console.error('Rohe Claude Response:', responseText);
      
      // Erweiterte Fehlerbehandlung - versuche nochmal mit expliziterem Prompt
      console.log('Versuche nochmal mit expliziterem JSON-Prompt...');
      
      try {
        const retryPrompt = `${userPrompt}

KRITISCH: Du MUSST mit einem gültigen JSON-Objekt antworten! Hier ist ein Beispiel der erwarteten Struktur:

{
  "extractedData": {
    "fahrerkreis": {"value": "E", "confidence": 0.95, "source": "alleiniger Fahrer"},
    "wirtschaftszweig": {"value": "W074", "confidence": 0.90, "source": "Unternehmen, das Tische herstellt"}
  },
  "overallConfidence": 0.92,
  "validationErrors": [],
  "suggestions": [],
  "recognizedPhrases": ["alleiniger Fahrer", "Unternehmen"],
  "explanation": "",
  "appliedCorrections": []
}

Antworte AUSSCHLIESSLICH mit JSON!`;

        const retryResponse = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: retryPrompt }],
          max_tokens: 1500,
          temperature: 0.05 // Noch niedriger für konsistentere JSON-Ausgabe
        });

        const retryText = retryResponse.content[0].type === 'text' ? retryResponse.content[0].text : '';
        console.log('Retry Response Text:', retryText);

        const { json: retryJson } = extractJsonFromText(retryText);
        extractedData = JSON.parse(retryJson) as ClaudeResponse;

        console.log('Retry erfolgreich!');

      } catch (retryError) {
        console.error('Auch Retry fehlgeschlagen:', retryError);
        return NextResponse.json({
          success: false,
          error: 'Claude antwortet nicht im erwarteten JSON-Format',
          details: errorMessage,
          rawResponse: responseText
        }, { status: 500 });
      }
    }

    const result = {
      success: true,
      message: "Daten-Extraktion erfolgreich!",
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
  
  try {
    // Teste den System Prompt
    const systemPrompt = await SYSTEM_PROMPT_FAHRZEUGDATEN();
    const promptLength = systemPrompt.length;
    const hasDropdownMappings = systemPrompt.includes('DROPDOWN-FELD WERTE');
    
    return NextResponse.json({
      message: "Extract-data API ist aktiv!",
      timestamp: new Date().toISOString(),
      systemPromptInfo: {
        length: promptLength,
        hasDropdownMappings,
        preview: systemPrompt.substring(0, 200) + '...'
      },
      configuredFields: FIELD_DEFINITIONS.map(field => ({
        key: field.key,
        label: field.label,
        type: field.type,
        hasDropdown: field.type === 'dropdown',
        domainId: field.dropdown?.domainId
      }))
    });
  } catch (error) {
    console.error('Error in GET handler:', error);
    return NextResponse.json({
      message: "Extract-data API ist aktiv, aber System Prompt hat Probleme",
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}