import { createMcpHandler } from '@vercel/mcp-adapter';
import { ServiceABSEinarbeiterHelper } from '@/utils/ServiceABSEinarbeiterHelper';
import { FIELD_DEFINITIONS, generateDefaultValues, generateEchteEingabeValues } from '@/constants/fieldConfig';

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
    async (args, extra) => {
      const { chatInput, existingData = {} } = args as { chatInput: string; existingData?: Record<string, any> };
      
      try {
        // 1. KI-Extraktion der Daten aus Chat-Input
        const extractedData = await extractDataFromChat(chatInput, existingData);
      
      // 2. XML-Generierung mit extrahierten Daten
      const xml = ServiceABSEinarbeiterHelper.erzeugeSendeXML(extractedData.fieldValues);
      const formattedXml = ServiceABSEinarbeiterHelper.formatXML(xml);
      
      // 3. Statistiken und Zusammenfassung
      const fieldCount = ServiceABSEinarbeiterHelper.zaehleEingegebeneFelder(extractedData.fieldValues);
      const summary = ServiceABSEinarbeiterHelper.erstelleZusammenfassung(extractedData.fieldValues);
      
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
    async (args, extra) => {
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
 */
async function extractDataFromChat(chatInput: string, existingData: Record<string, any>) {
  // Standardwerte und echte Eingaben initialisieren
  const defaultValues = generateDefaultValues();
  const echteEingabeValues = generateEchteEingabeValues();
  
  // Bestehende Daten übernehmen
  const fieldValues = { ...defaultValues, ...existingData };
  
  // Einfache Datenextraktion (hier könnte Claude API integriert werden)
  const extractedFields: string[] = [];
  let confidence = 0.5;
  
  // Beispiel-Extraktion für Demo-Zwecke
  const text = chatInput.toLowerCase();
  
  // Fahrzeugmarke erkennen
  const markenRegex = /(bmw|mercedes|audi|volkswagen|vw|porsche|ford|opel)/i;
  const markeMatch = chatInput.match(markenRegex);
  if (markeMatch) {
    fieldValues.fahrzeugmarke = markeMatch[1];
    // FIELD_DEFINITIONS finden und echteEingabe setzen
    const fieldDef = FIELD_DEFINITIONS.find(f => f.key === 'fahrzeugmarke');
    if (fieldDef) {
      fieldDef.echteEingabe = markeMatch[1];
    }
    extractedFields.push('fahrzeugmarke');
    confidence += 0.2;
  }
  
  // Baujahr erkennen
  const jahrRegex = /baujahr\s*(\d{4})|(\d{4})\s*baujahr|jahr\s*(\d{4})/i;
  const jahrMatch = chatInput.match(jahrRegex);
  if (jahrMatch) {
    const jahr = jahrMatch[1] || jahrMatch[2] || jahrMatch[3];
    fieldValues.erstzulassungsdatum = `${jahr}-01-01`;
    const fieldDef = FIELD_DEFINITIONS.find(f => f.key === 'erstzulassungsdatum');
    if (fieldDef) {
      fieldDef.echteEingabe = `${jahr}-01-01`;
    }
    extractedFields.push('erstzulassungsdatum');
    confidence += 0.2;
  }
  
  // Versicherungsarten erkennen
  if (text.includes('vollkasko') || text.includes('kasko')) {
    const fieldDef = FIELD_DEFINITIONS.find(f => f.key === 'produktSparten');
    if (fieldDef && fieldDef.table) {
      // Vollkasko (KK) aktivieren
      const vollkaskoRow = {
        id: 'KK',
        beschreibung: 'KK',
        deckungssumme: '50000',
        selbstbeteiligung: '300'
      };
      fieldValues.produktSparten = [vollkaskoRow];
      fieldDef.echteEingabe = [vollkaskoRow];
      extractedFields.push('produktSparten');
      confidence += 0.3;
    }
  }
  
  return {
    fieldValues,
    extractedFields,
    confidence: Math.min(confidence, 1.0)
  };
}