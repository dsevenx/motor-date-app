#!/usr/bin/env node

// Einfacher Standalone MCP Server für ServiceABS XML Generation
// Direkte Implementation ohne externe Dependencies

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

// Tool: ServiceABS XML generieren
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === 'generate_serviceabs_xml') {
    try {
      const { chatInput, existingData = {} } = args;
      
      // Einfache Datenextraktion
      const extractedData = extractDataFromChat(chatInput, existingData);
      
      // Einfache XML-Generierung (vereinfacht)
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
  
  throw new Error(`Unbekanntes Tool: ${name}`);
});

// Tool-Liste bereitstellen
server.setRequestHandler('tools/list', async () => {
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
});

// Hilfsfunktionen
function extractDataFromChat(chatInput, existingData) {
  const fieldValues = { ...existingData };
  const extractedFields = [];
  let confidence = 0.5;
  
  const text = chatInput.toLowerCase();
  
  // Jahreskilometer erkennen
  const kmRegex = /(\d+)\s*(?:km|kilometer)\s*(?:pro\s+jahr|jährlich|im\s+jahr)/i;
  const kmMatch = chatInput.match(kmRegex);
  if (kmMatch) {
    fieldValues.jahreskilometer = parseInt(kmMatch[1]);
    extractedFields.push('jahreskilometer');
    confidence += 0.2;
  }
  
  // Typklassen erkennen
  const typklasseRegex = /typklasse[n]?\s*(?:erstmal|sind)?\s*(?:kh|haftpflicht)?\s*(\d+)\s*(?:und|,)?\s*(?:tk|teilkasko)?\s*(\d+)?/i;
  const typklasseMatch = chatInput.match(typklasseRegex);
  if (typklasseMatch) {
    const haftpflicht = parseInt(typklasseMatch[1]) || 0;
    const teilkasko = parseInt(typklasseMatch[2]) || 0;
    
    fieldValues.typklasseHaftpflicht = haftpflicht;
    fieldValues.typklasseTeilkasko = teilkasko;
    
    extractedFields.push('typklasseHaftpflicht', 'typklasseTeilkasko');
    confidence += 0.3;
  }
  
  // Fahrzeugmarke erkennen
  const markenRegex = /(bmw|mercedes|audi|volkswagen|vw|porsche|ford|opel|toyota|nissan|honda)/i;
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
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ServiceABS>
  <Fahrzeugdaten>
    <Jahreskilometer>${fieldValues.jahreskilometer || ''}</Jahreskilometer>
    <Fahrzeugmarke>${fieldValues.fahrzeugmarke || ''}</Fahrzeugmarke>
    <TypklasseHaftpflicht>${fieldValues.typklasseHaftpflicht || ''}</TypklasseHaftpflicht>
    <TypklasseTeilkasko>${fieldValues.typklasseTeilkasko || ''}</TypklasseTeilkasko>
  </Fahrzeugdaten>
  <Timestamp>${new Date().toISOString()}</Timestamp>
</ServiceABS>`;
  
  return xml;
}

function getBasicFieldDefinitions() {
  return [
    { key: 'jahreskilometer', description: 'Jährliche Kilometer (Zahl)' },
    { key: 'fahrzeugmarke', description: 'Marke des Fahrzeugs (Text)' },
    { key: 'typklasseHaftpflicht', description: 'Typklasse Haftpflicht (Zahl)' },
    { key: 'typklasseTeilkasko', description: 'Typklasse Teilkasko (Zahl)' }
  ];
}

// Server starten
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('ServiceABS MCP Server gestartet');
}

main().catch(console.error);