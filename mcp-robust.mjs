#!/usr/bin/env node

// Robuster MCP Server für ServiceABS XML Generation
// Low-Level Implementation ohne komplexe SDK-Dependencies

import { createServer } from 'node:http';
import process from 'node:process';

// Simple JSON-RPC Handler für STDIO
class McpServer {
  constructor() {
    this.tools = [
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
    ];
  }

  async handleRequest(request) {
    const { method, params, id } = request;

    // Erweiterte Logging für Claude Desktop
    console.error(`📥 Claude Desktop Anfrage: ${method}`, params ? JSON.stringify(params, null, 2) : '(keine Parameter)');

    try {
      switch (method) {
        case 'initialize':
          return this.handleInitialize(id);
        
        case 'tools/list':
          return this.handleToolsList(id);
        
        case 'tools/call':
          return this.handleToolsCall(params, id);
        
        default:
          return this.createErrorResponse(id, -32601, 'Method not found');
      }
    } catch (error) {
      console.error(`❌ Fehler bei ${method}:`, error.message);
      return this.createErrorResponse(id, -32603, error.message);
    }
  }

  handleInitialize(id) {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2025-06-18',
        capabilities: {
          tools: {
            listChanged: false
          }
        },
        serverInfo: {
          name: 'serviceabs-xml-generator',
          version: '1.0.0'
        }
      }
    };
  }

  handleToolsList(id) {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        tools: this.tools
      }
    };
  }

  async handleToolsCall(params, id) {
    const { name, arguments: args } = params;

    if (name === 'generate_serviceabs_xml') {
      return this.generateServiceAbsXml(args, id);
    }

    if (name === 'get_field_definitions') {
      return this.getFieldDefinitions(args, id);
    }

    return this.createErrorResponse(id, -32602, `Unknown tool: ${name}`);
  }

  generateServiceAbsXml(args, id) {
    try {
      const { chatInput, existingData = {} } = args || {};
      
      console.error(`🎯 Tool-Aufruf: generate_serviceabs_xml`);
      console.error(`📝 ChatInput: "${chatInput}"`);
      console.error(`📋 ExistingData:`, JSON.stringify(existingData, null, 2));
      
      if (!chatInput) {
        throw new Error('chatInput ist erforderlich');
      }

      // Datenextraktion
      const extractedData = this.extractDataFromChat(chatInput, existingData);
      console.error(`🔍 Extrahierte Daten:`, JSON.stringify(extractedData, null, 2));
      
      // XML-Generierung
      const xml = this.generateXML(extractedData.fieldValues);
      console.error(`📄 Generierte XML:`, xml);
      
      const response = {
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: `🚗 ServiceABS XML erfolgreich generiert!\n\n${xml}\n\n📊 Extrahierte Daten:\n${extractedData.extractedFields.map(field => `✓ ${field}`).join('\n')}\n\n🎯 Konfidenz: ${Math.round(extractedData.confidence * 100)}%`
            }
          ]
        }
      };
      
      console.error(`📤 Antwort an Claude Desktop:`, JSON.stringify(response, null, 2));
      return response;
    } catch (error) {
      console.error(`❌ XML-Generierung fehlgeschlagen:`, error.message);
      return this.createErrorResponse(id, -32603, `XML-Generierung fehlgeschlagen: ${error.message}`);
    }
  }

  getFieldDefinitions(args, id) {
    const fieldInfo = [
      { key: 'jahreskilometer', description: 'Jährliche Fahrleistung in Kilometern (Zahl)' },
      { key: 'fahrzeugmarke', description: 'Marke/Hersteller des Fahrzeugs (Text)' },
      { key: 'typklasseHaftpflicht', description: 'Typklasse für Haftpflichtversicherung (Zahl 10-25)' },
      { key: 'typklasseTeilkasko', description: 'Typklasse für Teilkaskoversicherung (Zahl 10-33)' }
    ];

    return {
      jsonrpc: '2.0',
      id,
      result: {
        content: [
          {
            type: 'text',
            text: `📋 Verfügbare Felder:\n\n${fieldInfo.map(field => `• ${field.key}: ${field.description}`).join('\n')}`
          }
        ]
      }
    };
  }

  extractDataFromChat(chatInput, existingData) {
    const fieldValues = { ...existingData };
    const extractedFields = [];
    let confidence = 0.5;
    
    // Jahreskilometer erkennen (Jahresfahrleistung 12000 km, 12000 km/Jahr, etc.)
    const kmRegex = /(?:jahresfahrleistung|fahrleistung|jährlich|pro\s+jahr)?\s*(\d+)\s*(?:km|kilometer)/i;
    const kmMatch = chatInput.match(kmRegex);
    if (kmMatch) {
      fieldValues.jahreskilometer = parseInt(kmMatch[1]);
      extractedFields.push('jahreskilometer');
      confidence += 0.3;
      console.error(`✅ Jahreskilometer erkannt: ${kmMatch[1]} km`);
    } else {
      console.error(`❌ Jahreskilometer nicht erkannt in: "${chatInput}"`);
    }
    
    // Typklassen erkennen (KH 12 und TK 8)
    const typklasseRegex = /(?:typklasse[n]?[^0-9]*)?(?:kh|haftpflicht)\s*(\d+)\s*(?:und|,)?\s*(?:tk|teilkasko)?\s*(\d+)?/i;
    const typklasseMatch = chatInput.match(typklasseRegex);
    if (typklasseMatch) {
      const haftpflicht = parseInt(typklasseMatch[1]) || 0;
      const teilkasko = parseInt(typklasseMatch[2]) || 0;
      
      fieldValues.typklasseHaftpflicht = haftpflicht;
      extractedFields.push('typklasseHaftpflicht');
      
      if (teilkasko > 0) {
        fieldValues.typklasseTeilkasko = teilkasko;
        extractedFields.push('typklasseTeilkasko');
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

  generateXML(fieldValues) {
    // Logging für Claude Desktop
    console.error(`🔍 XML-Generierung gestartet mit Daten:`, JSON.stringify(fieldValues, null, 2));
    
    return `<ANTRAG>
  <PERSONEN>
  </PERSONEN>
  <VERTRAG>
    <KRAFTBL>
      ${fieldValues.jahreskilometer ? `<KraftDmKfzVorfahrt_e>${fieldValues.jahreskilometer}</KraftDmKfzVorfahrt_e>` : ''}
      ${fieldValues.typklasseHaftpflicht || fieldValues.typklasseTeilkasko ? `<manuelleTypklasse_e>
        <zeile>
          ${fieldValues.typklasseHaftpflicht ? `<haftpflicht>${fieldValues.typklasseHaftpflicht}</haftpflicht>` : '<haftpflicht>0</haftpflicht>'}
          <vollkasko>0</vollkasko>
          ${fieldValues.typklasseTeilkasko ? `<teilkasko>${fieldValues.typklasseTeilkasko}</teilkasko>` : '<teilkasko>0</teilkasko>'}
        </zeile>
      </manuelleTypklasse_e>` : ''}
    </KRAFTBL>
  </VERTRAG>
</ANTRAG>`;
  }

  createErrorResponse(id, code, message) {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code,
        message
      }
    };
  }
}

// STDIO Transport
async function main() {
  const server = new McpServer();
  
  console.error('✅ ServiceABS MCP Server gestartet (STDIO Transport)');
  
  // Read from stdin line by line
  let buffer = '';
  
  process.stdin.on('data', async (chunk) => {
    buffer += chunk.toString();
    
    // Process complete JSON-RPC messages
    const lines = buffer.split('\n');
    buffer = lines.pop(); // Keep incomplete line in buffer
    
    for (const line of lines) {
      if (line.trim()) {
        try {
          const request = JSON.parse(line.trim());
          const response = await server.handleRequest(request);
          
          if (response) {
            console.log(JSON.stringify(response));
          }
        } catch (error) {
          console.error('Fehler beim Verarbeiten der Anfrage:', error.message);
        }
      }
    }
  });
  
  process.stdin.on('end', () => {
    console.error('📤 MCP Server beendet');
    process.exit(0);
  });
}

main();