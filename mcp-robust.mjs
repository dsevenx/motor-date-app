#!/usr/bin/env node

// Robuster MCP Server für ServiceABS XML Generation
// Low-Level Implementation ohne komplexe SDK-Dependencies

import { createServer } from 'node:http';
import http from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';
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
      id: id || 0,
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
      id: id || 0,
      result: {
        tools: this.tools
      }
    };
  }

  async handleToolsCall(params, id) {
    const { name, arguments: args } = params;

    if (name === 'generate_serviceabs_xml') {
      return await this.generateServiceAbsXml(args, id);
    }

    if (name === 'get_field_definitions') {
      return this.getFieldDefinitions(args, id);
    }

    return this.createErrorResponse(id, -32602, `Unknown tool: ${name}`);
  }

  async generateServiceAbsXml(args, id) {
    try {
      const { chatInput, existingData = {} } = args || {};
      
      console.error(`🎯 ===== MCP TOOL-AUFRUF START =====`);
      console.error(`🎯 Tool: generate_serviceabs_xml`);
      console.error(`📝 ChatInput: "${chatInput}"`);
      console.error(`📋 ExistingData:`, JSON.stringify(existingData, null, 2));
      console.error(`📊 Logs verfügbar unter: /Users/steffenrokosch/Library/Logs/Claude/mcp-server-serviceabs-xml-generator.log`);
      console.error(`📊 Next.js Dev Server sollte laufen auf: http://localhost:3000`);
      console.error(`🎯 ===== BEGINN VERARBEITUNG =====`);
      
      if (!chatInput) {
        throw new Error('chatInput ist erforderlich');
      }

      // Schritt 1: Datenextraktion über Claude AI
      console.error(`🚀 SCHRITT 1: Starte Claude AI Datenextraktion...`);
      let aiResponse;
      try {
        aiResponse = await this.extractDataFromChat(chatInput, existingData);
        console.error(`✅ SCHRITT 1 ERFOLGREICH: Claude AI Response:`, JSON.stringify(aiResponse, null, 2));
      } catch (extractError) {
        console.error(`❌ SCHRITT 1 FEHLGESCHLAGEN:`, extractError.message);
        throw new Error(`Claude AI Extraktion fehlgeschlagen: ${extractError.message}`);
      }
      
      // Validierung der aiResponse
      if (!aiResponse || !aiResponse.aiData || !aiResponse.aiData.extractedData) {
        console.error(`❌ Ungültige aiResponse Struktur:`, aiResponse);
        throw new Error('Claude AI Response hat keine extractedData');
      }
      
      // Schritt 2: Verarbeitung der extrahierten Daten
      console.error(`🚀 SCHRITT 2: Starte Datenverarbeitung...`);
      console.error(`🔍 ExtractedData Keys:`, Object.keys(aiResponse.aiData.extractedData));
      let processedData;
      try {
        processedData = await this.processExtractedDataViaAPI(aiResponse.aiData.extractedData);
        console.error(`✅ SCHRITT 2 ERFOLGREICH: Verarbeitete Daten:`, JSON.stringify(processedData, null, 2));
      } catch (processError) {
        console.error(`❌ SCHRITT 2 FEHLGESCHLAGEN:`, processError.message);
        throw new Error(`Datenverarbeitung fehlgeschlagen: ${processError.message}`);
      }
      
      // Validierung der processedData
      if (!processedData || !processedData.xml) {
        console.error(`❌ Ungültige processedData:`, processedData);
        throw new Error('Datenverarbeitung lieferte keine XML');
      }
      
      // Schritt 3: XML Final
      console.error(`🚀 SCHRITT 3: XML-Finalisierung...`);
      const xml = processedData.xml;
      console.error(`✅ SCHRITT 3 ERFOLGREICH: Finale XML (${xml.length} Zeichen):`, xml);
      
      const response = {
        jsonrpc: '2.0',
        id: id || 0,
        result: {
          content: [
            {
              type: 'text',
              text: `🚗 ServiceABS XML erfolgreich generiert!\n\n${xml}\n\n📊 Extrahierte Daten:\n${aiResponse.extractedFields.map(field => `✓ ${field}`).join('\n')}\n\n🎯 Konfidenz: ${Math.round(aiResponse.confidence * 100)}%`
            }
          ]
        }
      };
      
      console.error(`📤 Antwort an Claude Desktop:`, JSON.stringify(response, null, 2));
      return response;
    } catch (error) {
      console.error(`❌ ===== MCP TOOL FEHLER =====`);
      console.error(`❌ Error Type:`, error.constructor.name);
      console.error(`❌ Error Message:`, error.message);
      console.error(`❌ Full Error:`, error);
      console.error(`❌ Stack Trace:`, error.stack);
      console.error(`❌ ChatInput war:`, chatInput);
      console.error(`❌ ExistingData war:`, JSON.stringify(existingData, null, 2));
      console.error(`❌ ===== ENDE FEHLER =====`);
      
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
      id: id || 0,
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

  async extractDataFromChat(chatInput, existingData) {
    console.error('🚀 MCP-Robust: Starte Claude AI Extraktion...');
    console.error('🚀 MCP-Robust Input:', chatInput);
    console.error('🚀 MCP-Robust existingData:', Object.keys(existingData));
    
    try {
      // 1. Generiere currentValues dynamisch aus Next.js API (wie Web-Chat)
      console.error('📡 MCP-Robust: Rufe Next.js /api/initialize-data auf...');
      
      const initResult = await this.makeHttpRequest('http://localhost:3000/api/initialize-data', { 
        existingData 
      });
      
      if (!initResult.success || !initResult.currentValues) {
        console.error('❌ Initialisierung fehlgeschlagen, verwende Fallback...');
        throw new Error('Failed to initialize currentValues from Next.js API');
      }
      
      const currentValues = initResult.currentValues;
      console.error('✅ MCP-Robust: CurrentValues aus FIELD_DEFINITIONS geladen:', Object.keys(currentValues).length, 'Felder');
      
      console.error('🚀 MCP-Robust: Rufe Claude API auf...');
      
      // 2. DIREKTER AUFRUF DER CLAUDE API (mit Node.js http module)
      const apiUrl = 'http://localhost:3000/api/extract-dates';
      
      const requestBody = {
        text: chatInput,
        currentValues: currentValues
      };
      
      console.error('📤 ===== MCP-ROBUST REQUEST =====');
      console.error('📤 URL:', apiUrl);
      console.error('📤 Text:', JSON.stringify(chatInput, null, 2));
      console.error('📤 CurrentValues Anzahl:', Object.keys(currentValues).length);
      console.error('📤 ===== ENDE REQUEST =====');
      
      // HTTP Request mit Node.js nativem http module
      const result = await this.makeHttpRequest(apiUrl, requestBody);
      
      console.error('📥 ===== MCP-ROBUST CLAUDE RESPONSE =====');
      console.error('📥 Success:', result.success);
      console.error('📥 Data verfügbar:', !!result.data);
      if (result.data) {
        console.error('📥 ExtractedData verfügbar:', !!result.data.extractedData);
        console.error('📥 ExtractedData Keys:', result.data.extractedData ? Object.keys(result.data.extractedData) : 'none');
        console.error('📥 Vollständige Claude Response:', JSON.stringify(result, null, 2));
        
        // 🔍 DETAILANALYSE DER CLAUDE-ANTWORT
        if (result.data.extractedData) {
          Object.entries(result.data.extractedData).forEach(([key, value]) => {
            console.error(`📥 FELD-ANALYSE: ${key}`, {
              type: typeof value,
              value: value,
              isArray: Array.isArray(value?.value),
              confidence: value?.confidence
            });
          });
        }
      }
      console.error('📥 ===== ENDE RESPONSE =====');
      
      if (!result.success || !result.data) {
        throw new Error('Claude API returned no data');
      }
      
      const aiData = result.data;
      
      // 3. DATEN VERARBEITUNG
      const fieldValues = { ...existingData };
      const extractedFields = [];
      let totalConfidence = 0;
      let fieldCount = 0;
      
      if (aiData.extractedData && typeof aiData.extractedData === 'object') {
        // Verarbeite alle extrahierten Felder
        Object.entries(aiData.extractedData).forEach(([fieldKey, extractedValue]) => {
          console.error(`🔍 MCP-Robust: Verarbeite Feld ${fieldKey}:`, extractedValue);
          
          if (!extractedValue || typeof extractedValue !== 'object') {
            console.error(`❌ MCP-Robust: Ungültiger extractedValue für ${fieldKey}`);
            return;
          }
          
          // Confidence-Check
          if (!extractedValue.value || extractedValue.confidence <= 0.5) {
            console.error(`⏭️ MCP-Robust: Überspringe ${fieldKey} - niedrige Confidence (${extractedValue.confidence})`);
            return;
          }
          
          console.error(`✅ MCP-Robust: Update ${fieldKey} = ${JSON.stringify(extractedValue.value)}`);
          console.error(`✅ MCP-Robust: Typ-Check für ${fieldKey}:`, {
            isArray: Array.isArray(extractedValue.value),
            type: typeof extractedValue.value,
            keys: typeof extractedValue.value === 'object' ? Object.keys(extractedValue.value) : 'not object'
          });
          
          // Setze Wert in fieldValues
          fieldValues[fieldKey] = extractedValue.value;
          
          extractedFields.push(fieldKey);
          totalConfidence += extractedValue.confidence;
          fieldCount++;
        });
      }
      
      const avgConfidence = fieldCount > 0 ? totalConfidence / fieldCount : 0;
      
      console.error('✅ MCP-Robust: Claude AI Extraktion abgeschlossen');
      console.error(`✅ MCP-Robust: ${extractedFields.length} Felder extrahiert: ${extractedFields.join(', ')}`);
      console.error(`✅ MCP-Robust: Durchschnittliche Konfidenz: ${Math.round(avgConfidence * 100)}%`);
      
      return {
        aiData: result.data,
        extractedFields,
        confidence: avgConfidence
      };
      
    } catch (error) {
      console.error('❌ ===== MCP-ROBUST CLAUDE API FEHLER =====');
      console.error('❌ Error Type:', error.constructor.name);
      console.error('❌ Error Message:', error.message);
      console.error('❌ Full Error:', error);
      console.error('❌ ===== ENDE FEHLER =====');
      
      // Fallback zur alten Regex-Logik falls Claude API nicht erreichbar
      console.error('⚠️ MCP-Robust: Fallback zu Regex-Extraktion...');
      
      const fieldValues = { ...existingData };
      const extractedFields = [];
      let confidence = 0.5;
      
      // Jahreskilometer erkennen
      const kmRegex = /(?:jahresfahrleistung|fahrleistung|jährlich|pro\s+jahr)?\s*(\d+)\s*(?:km|kilometer)/i;
      const kmMatch = chatInput.match(kmRegex);
      if (kmMatch) {
        fieldValues.jahreskilometer = parseInt(kmMatch[1]);
        extractedFields.push('jahreskilometer');
        confidence += 0.3;
        console.error(`✅ Fallback: Jahreskilometer erkannt: ${kmMatch[1]} km`);
      }
      
      return {
        aiData: {
          extractedData: {
            jahreskilometer: fieldValues.jahreskilometer ? {
              value: fieldValues.jahreskilometer,
              confidence: confidence,
              source: 'Fallback regex extraction'
            } : undefined
          }
        },
        extractedFields,
        confidence: Math.min(confidence, 1.0)
      };
    }
  }

  // Verarbeitung extrahierter Daten über Next.js API (wie ChatComponent)
  async processExtractedDataViaAPI(extractedData) {
    console.error(`🔧 MCP-Robust: Verarbeite extrahierte Daten über Next.js API...`);
    console.error(`🔧 ExtractedData Keys:`, Object.keys(extractedData || {}));
    
    try {
      const result = await this.makeHttpRequest('http://localhost:3000/api/process-extracted-data', { 
        extractedData 
      });
      
      if (result.success) {
        console.error('✅ Datenverarbeitung erfolgreich:', {
          processedFields: result.processedFields?.length || 0,
          xmlLength: result.xml?.length || 0
        });
        return result;
      } else {
        throw new Error('Data processing failed: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Datenverarbeitung über Next.js API fehlgeschlagen:', error.message);
      throw error;
    }
  }

  // XML-Generierung über Next.js API (verwendet ServiceABSEinarbeiterHelper)
  async generateXMLviaAPI(fieldValues) {
    console.error(`🔧 MCP-Robust: Generiere XML über Next.js API...`);
    console.error(`🔧 FieldValues Input:`, JSON.stringify(fieldValues, null, 2));
    
    try {
      const result = await this.makeHttpRequest('http://localhost:3000/api/generate-xml', { 
        fieldValues 
      });
      
      if (result.success && result.xml) {
        console.error('✅ XML erfolgreich generiert via Next.js API:', result.xml.length, 'Zeichen');
        console.error('✅ Generierte XML:', result.xml);
        return result.xml;
      } else {
        throw new Error('XML generation failed: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ XML-Generierung über Next.js API fehlgeschlagen:', error.message);
      
      // Fallback: Minimale XML-Struktur
      const fallbackXml = `<ANTRAG>
  <PERSONEN></PERSONEN>
  <VERTRAG>
    <KRAFTBL>
      <!-- XML-Generierung fehlgeschlagen: ${error.message} -->
    </KRAFTBL>
  </VERTRAG>
</ANTRAG>`;
      
      console.error('⚠️ Verwende Fallback-XML:', fallbackXml);
      return fallbackXml;
    }
  }

  // Native HTTP Request ohne fetch dependency
  async makeHttpRequest(url, body) {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const postData = JSON.stringify(body);
      
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };
      
      console.error(`🌐 HTTP Request: ${options.method} ${parsedUrl.hostname}:${options.port}${options.path}`);
      
      const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          console.error(`🌐 HTTP Response Status: ${res.statusCode}`);
          
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const jsonData = JSON.parse(data);
              resolve(jsonData);
            } catch (parseError) {
              console.error('❌ JSON Parse Fehler:', parseError.message);
              reject(new Error(`JSON Parse Fehler: ${parseError.message}`));
            }
          } else {
            console.error(`❌ HTTP Error ${res.statusCode}:`, data);
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });
      
      req.on('error', (err) => {
        console.error('❌ HTTP Request Fehler:', err.message);
        reject(err);
      });
      
      req.write(postData);
      req.end();
    });
  }

  createErrorResponse(id, code, message) {
    return {
      jsonrpc: '2.0',
      id: id || 0,
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