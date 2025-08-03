#!/usr/bin/env node

// Funktionierender MCP Server für ServiceABS XML Generation
// Kompatibel mit @modelcontextprotocol/sdk@1.17.1

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server(
  {
    name: 'serviceabs-xml-generator',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tools/call Handler mit korrekter SDK API
server.setRequestHandler({
  method: 'tools/call',
  handler: async (request) => {
    const { name, arguments: args } = request.params;
    
    if (name === 'generate_serviceabs_xml') {
      try {
        const { chatInput, existingData = {} } = args || {};
        
        if (!chatInput) {
          throw new Error('chatInput ist erforderlich');
        }
        
        // Datenextraktion
        const extractedData = extractDataFromChat(chatInput, existingData);
        
        // XML-Generierung
        const xml = generateSimpleXML(extractedData.fieldValues);
        
        return {
          content: [
            {
              type: 'text',
              text: `ServiceABS XML erfolgreich generiert:\n\n${xml}\n\nExtrahierte Felder: ${extractedData.extractedFields.join(', ')}\nKonfidenz: ${Math.round(extractedData.confidence * 100)}%`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Fehler bei XML-Generierung: ${error.message}`
            }
          ]
        };
      }
    }
    
    if (name === 'get_field_definitions') {
      try {
        const fieldInfo = getBasicFieldDefinitions();
        
        return {
          content: [
            {
              type: 'text',
              text: `Verfügbare Felder:\n\n${fieldInfo.map(field => `- ${field.key}: ${field.description}`).join('\n')}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Fehler beim Laden der Feldkonfigurationen: ${error.message}`
            }
          ]
        };
      }
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `Unbekanntes Tool: ${name}`
        }
      ],
      isError: true
    };
  }
});

// Tools/list Handler
server.setRequestHandler({
  method: 'tools/list',
  handler: async () => {
    return {
      tools: [
        {
          name: 'generate_serviceabs_xml',
          description: 'Erstellt ServiceABS-Einarbeiter XML aus natürlichsprachigem Text für Fahrzeugversicherungsdaten',
          inputSchema: {
            type: 'object',
            properties: {
              chatInput: {
                type: 'string',
                description: 'Natürlichsprachiger Text mit Fahrzeugdaten (z.B. "BMW X5, Baujahr 2020, Vollkasko")'
              },
              existingData: {
                type: 'object',
                description: 'Optional: Bereits vorhandene Felddaten',
                additionalProperties: true
              }
            },
            required: ['chatInput']
          }
        },
        {
          name: 'get_field_definitions',
          description: 'Liefert die verfügbaren Feldkonfigurationen für Fahrzeugdaten',
          inputSchema: {
            type: 'object',
            properties: {
              fieldType: {
                type: 'string',
                description: 'Optional: Filterung nach Feldtyp'
              }
            }
          }
        }
      ]
    };
  }
});

// Hilfsfunktionen
function extractDataFromChat(chatInput, existingData) {
  const fieldValues = { ...existingData };
  const extractedFields = [];
  let confidence = 0.5;
  
  const text = chatInput.toLowerCase();
  
  // Jahreskilometer erkennen (12000 km, 12000 kilometer)
  const kmRegex = /(\d+)\s*(?:km|kilometer)\s*(?:pro\s+jahr|jährlich|im\s+jahr|jahr)/i;
  const kmMatch = chatInput.match(kmRegex);
  if (kmMatch) {
    fieldValues.jahreskilometer = parseInt(kmMatch[1]);
    extractedFields.push('jahreskilometer');
    confidence += 0.3;
  }
  
  // Typklassen erkennen (KH 12 und TK 8, Haftpflicht 12 Teilkasko 8)
  const typklasseRegex = /(?:typklasse[n]?|kh|haftpflicht)?\s*(?:erstmal|sind)?\s*(?:kh|haftpflicht)?\s*(\d+)\s*(?:und|,)?\s*(?:tk|teilkasko)?\s*(\d+)?/i;
  const typklasseMatch = chatInput.match(typklasseRegex);
  if (typklasseMatch) {
    const haftpflicht = parseInt(typklasseMatch[1]) || 0;
    const teilkasko = parseInt(typklasseMatch[2]) || 0;
    
    fieldValues.typklasseHaftpflicht = haftpflicht;
    if (teilkasko > 0) {
      fieldValues.typklasseTeilkasko = teilkasko;
      extractedFields.push('typklasseHaftpflicht', 'typklasseTeilkasko');
    } else {
      extractedFields.push('typklasseHaftpflicht');
    }
    confidence += 0.4;
  }
  
  // Fahrzeugmarke erkennen
  const markenRegex = /(bmw|mercedes|audi|volkswagen|vw|porsche|ford|opel|toyota|nissan|honda|skoda|seat)/i;
  const markeMatch = chatInput.match(markenRegex);
  if (markeMatch) {
    fieldValues.fahrzeugmarke = markeMatch[1].toUpperCase();
    extractedFields.push('fahrzeugmarke');
    confidence += 0.2;
  }
  
  return {
    fieldValues,
    extractedFields,
    confidence: Math.min(confidence, 1.0)
  };
}

function generateSimpleXML(fieldValues) {
  const timestamp = new Date().toISOString();
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ServiceABS_Einarbeiter>
  <Header>
    <Timestamp>${timestamp}</Timestamp>
    <System>Claude Desktop MCP Integration</System>
  </Header>
  <Fahrzeugdaten>
    ${fieldValues.jahreskilometer ? `<Jahreskilometer>${fieldValues.jahreskilometer}</Jahreskilometer>` : ''}
    ${fieldValues.fahrzeugmarke ? `<Fahrzeugmarke>${fieldValues.fahrzeugmarke}</Fahrzeugmarke>` : ''}
    ${fieldValues.typklasseHaftpflicht ? `<TypklasseHaftpflicht>${fieldValues.typklasseHaftpflicht}</TypklasseHaftpflicht>` : ''}
    ${fieldValues.typklasseTeilkasko ? `<TypklasseTeilkasko>${fieldValues.typklasseTeilkasko}</TypklasseTeilkasko>` : ''}
  </Fahrzeugdaten>
  <Metadaten>
    <GenerierungsZeitpunkt>${timestamp}</GenerierungsZeitpunkt>
    <Quelle>KI-Extraktion aus Natürlichsprachiger Eingabe</Quelle>
  </Metadaten>
</ServiceABS_Einarbeiter>`;
  
  return xml;
}

function getBasicFieldDefinitions() {
  return [
    { key: 'jahreskilometer', description: 'Jährliche Fahrleistung in Kilometern (Zahl)' },
    { key: 'fahrzeugmarke', description: 'Marke/Hersteller des Fahrzeugs (Text)' },
    { key: 'typklasseHaftpflicht', description: 'Typklasse für Haftpflichtversicherung (Zahl 10-25)' },
    { key: 'typklasseTeilkasko', description: 'Typklasse für Teilkaskoversicherung (Zahl 10-33)' }
  ];
}

// Server starten
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('✅ ServiceABS MCP Server erfolgreich gestartet');
  } catch (error) {
    console.error('❌ Fehler beim Starten des MCP Servers:', error);
    process.exit(1);
  }
}

main();