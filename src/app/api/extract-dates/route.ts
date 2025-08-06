import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { ClaudeResponse,FIELD_DEFINITIONS } from '@/constants/fieldConfig';
import { 
  SYSTEM_PROMPT_FAHRZEUGDATEN_SYNC,
  SYSTEM_PROMPT_FAHRZEUGDATEN, 
  validateExtractedData 
} from '@/constants/systempromts';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// Claude Client initialisieren (lazy initialization)
let anthropic: Anthropic | null = null;

const getAnthropicClient = (): Anthropic => {
  if (!anthropic) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required for the API to function');
    }
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropic;
};

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
    const SYSTEM_PROMPT = SYSTEM_PROMPT_FAHRZEUGDATEN_SYNC;

    // Dynamisches User-Prompt basierend auf konfigurierten Feldern
    const fieldList = FIELD_DEFINITIONS.map(field => 
      `- ${field.label} (${field.key}): ${currentValues[field.key] || 'nicht gesetzt'}`
    ).join('\n');

    // Extrahiere aktuelle Sparten- und Baustein-Tabellen für explizite Manipulation
    const spartenTable = currentValues['produktSparten'] || [];
    const bausteinKH = currentValues['produktBausteine_KH'] || [];
    const bausteinKK = currentValues['produktBausteine_KK'] || [];
    const bausteinEK = currentValues['produktBausteine_EK'] || [];
    const bausteinKU = currentValues['produktBausteine_KU'] || [];
    
    // 🔥 TOKEN-OPTIMIERUNG: Nur relevante Tabellen-Teile senden basierend auf Text-Kontext
    const optimizeTableData = (tableName: string, tableData: any) => {
      if (!tableData || typeof tableData === 'string' && tableData.trim() === '[]') {
        return '[]';
      }
      
      let parsedData;
      try {
        parsedData = typeof tableData === 'string' ? JSON.parse(tableData) : tableData;
      } catch {
        return '[]';
      }
      
      if (!Array.isArray(parsedData) || parsedData.length === 0) {
        return '[]';
      }
      
      // 🔥 WEITERE TOKEN-OPTIMIERUNG: Entferne redundante/unnötige Felder
      const removeRedundantFields = (item: any) => {
        const optimizedItem = { ...item };
        
        // knotenId entfernen - ist bereits in "id" enthalten
        if (optimizedItem.knotenId) {
          delete optimizedItem.knotenId;
        }
        
        // echteEingabe entfernen - kann Claude nicht ermitteln
        if (optimizedItem.echteEingabe !== undefined) {
          delete optimizedItem.echteEingabe;
        }
        
        return optimizedItem;
      };
      
      // Für Sparten: Alle senden aber optimiert (sind nur 4 Einträge)
      if (tableName === 'produktSparten') {
        const optimizedSparten = parsedData.map(removeRedundantFields);
        return JSON.stringify(optimizedSparten, null, 2);
      }
      
      // Für Bausteine: Nur aktive + erste 3 inaktive senden, optimiert
      const activeBausteine = parsedData.filter((item: any) => item.check === true).map(removeRedundantFields);
      const inactiveBausteine = parsedData.filter((item: any) => item.check !== true).slice(0, 3).map(removeRedundantFields);
      const optimizedData = [...activeBausteine, ...inactiveBausteine];
      
      // Info über weggelassene Einträge hinzufügen
      const totalCount = parsedData.length;
      const sentCount = optimizedData.length;
      
      if (sentCount < totalCount) {
        console.log(`🔧 Token-Optimierung ${tableName}: ${sentCount}/${totalCount} Einträge gesendet (${totalCount - sentCount} weggelassen)`);
      }
      
      // Berechne zusätzliche Ersparnis durch Feld-Optimierung
      const originalSize = JSON.stringify(parsedData.slice(0, optimizedData.length), null, 2).length;
      const optimizedSize = JSON.stringify(optimizedData, null, 2).length;
      const fieldSavings = originalSize - optimizedSize;
      
      if (fieldSavings > 0) {
        console.log(`🔧 Feld-Optimierung ${tableName}: ${fieldSavings} Zeichen gespart (knotenId + echteEingabe entfernt)`);
      }
      
      return JSON.stringify(optimizedData, null, 2);
    };
    
    const optimizedSpartenTable = optimizeTableData('produktSparten', spartenTable);
    const optimizedBausteinKH = optimizeTableData('produktBausteine_KH', bausteinKH);
    const optimizedBausteinKK = optimizeTableData('produktBausteine_KK', bausteinKK);
    const optimizedBausteinEK = optimizeTableData('produktBausteine_EK', bausteinEK);
    const optimizedBausteinKU = optimizeTableData('produktBausteine_KU', bausteinKU);

    const userPrompt = `
Analysiere folgenden Text und extrahiere alle relevanten Informationen:

Text: "${text}"

Aktuelle Feldwerte:
${fieldList}

🔥 WICHTIG - AKTUELLE TABELLEN (optimiert für Token-Effizienz):
⚠️ Bei Bausteinen sind nur aktive + Beispiel-Einträge gezeigt (zur Token-Optimierung)
⚠️ Gib alle Bausteine zurück, auch die nicht gezeigten - verwende gleiche Objektstruktur!
⚠️ FELD-OPTIMIERUNG: knotenId und echteEingabe wurden entfernt (Token-Einsparung)
⚠️ Füge diese Felder NICHT in deine Antwort hinzu - verwende nur die gezeigten Felder!

Aktuelle produktSparten-Tabelle:
${optimizedSpartenTable}

Aktuelle produktBausteine_KH-Tabelle (aktive + Beispiele):
${optimizedBausteinKH}

Aktuelle produktBausteine_KK-Tabelle (aktive + Beispiele):
${optimizedBausteinKK}

Aktuelle produktBausteine_EK-Tabelle (aktive + Beispiele):
${optimizedBausteinEK}

Aktuelle produktBausteine_KU-Tabelle (aktive + Beispiele):
${optimizedBausteinKU}

⚠️ ANWEISUNG: Gib diese Tabellen IMMER in der extractedData zurück - auch wenn du sie nur minimal änderst!
⚠️ Verwende EXAKT die gleiche Objektstruktur wie oben gezeigt!
⚠️ Bei Änderungen: Ändere nur die entsprechenden Felder (check, betrag, etc.) aber behalte alle anderen Eigenschaften!

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
    console.log('📊 ===== TOKEN USAGE ANALYSE =====');
    console.log('📊 System Prompt Length:', SYSTEM_PROMPT.length, 'Zeichen');
    console.log('📊 User Prompt Length:', userPrompt.length, 'Zeichen');
    console.log('📊 Total Prompt Length:', SYSTEM_PROMPT.length + userPrompt.length, 'Zeichen');
    
    // 🔍 DEBUG: Zeige nur relevante Teile der Prompts
    console.log('🔍 System Prompt enthält Sparten-Regeln:', SYSTEM_PROMPT.includes('SPARTEN & BAUSTEIN ERKENNUNG'));
    console.log('🔍 User Prompt enthält Test-Text:', `"${text}"`);
    console.log('🔍 User Prompt enthält Tabellen:', userPrompt.includes('produktSparten-Tabelle'));
    
    // Zeige die größten Komponenten des User Prompts (vor und nach Optimierung)
    console.log('📊 USER PROMPT BREAKDOWN:');
    console.log('📊 - Base Text:', `"${text}"`.length, 'Zeichen');
    console.log('📊 - Field List:', fieldList.length, 'Zeichen');
    
    const originalTableSizes = {
      sparten: JSON.stringify(spartenTable).length,
      kh: JSON.stringify(bausteinKH).length,
      kk: JSON.stringify(bausteinKK).length,
      ek: JSON.stringify(bausteinEK).length,
      ku: JSON.stringify(bausteinKU).length
    };
    
    const optimizedTableSizes = {
      sparten: optimizedSpartenTable.length,
      kh: optimizedBausteinKH.length,
      kk: optimizedBausteinKK.length,
      ek: optimizedBausteinEK.length,
      ku: optimizedBausteinKU.length
    };
    
    console.log('📊 TABELLEN-OPTIMIERUNG:');
    console.log(`📊 - Sparten: ${originalTableSizes.sparten} → ${optimizedTableSizes.sparten} Zeichen (${originalTableSizes.sparten - optimizedTableSizes.sparten} gespart)`);
    console.log(`📊 - KH: ${originalTableSizes.kh} → ${optimizedTableSizes.kh} Zeichen (${originalTableSizes.kh - optimizedTableSizes.kh} gespart)`);
    console.log(`📊 - KK: ${originalTableSizes.kk} → ${optimizedTableSizes.kk} Zeichen (${originalTableSizes.kk - optimizedTableSizes.kk} gespart)`);
    console.log(`📊 - EK: ${originalTableSizes.ek} → ${optimizedTableSizes.ek} Zeichen (${originalTableSizes.ek - optimizedTableSizes.ek} gespart)`);
    console.log(`📊 - KU: ${originalTableSizes.ku} → ${optimizedTableSizes.ku} Zeichen (${originalTableSizes.ku - optimizedTableSizes.ku} gespart)`);
    
    const totalOriginalTables = Object.values(originalTableSizes).reduce((sum, size) => sum + size, 0);
    const totalOptimizedTables = Object.values(optimizedTableSizes).reduce((sum, size) => sum + size, 0);
    const tableSavings = totalOriginalTables - totalOptimizedTables;
    
    console.log(`📊 GESAMT-ERSPARNIS: ${tableSavings} Zeichen (~${Math.ceil(tableSavings/4)} Tokens)`);

    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
      max_tokens: 2500, // Erhöht auf 2500 für vollständige Tabellen-Responses
      temperature: 0.1 // Niedrig für konsistente Ergebnisse
    });

    console.log('Claude Response erhalten:', response);
    
    // Token-Usage analysieren
    console.log('📊 ===== CLAUDE TOKEN USAGE =====');
    console.log('📊 Input Tokens:', response.usage?.input_tokens);
    console.log('📊 Output Tokens:', response.usage?.output_tokens);
    console.log('📊 Total Tokens:', (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0));
    console.log('📊 Stop Reason:', response.stop_reason);
    
    // Berechne geschätzte Token-pro-Zeichen Rate
    const totalChars = SYSTEM_PROMPT.length + userPrompt.length;
    const inputTokens = response.usage?.input_tokens || 0;
    const charsPerToken = totalChars / inputTokens;
    console.log('📊 Chars per Token Ratio:', charsPerToken.toFixed(2));
    
    // Check für abgeschnittene Antworten durch Token-Limit
    if (response.stop_reason === 'max_tokens') {
      console.error('⚠️ ===== TOKEN LIMIT ERREICHT =====');
      console.error('⚠️ Input Tokens:', inputTokens);
      console.error('⚠️ Output Tokens:', response.usage?.output_tokens);
      console.error('⚠️ Total Request Tokens:', (inputTokens + (response.usage?.output_tokens || 0)));
      console.error('⚠️ Max Output Tokens Setting:', 1500);
      console.error('⚠️ Problem: Request zu groß für vollständige Antwort');
      
      // Analyse der größten Prompt-Komponenten
      console.error('⚠️ PROMPT ANALYSE für Optimierung:');
      console.error('⚠️ - System Prompt:', SYSTEM_PROMPT.length, 'chars');
      console.error('⚠️ - User Input Text:', `"${text}"`.length, 'chars');
      console.error('⚠️ - Field List:', fieldList.length, 'chars');
      
      const tableTokens = JSON.stringify(spartenTable).length + 
                         JSON.stringify(bausteinKH).length + 
                         JSON.stringify(bausteinKK).length + 
                         JSON.stringify(bausteinEK).length + 
                         JSON.stringify(bausteinKU).length;
      console.error('⚠️ - All Tables Combined:', tableTokens, 'chars');
      
      return NextResponse.json({
        success: false,
        error: `Token-Limit erreicht: Input ${inputTokens} Tokens zu groß. Prompt-Länge: ${totalChars} Zeichen. Tabellen-Daten: ${tableTokens} Zeichen.`,
        debug: {
          inputTokens: inputTokens,
          outputTokens: response.usage?.output_tokens,
          totalChars: totalChars,
          tablesSize: tableTokens,
          charsPerToken: charsPerToken
        }
      }, { status: 500 });
    }

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
    
    // Erfolgreiche Token-Usage im Detail
    console.log('✅ ===== ERFOLGREICHE ANFRAGE =====');
    console.log('✅ Input Tokens:', response.usage?.input_tokens);
    console.log('✅ Output Tokens:', response.usage?.output_tokens);
    console.log('✅ Total Tokens:', (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0));
    console.log('✅ Response Length:', responseText.length, 'chars');
    console.log('✅ Stop Reason:', response.stop_reason);

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

      // Stelle sicher, dass alle Tabellen-Daten eindeutige IDs haben (außer Sparten/Bausteine)
      Object.keys(extractedData.extractedData).forEach(fieldKey => {
        // Skip Sparten- und Baustein-Tabellen, da diese über MotorProduktSpartenTree verwaltet werden
        if (fieldKey === 'produktSparten' || fieldKey.startsWith('produktBausteine_')) {
          return;
        }
        
        const fieldData = extractedData.extractedData[fieldKey];
        if (fieldData && Array.isArray(fieldData.value) && fieldData.value.length > 0) {
          console.log(`🔍 Prüfe Tabelle ${fieldKey}:`, fieldData.value);
          
          fieldData.value = fieldData.value.map((item, index) => {
            if (typeof item === 'object' && item !== null) {
              // Füge ID hinzu, falls nicht vorhanden
              if (!item.id) {
                const newId = `${fieldKey}_${Date.now()}_${index}`;
                console.log(`➕ Füge ID hinzu für ${fieldKey}[${index}]:`, newId);
                return { ...item, id: newId };
              }
            }
            return item;
          });
        }
      });

      // Validierung der extrahierten Daten
      const validationErrors = validateExtractedData(extractedData.extractedData);
      if (validationErrors.length > 0) {
        extractedData.validationErrors = [...(extractedData.validationErrors || []), ...validationErrors];
      }

      // Sparten-Aktionen werden an das Frontend weitergereicht, aber nicht direkt verarbeitet
      // Das ChatComponent wird diese über onFieldDefinitionsChange an MotorProduktSpartenTree weiterleiten
      if (extractedData.spartenActions) {
        console.log('🔄 Sparten-Aktionen erkannt (werden an Frontend weitergeleitet):', extractedData.spartenActions);
      }

      // Explanation aus dem JSON ins Objekt integrieren, falls nicht schon vorhanden
      if (explanation && !extractedData.explanation) {
        extractedData.explanation = explanation;
      }

    } catch (parseError: unknown) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unbekannter Parsing-Fehler';
      console.error('JSON Parse Error:', errorMessage);
      console.error('Rohe Claude Response:', responseText);
      
      // KEIN RETRY MEHR - sofortiger Fehler bei JSON-Parse-Problemen
      console.log('JSON-Parsing fehlgeschlagen - KEIN Retry');
      
      return NextResponse.json({
        success: false,
        error: 'Claude antwortet nicht im erwarteten JSON-Format',
        details: errorMessage,
        rawResponse: responseText.substring(0, 1000) + '...' // Nur ersten Teil zeigen
      }, { status: 500 });
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

// Für Debugging auch GET erlauben - mit Token-Usage-Test
export async function GET() {
  console.log('GET Request an extract-dates API');
  
  try {
    // Teste BEIDE System Prompts für Vergleich
    const syncSystemPrompt = SYSTEM_PROMPT_FAHRZEUGDATEN_SYNC;
    const asyncSystemPrompt = await SYSTEM_PROMPT_FAHRZEUGDATEN();
    
    const syncPromptLength = syncSystemPrompt.length;
    const asyncPromptLength = asyncSystemPrompt.length;
    const hasDropdownMappings = syncSystemPrompt.includes('DROPDOWN-FELD WERTE');
    
    // Simuliere einen realistischen User Prompt mit VOLLSTÄNDIGEN Tabellen-Daten
    const testText = "VK mit SB 300/150";
    
    // REALISTISCHE MOCK-DATEN - simuliere einen vollständig gefüllten Vertrag
    const mockCurrentValues: Record<string, string> = {};
    
    // Alle Felder aus FIELD_DEFINITIONS füllen
    FIELD_DEFINITIONS.forEach(field => {
      if (field.key === 'produktSparten') {
        mockCurrentValues[field.key] = JSON.stringify([
          {"id": "KH", "beschreibung": "Kfz-Haftpflicht", "check": true, "zustand": " ", "zustandsdetail": " "},
          {"id": "KK", "beschreibung": "Kfz-Vollkasko", "check": false, "zustand": " ", "zustandsdetail": " "},
          {"id": "EK", "beschreibung": "Kfz-Teilkasko", "check": false, "zustand": " ", "zustandsdetail": " "},
          {"id": "KU", "beschreibung": "Unfall Sparte", "check": false, "zustand": " ", "zustandsdetail": " "}
        ]);
      } else if (field.key === 'produktBausteine_KH') {
        // Simuliere 15 KH-Bausteine
        const khBausteine = Array.from({length: 15}, (_, i) => ({
          "id": `KH_${String(i+1).padStart(3, '0')}`,
          "beschreibung": `KH Baustein ${i+1} - Beispiel Beschreibung für Haftpflicht-Baustein Nummer ${i+1} mit längerer Beschreibung`,
          "check": i < 5, // Erste 5 aktiv
          "betrag": i % 3 === 0 ? 500 : 0,
          "betragsLabel": i % 3 === 0 ? "Betrag" : "",
          "knotenId": `KH_NODE_${String(i+1).padStart(3, '0')}`
        }));
        mockCurrentValues[field.key] = JSON.stringify(khBausteine);
      } else if (field.key === 'produktBausteine_KK') {
        // Simuliere 20 KK-Bausteine
        const kkBausteine = Array.from({length: 20}, (_, i) => ({
          "id": `KK_${String(i+1).padStart(3, '0')}`,
          "beschreibung": `Vollkasko Baustein ${i+1} - Detaillierte Beschreibung für Vollkasko-Baustein mit verschiedenen Optionen und Konfigurationen für ${i+1}`,
          "check": i < 8, // Erste 8 aktiv
          "betrag": i < 3 ? (i === 0 ? 300 : i === 1 ? 150 : 1000) : 0,
          "betragsLabel": i < 3 ? "Selbstbeteiligung" : "",
          "knotenId": `KK_KNOTEN_${String(i+1).padStart(3, '0')}`
        }));
        mockCurrentValues[field.key] = JSON.stringify(kkBausteine);
      } else if (field.key === 'produktBausteine_EK') {
        // Simuliere 12 EK-Bausteine
        const ekBausteine = Array.from({length: 12}, (_, i) => ({
          "id": `EK_${String(i+1).padStart(3, '0')}`,
          "beschreibung": `Teilkasko Baustein ${i+1} - Spezielle Teilkasko-Konfiguration mit erweiterten Optionen und Detaileinstellungen`,
          "check": i < 4,
          "betrag": i === 0 ? 150 : i === 1 ? 500 : 0,
          "betragsLabel": i < 2 ? "Selbstbeteiligung" : "",
          "knotenId": `EK_KNOTEN_${String(i+1).padStart(3, '0')}`
        }));
        mockCurrentValues[field.key] = JSON.stringify(ekBausteine);
      } else if (field.key === 'produktBausteine_KU') {
        // Simuliere 8 KU-Bausteine
        const kuBausteine = Array.from({length: 8}, (_, i) => ({
          "id": `KU_${String(i+1).padStart(3, '0')}`,
          "beschreibung": `Unfall Baustein ${i+1} - Umfassende Unfallversicherung mit speziellen Leistungen und Zusatzoptionen`,
          "check": i < 2,
          "betrag": i === 0 ? 10000 : 0,
          "betragsLabel": i === 0 ? "Versicherungssumme" : "",
          "knotenId": `KU_KNOTEN_${String(i+1).padStart(3, '0')}`
        }));
        mockCurrentValues[field.key] = JSON.stringify(kuBausteine);
      } else if (field.key === 'kilometerstaende') {
        // Simuliere mehrere Kilometerstände
        mockCurrentValues[field.key] = JSON.stringify([
          {"id": "km_001", "datum": "2024-01-15", "art": "6", "kmstand": 25000},
          {"id": "km_002", "datum": "2024-06-15", "art": "2", "kmstand": 32000},
          {"id": "km_003", "datum": "2024-12-15", "art": "6", "kmstand": 38500}
        ]);
      } else if (field.key === 'zubehoer') {
        // Simuliere Zubehör-Einträge
        mockCurrentValues[field.key] = JSON.stringify([
          {"id": "zub_001", "art": "ZUB300", "beschreibung": "Sportfahrwerk mit Tieferlegung", "neuwert": 2500},
          {"id": "zub_002", "art": "ZUB301", "beschreibung": "Leistungssteigerung Motor", "neuwert": 3500},
          {"id": "zub_003", "art": "ZUB305", "beschreibung": "Vollfolierung Matt-Schwarz", "neuwert": 1800}
        ]);
      } else {
        // Für andere Felder Standard-Werte setzen
        mockCurrentValues[field.key] = field.type === 'date' ? '2024-07-15' :
                                     field.type === 'number' ? '25000' :
                                     field.type === 'text' ? 'BMW X5 M50d' :
                                     'nicht gesetzt';
      }
    });
    
    // Erstelle den User Prompt wie in POST
    const fieldList = FIELD_DEFINITIONS.map(field => 
      `- ${field.label} (${field.key}): ${mockCurrentValues[field.key] || 'nicht gesetzt'}`
    ).join('\n');
    
    const testUserPrompt = `
Analysiere folgenden Text und extrahiere alle relevanten Informationen:

Text: "${testText}"

Aktuelle Feldwerte:
${fieldList}

🔥 WICHTIG - AKTUELLE TABELLEN (immer komplett zurückgeben):

Aktuelle produktSparten-Tabelle:
${mockCurrentValues['produktSparten']}

Aktuelle produktBausteine_KH-Tabelle:
${mockCurrentValues['produktBausteine_KH']}

Aktuelle produktBausteine_KK-Tabelle:
${mockCurrentValues['produktBausteine_KK']}

Aktuelle produktBausteine_EK-Tabelle:
${mockCurrentValues['produktBausteine_EK']}

Aktuelle produktBausteine_KU-Tabelle:
${mockCurrentValues['produktBausteine_KU']}
`;

    const syncTotalChars = syncPromptLength + testUserPrompt.length;
    const asyncTotalChars = asyncPromptLength + testUserPrompt.length;
    const syncEstimatedTokens = Math.ceil(syncTotalChars / 4);
    const asyncEstimatedTokens = Math.ceil(asyncTotalChars / 4);
    
    return NextResponse.json({
      message: "Extract-data API ist aktiv!",
      timestamp: new Date().toISOString(),
      tokenAnalysis: {
        syncSystemPromptChars: syncPromptLength,
        asyncSystemPromptChars: asyncPromptLength,
        promptSizeDifference: asyncPromptLength - syncPromptLength,
        testUserPromptChars: testUserPrompt.length,
        syncTotalChars: syncTotalChars,
        asyncTotalChars: asyncTotalChars,
        syncEstimatedTokens: syncEstimatedTokens,
        asyncEstimatedTokens: asyncEstimatedTokens,
        tokenIncrease: asyncEstimatedTokens - syncEstimatedTokens,
        syncWarningLevel: syncEstimatedTokens > 10000 ? 'HIGH' : syncEstimatedTokens > 5000 ? 'MEDIUM' : 'LOW',
        asyncWarningLevel: asyncEstimatedTokens > 10000 ? 'HIGH' : asyncEstimatedTokens > 5000 ? 'MEDIUM' : 'LOW'
      },
      systemPromptInfo: {
        syncLength: syncPromptLength,
        asyncLength: asyncPromptLength,
        hasDropdownMappings,
        syncPreview: syncSystemPrompt.substring(0, 200) + '...',
        asyncPreview: asyncSystemPrompt.substring(0, 200) + '...'
      },
      configuredFields: FIELD_DEFINITIONS.map(field => ({
        key: field.key,
        label: field.label,
        type: field.type,
        hasDropdown: field.type === 'dropdown',
        domainId: field.dropdown?.domainId
      })),
      testUserPromptSample: testUserPrompt.substring(0, 500) + '...',
      recommendation: asyncEstimatedTokens > 10000 ? 'CRITICAL: Use SYNC prompt or optimize tables' : 
                     asyncEstimatedTokens > 5000 ? 'WARNING: Consider SYNC prompt for smaller requests' : 
                     'OK: Safe to use either prompt'
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