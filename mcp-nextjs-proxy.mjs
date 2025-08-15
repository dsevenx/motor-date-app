#!/usr/bin/env node

// MCP Server der die Next.js API-Route als Proxy verwendet
// Garantiert identische Ergebnisse zwischen Web-Chat und MCP

import http from 'node:http';
import process from 'node:process';

class NextJSProxyMcpServer {
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
      }
    ];
  }

  // Next.js API-Route über HTTP aufrufen
  async callNextJSApi(endpoint, data) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(data);
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: endpoint,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(new Error(`JSON parse error: ${error.message}, Data: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  async extractDataFromChat(chatInput, existingData = {}) {
    console.error('🚀 NextJS-Proxy-MCP: Starte Claude AI Extraktion...');
    console.error('🚀 Input:', chatInput);
    console.error('🚀 ExistingData Keys:', Object.keys(existingData));

    try {
      // 1. Initialisiere currentValues über Next.js API (identisch mit Web-Chat)
      const initResult = await this.callNextJSApi('/api/initialize-data', { existingData });
      
      if (!initResult.success) {
        throw new Error('Failed to initialize data');
      }
      
      console.error('✅ Vollständige currentValues initialisiert:', initResult.fieldCount, 'Felder');
      
      // 2. Rufe Claude API mit vollständigen currentValues auf (identisch mit Web-Chat)
      const requestBody = {
        text: chatInput,
        currentValues: initResult.currentValues
      };

      console.error('📤 ===== NEXTJS-PROXY REQUEST =====');
      console.error('📤 API: /api/extract-dates');
      console.error('📤 Text:', JSON.stringify(chatInput, null, 2));
      console.error('📤 ExistingData Anzahl:', Object.keys(existingData).length);
      console.error('📤 ===== ENDE REQUEST =====');

      // HTTP Request an Next.js API
      const result = await this.callNextJSApi('/api/extract-dates', requestBody);

      console.error('📥 ===== NEXTJS-PROXY RESPONSE =====');
      console.error('📥 Success:', result.success);
      console.error('📥 Data verfügbar:', !!result.data);
      if (result.data?.extractedData) {
        console.error('📥 ExtractedData Keys:', Object.keys(result.data.extractedData));
        console.error('📥 Vollständige Response:', JSON.stringify(result, null, 2));
      }
      console.error('📥 ===== ENDE RESPONSE =====');

      if (!result.success || !result.data) {
        throw new Error('Next.js API returned no data');
      }

      // 2. Verarbeite extrahierte Daten (identisch mit Next.js Route)
      const aiData = result.data;
      const fieldValues = { ...existingData };
      const extractedFields = [];
      let totalConfidence = 0;
      let fieldCount = 0;

      if (aiData.extractedData && typeof aiData.extractedData === 'object') {
        Object.entries(aiData.extractedData).forEach(([fieldKey, extractedValue]) => {
          if (!extractedValue || typeof extractedValue !== 'object') {
            return;
          }

          if (!extractedValue.value || extractedValue.confidence <= 0.5) {
            console.error(`⏭️ Überspringe ${fieldKey} - niedrige Confidence`);
            return;
          }

          console.error(`✅ Update ${fieldKey} = ${JSON.stringify(extractedValue.value)}`);

          // Setze Wert (identisch mit Web-Chat)
          fieldValues[fieldKey] = extractedValue.value;

          extractedFields.push(fieldKey);
          totalConfidence += extractedValue.confidence;
          fieldCount++;
        });
      }

      const avgConfidence = fieldCount > 0 ? totalConfidence / fieldCount : 0;

      console.error('✅ NextJS-Proxy: Extraktion abgeschlossen');
      console.error(`✅ ${extractedFields.length} Felder extrahiert: ${extractedFields.join(', ')}`);
      console.error(`✅ Durchschnittliche Konfidenz: ${Math.round(avgConfidence * 100)}%`);

      return {
        fieldValues,
        extractedFields,
        confidence: avgConfidence
      };

    } catch (error) {
      console.error('❌ NextJS-Proxy API Fehler:', error.message);
      throw error;
    }
  }

  // Generate XML using Next.js ServiceABSEinarbeiterHelper (over API)
  async generateXMLFromFieldValues(fieldValues) {
    console.error('🔧 NextJS-Proxy: Generiere XML...');
    
    try {
      // Rufe Next.js API-Route für XML-Generierung auf
      const result = await this.callNextJSApi('/api/generate-xml', { fieldValues });
      
      if (result.success && result.xml) {
        console.error('✅ XML erfolgreich generiert:', result.xml.length, 'Zeichen');
        return result.xml;
      } else {
        throw new Error('XML generation failed');
      }
    } catch (error) {
      // Fallback: Direkte Fehlermeldung
      console.error('❌ XML-Generierung über API fehlgeschlagen:', error.message);
      return `<ERROR>XML generation failed: ${error.message}</ERROR>`;
    }
  }

  async handleMessage(message) {
    try {
      const { method, params, id } = message;

      switch (method) {
        case 'initialize':
          return {
            jsonrpc: '2.0',
            id,
            result: {
              protocolVersion: '1.0.0',
              capabilities: {
                tools: {}
              },
              serverInfo: {
                name: 'nextjs-proxy-serviceabs-xml-generator',
                version: '1.0.0'
              }
            }
          };

        case 'tools/list':
          return {
            jsonrpc: '2.0',
            id,
            result: {
              tools: this.tools
            }
          };

        case 'tools/call':
          if (params?.name === 'generate_serviceabs_xml') {
            const { chatInput, existingData = {} } = params.arguments;
            
            // 1. Extrahiere Daten über Next.js API (identisch mit Web-Chat)
            const extractedData = await this.extractDataFromChat(chatInput, existingData);
            
            // 2. Generiere XML über Next.js API
            const xml = await this.generateXMLFromFieldValues(extractedData.fieldValues);
            
            // 3. Statistiken
            const fieldCount = extractedData.extractedFields.length;
            const summary = extractedData.extractedFields.join(', ');
            
            return {
              jsonrpc: '2.0',
              id,
              result: {
                content: [
                  {
                    type: 'text',
                    text: `ServiceABS-Einarbeiter XML generiert:\n\n${xml}\n\n**Analyse:**\n- ${fieldCount} Felder extrahiert: ${summary}\n- Durchschnittliche Konfidenz: ${Math.round(extractedData.confidence * 100)}%\n- XML-Größe: ${xml.length} Zeichen\n\n🔄 *Generiert über Next.js API (identisch mit Web-Chat)*`
                  }
                ]
              }
            };
          }
          
          throw new Error(`Unknown tool: ${params?.name}`);

        case 'ping':
          return { jsonrpc: '2.0', id, result: {} };

        default:
          throw new Error(`Unknown method: ${method}`);
      }
    } catch (error) {
      return {
        jsonrpc: '2.0',
        id: message.id,
        error: {
          code: -1,
          message: error.message
        }
      };
    }
  }

  start() {
    console.error('🚀 NextJS-Proxy-MCP Server startet...');
    
    // Keep process alive
    process.stdin.setEncoding('utf8');
    process.stdin.resume();
    
    process.stdin.on('data', async (data) => {
      const lines = data.toString().trim().split('\n');
      
      for (const line of lines) {
        if (!line.trim()) continue;
        
        try {
          const message = JSON.parse(line);
          const response = await this.handleMessage(message);
          process.stdout.write(JSON.stringify(response) + '\n');
          process.stdout.flush();
        } catch (error) {
          console.error('❌ Message handling error:', error);
          const errorResponse = {
            jsonrpc: '2.0',
            id: message?.id || null,
            error: {
              code: -32700,
              message: 'Parse error: ' + error.message
            }
          };
          process.stdout.write(JSON.stringify(errorResponse) + '\n');
          process.stdout.flush();
        }
      }
    });

    process.stdin.on('end', () => {
      console.error('📴 NextJS-Proxy-MCP: STDIN geschlossen');
      process.exit(0);
    });

    process.on('SIGINT', () => {
      console.error('📴 NextJS-Proxy-MCP: SIGINT empfangen');
      process.exit(0);
    });

    console.error('✅ NextJS-Proxy-MCP Server bereit (STDIO mode)');
  }
}

// Server starten
const server = new NextJSProxyMcpServer();
server.start();