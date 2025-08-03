#!/usr/bin/env node

// Standalone MCP Server für ServiceABS XML Generation
// Direkte Integration ohne HTTP-Calls

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Importiere die ServiceABS Helper und Field Definitions direkt
try {
  const { ServiceABSEinarbeiterHelper } = require('./src/utils/ServiceABSEinarbeiterHelper.tsx');
  const { FIELD_DEFINITIONS, generateDefaultValues } = require('./src/constants/fieldConfig.tsx');
  
  // Starte den MCP Server
  startMcpServer();
} catch (error) {
  console.error('Fehler beim Laden der Abhängigkeiten:', error.message);
  console.error('Stelle sicher, dass alle npm dependencies installiert sind.');
  process.exit(1);
}

function startMcpServer() {

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
        
        // Direkte Verarbeitung ohne HTTP-Call
        const extractedData = await extractDataFromChat(chatInput, existingData);
        
        // XML-Generierung mit extrahierten Daten
        const xml = ServiceABSEinarbeiterHelper.erzeugeSendeXML(extractedData.fieldValues);
        const formattedXml = ServiceABSEinarbeiterHelper.formatXML(xml);
        
        // Statistiken und Zusammenfassung
        const fieldCount = ServiceABSEinarbeiterHelper.zaehleEingegebeneFelder(extractedData.fieldValues);
        const summary = ServiceABSEinarbeiterHelper.erstelleZusammenfassung(extractedData.fieldValues);
        
        return {
          content: [
            {
              type: 'text',
              text: `ServiceABS XML erfolgreich generiert:\n\n${formattedXml}\n\nStatistiken:\n- Felder: ${fieldCount}\n- XML-Größe: ${formattedXml.length} Zeichen\n- Extrahierte Felder: ${extractedData.extractedFields.join(', ')}\n- Konfidenz: ${Math.round(extractedData.confidence * 100)}%`
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
        const { fieldType } = args || {};
        
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
          content: [
            {
              type: 'text',
              text: `Feldkonfigurationen (${fieldInfo.length} Felder):\n\n${fieldInfo.map(field => `- ${field.key} (${field.type}): ${field.label}`).join('\n')}`
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
                description: 'Optional: Filterung nach Feldtyp (date, text, number, table, etc.)',
                enum: ['date', 'text', 'number', 'boolean', 'select', 'table', 'single-line-table', 'tristate', 'dropdown']
              }
            }
          }
        }
      ]
    };
  });

  // Server starten
  async function startServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('ServiceABS MCP Server gestartet');
  }

  startServer().catch(console.error);
}

// Hilfsfunktion für Datenextraktion
async function extractDataFromChat(chatInput, existingData) {
  // Standardwerte initialisieren
  const defaultValues = generateDefaultValues();
  
  // Bestehende Daten übernehmen
  const fieldValues = { ...defaultValues, ...existingData };
  
  // Einfache Datenextraktion
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
    // Typklassen in manuelleTypklasse Tabelle setzen
    const haftpflicht = parseInt(typklasseMatch[1]) || 0;
    const teilkasko = parseInt(typklasseMatch[2]) || 0;
    
    fieldValues.manuelleTypklasse = [{
      id: '1',
      grund: 'Manuell eingetragen',
      haftpflicht: haftpflicht,
      vollkasko: 0,
      teilkasko: teilkasko
    }];
    
    extractedFields.push('manuelleTypklasse');
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