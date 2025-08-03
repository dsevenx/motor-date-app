#!/usr/bin/env node

// Standalone MCP Server für ServiceABS XML Generation
// Verwendet die bestehende Next.js Logik über HTTP-Calls

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
      // HTTP-Call an unsere Next.js MCP Route
      const response = await fetch('http://localhost:3000/mcp/streamable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'tools/call',
          params: {
            name: 'generate_serviceabs_xml',
            arguments: args
          }
        })
      });
      
      const result = await response.json();
      
      return {
        content: [
          {
            type: 'text',
            text: result.success 
              ? `ServiceABS XML erfolgreich generiert:\n\n${result.xml}\n\nStatistiken:\n- Felder: ${result.statistics.fieldsCount}\n- XML-Größe: ${result.statistics.xmlSize} Zeichen\n- Extrahierte Felder: ${result.extractedFields.join(', ')}\n- Konfidenz: ${Math.round(result.confidence * 100)}%`
              : `Fehler bei XML-Generierung: ${result.error}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Fehler beim Verbinden mit ServiceABS Server: ${error.message}`
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
      }
    ]
  };
});

// Server starten
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('ServiceABS MCP Server gestartet');
}

main().catch(console.error);