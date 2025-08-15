import { createMcpHandler } from '@vercel/mcp-adapter';
import { ServiceABSEinarbeiterHelper } from '@/utils/ServiceABSEinarbeiterHelper';
import { FIELD_DEFINITIONS, generateEchteEingabeValues } from '@/constants/fieldConfig';

// MCP Server für ServiceABS-Einarbeiter XML Generation
const handler = createMcpHandler((server) => {
  server.tool(
    'generate_serviceabs_xml',
    {
      chatInput: {
        type: 'string',
        description: 'Natürlichsprachiger Text mit Fahrzeugdaten (z.B. "BMW X5, Baujahr 2020, Vollkasko")'
      },
      existingData: {
        type: 'object',
        description: 'Optional: Bereits vorhandene Felddaten'
      }
    },
    async (args) => {
      const { chatInput, existingData = {} } = args as { chatInput: string; existingData?: Record<string, any> };
      
      try {
        // 1. KI-Extraktion der Daten aus Chat-Input
        const extractedData = await extractDataFromChat(chatInput, existingData);
      
      // 2. XML-Generierung mit extrahierten Daten
      console.log('🔍 ===== MCP XML GENERIERUNG =====');
      console.log('🔍 FieldValues für XML:', JSON.stringify(extractedData.fieldValues, null, 2));
      console.log('🔍 FIELD_DEFINITIONS echteEingabe Status:');
      FIELD_DEFINITIONS.filter(f => f.echteEingabe !== undefined && f.echteEingabe !== f.defaultValue)
        .forEach(f => console.log(`🔍 - ${f.key}: ${JSON.stringify(f.echteEingabe)}`));
      console.log('🔍 ===== ENDE XML GENERIERUNG VORBEREITUNG =====');
      
      const xml = ServiceABSEinarbeiterHelper.erzeugeSendeXML(extractedData.fieldValues);
      const formattedXml = ServiceABSEinarbeiterHelper.formatXML(xml);
      
      console.log('🔍 ===== GENERIERTES XML =====');
      console.log(formattedXml);
      console.log('🔍 ===== ENDE GENERIERTES XML =====');
      
      // 3. Statistiken und Zusammenfassung
      const fieldCount = ServiceABSEinarbeiterHelper.zaehleEingegebeneFelder(extractedData.fieldValues);
      const summary = ServiceABSEinarbeiterHelper.erstelleZusammenfassung(extractedData.fieldValues);
      
      console.log('🔍 ===== MCP STATISTIKEN =====');
      console.log('🔍 Field Count:', fieldCount);
      console.log('🔍 Summary:', summary);
      console.log('🔍 Extracted Fields:', extractedData.extractedFields);
      console.log('🔍 Confidence:', extractedData.confidence);
      console.log('🔍 ===== ENDE MCP STATISTIKEN =====');
      
        return {
          content: [{
            type: 'text',
            text: `ServiceABS XML erfolgreich generiert:\n\n${formattedXml}\n\nStatistiken:\n- Felder: ${fieldCount}\n- XML-Größe: ${formattedXml.length} Zeichen\n- Extrahierte Felder: ${extractedData.extractedFields.join(', ')}\n- Konfidenz: ${Math.round(extractedData.confidence * 100)}%`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Fehler bei XML-Generierung: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`
          }]
        };
      }
    }
  );

  server.tool(
    'get_field_definitions',
    {
      fieldType: {
        type: 'string',
        description: 'Optional: Filterung nach Feldtyp (date, text, number, table, etc.)'
      }
    },
    async (args) => {
      const { fieldType } = args as { fieldType?: string };
    try {
      let fields = FIELD_DEFINITIONS;
      
      if (fieldType) {
        fields = FIELD_DEFINITIONS.filter(field => field.type === fieldType);
      }
      
      const fieldInfo = fields.map(field => ({
        key: field.key,
        label: field.label,
        type: field.type,
        synonyms: field.synonyms,
        required: field.required || false,
        validation: field.validation,
        ...(field.table && {
          tableColumns: field.table.columns.map(col => ({
            key: col.key,
            label: col.label,
            type: col.type
          }))
        })
      }));
      
        return {
          content: [{
            type: 'text',
            text: `Feldkonfigurationen (${fieldInfo.length} Felder):\n\n${fieldInfo.map(field => `- ${field.key} (${field.type}): ${field.label}`).join('\n')}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Fehler beim Laden der Feldkonfigurationen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`
          }]
        };
      }
    }
  );
});

export const GET = handler;
export const POST = handler;

/**
 * Extrahiert Fahrzeugdaten aus natürlichsprachigem Text
 * VERWENDET DIESELBE CLAUDE AI LOGIK WIE DER WEB-CHAT
 */
async function extractDataFromChat(chatInput: string, existingData: Record<string, any>) {
  console.log('🚀 MCP: Starte Claude AI Extraktion...');
  console.log('🚀 MCP Input:', chatInput);
  console.log('🚀 MCP existingData:', Object.keys(existingData));
  
  try {
    // 1. Aktuelle Feldwerte mit existierenden Daten erstellen (wie Web-Chat)
    // WICHTIG: Verwende generateEchteEingabeValues() für konsistente Initialisierung
    const baseValues = generateEchteEingabeValues();
    const currentValues: Record<string, string> = {};
    
    // FIELD_DEFINITIONS durchgehen und aktuelle Werte sammeln (wie Web-Chat)
    FIELD_DEFINITIONS.forEach(field => {
      let value: any;
      
      // Prüfe existingData first, dann baseValues, dann defaultValue
      if (existingData[field.key] !== undefined) {
        value = existingData[field.key];
      } else if (baseValues[field.key] !== undefined) {
        value = baseValues[field.key];
      } else {
        value = field.defaultValue || '';
      }
      
      // Konvertiere zu String für Claude API
      if (typeof value === 'object') {
        currentValues[field.key] = JSON.stringify(value);
      } else {
        currentValues[field.key] = String(value);
      }
    });
    
    console.log('🚀 MCP currentValues für Claude API:', currentValues);
    
    // 2. DIREKTER AUFRUF DER CLAUDE API (wie Web-Chat)
    // Dynamische URL-Erstellung für Flexibilität
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
    const apiUrl = `${baseUrl}/api/extract-dates`;
    
    console.log('🚀 MCP: Rufe Claude API auf:', apiUrl);
    
    // 🔍 VOLLSTÄNDIGE REQUEST-LOGGING
    const requestBody = {
      text: chatInput,
      currentValues: currentValues
    };
    console.log('📤 ===== MCP REQUEST AN CLAUDE API =====');
    console.log('📤 URL:', apiUrl);
    console.log('📤 Text:', JSON.stringify(chatInput, null, 2));
    console.log('📤 CurrentValues Anzahl:', Object.keys(currentValues).length);
    console.log('📤 CurrentValues Sample:', JSON.stringify(Object.fromEntries(Object.entries(currentValues).slice(0, 5)), null, 2));
    console.log('📤 Vollständiger Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('📤 ===== ENDE MCP REQUEST =====');
    
    const extractResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!extractResponse.ok) {
      const errorText = await extractResponse.text();
      console.error('❌ MCP Claude API HTTP Error:', extractResponse.status, extractResponse.statusText);
      console.error('❌ MCP Claude API Error Body:', errorText);
      throw new Error(`Claude API Error: ${extractResponse.status} - ${errorText}`);
    }
    
    const result = await extractResponse.json();
    
    // 🔍 VOLLSTÄNDIGE RESPONSE-LOGGING
    console.log('📥 ===== MCP CLAUDE API RESPONSE =====');
    console.log('📥 Success:', result.success);
    console.log('📥 Data verfügbar:', !!result.data);
    if (result.data) {
      console.log('📥 ExtractedData verfügbar:', !!result.data.extractedData);
      console.log('📥 ExtractedData Keys:', result.data.extractedData ? Object.keys(result.data.extractedData) : 'none');
      console.log('📥 Vollständige Claude Response:', JSON.stringify(result, null, 2));
    }
    if (result.error) {
      console.error('📥 Claude API Error:', result.error);
    }
    console.log('📥 ===== ENDE MCP CLAUDE RESPONSE =====');
    
    if (!result.success || !result.data) {
      throw new Error('Claude API returned no data');
    }
    
    const aiData = result.data;
    
    // 3. DATEN VERARBEITUNG (wie Web-Chat processExtractedData)
    const fieldValues = { ...generateEchteEingabeValues(), ...existingData };
    const extractedFields: string[] = [];
    let totalConfidence = 0;
    let fieldCount = 0;
    
    if (aiData.extractedData && typeof aiData.extractedData === 'object') {
      // Verarbeite alle extrahierten Felder (wie Web-Chat)
      Object.entries(aiData.extractedData).forEach(([fieldKey, extractedValue]: [string, any]) => {
        console.log(`🔍 MCP: Verarbeite Feld ${fieldKey}:`, extractedValue);
        
        if (!extractedValue || typeof extractedValue !== 'object') {
          console.warn(`❌ MCP: Ungültiger extractedValue für ${fieldKey}`);
          return;
        }
        
        // Confidence-Check (wie Web-Chat)
        if (!extractedValue.value || extractedValue.confidence <= 0.5) {
          console.log(`⏭️ MCP: Überspringe ${fieldKey} - niedrige Confidence`);
          return;
        }
        
        // FIELD_DEFINITIONS finden und echteEingabe setzen (wie Web-Chat)
        const fieldDef = FIELD_DEFINITIONS.find(f => f.key === fieldKey);
        if (fieldDef) {
          console.log(`✅ MCP: Update ${fieldKey} = ${extractedValue.value}`);
          
          // Setze echteEingabe Flag in FIELD_DEFINITIONS (boolean!)
          fieldDef.echteEingabe = extractedValue.value;
          
          // Setze auch in fieldValues für XML-Generierung
          fieldValues[fieldKey] = extractedValue.value;
          
          extractedFields.push(fieldKey);
          totalConfidence += extractedValue.confidence;
          fieldCount++;
        } else {
          console.warn(`❌ MCP: Keine FieldDefinition gefunden für ${fieldKey}`);
        }
      });
    }
    
    const avgConfidence = fieldCount > 0 ? totalConfidence / fieldCount : 0;
    
    console.log('✅ MCP: Claude AI Extraktion abgeschlossen');
    console.log(`✅ MCP: ${extractedFields.length} Felder extrahiert: ${extractedFields.join(', ')}`);
    console.log(`✅ MCP: Durchschnittliche Konfidenz: ${Math.round(avgConfidence * 100)}%`);
    
    return {
      fieldValues,
      extractedFields,
      confidence: avgConfidence
    };
    
  } catch (error) {
    console.error('❌ ===== MCP CLAUDE API FEHLER =====');
    console.error('❌ Error Type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('❌ Error Message:', error instanceof Error ? error.message : String(error));
    console.error('❌ Full Error:', error);
    console.error('❌ Stack Trace:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('❌ ===== ENDE MCP FEHLER =====');
    
    // KEINEN Fallback - werfe Fehler weiter, um das Problem zu identifizieren
    throw new Error(`MCP Claude API Integration fehlgeschlagen: ${error instanceof Error ? error.message : String(error)}`);
  }
}