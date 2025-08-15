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
      
      console.error(`🎯 Tool-Aufruf: generate_serviceabs_xml`);
      console.error(`📝 ChatInput: "${chatInput}"`);
      console.error(`📋 ExistingData:`, JSON.stringify(existingData, null, 2));
      
      if (!chatInput) {
        throw new Error('chatInput ist erforderlich');
      }

      // Datenextraktion
      const extractedData = await this.extractDataFromChat(chatInput, existingData);
      console.error(`🔍 Extrahierte Daten:`, JSON.stringify(extractedData, null, 2));
      
      // XML-Generierung
      const xml = this.generateXML(extractedData.fieldValues);
      console.error(`📄 Generierte XML:`, xml);
      
      const response = {
        jsonrpc: '2.0',
        id: id || 0,
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
      // 1. Aktuelle Feldwerte erstellen (VOLLSTÄNDIG für korrekten AI-Input)
      const currentValues = {
        // Basis-Felder (wie vorher)
        beginndatum: '0001-01-01',
        ablaufdatum: '0001-01-01',
        anmeldedatum: '0001-01-01',
        erstzulassungsdatum: '0001-01-01',
        KraftBoZefdatum: '0001-01-01',
        urbeginn: '0001-01-01',
        stornodatum: '0001-01-01',
        fahrzeugmarke: '',
        neuwert: '0',
        vorsteuerabzugsberechtigt: ' ',
        abweichende_fahrzeugdaten: ' ',
        KraftBoGruppeAusfertigungsgrundABS: '',
        fahrerkreis: '',
        wirtschaftszweig: '',
        inkassoart: '',
        KraftDmKfzVorfahrl: '0',
        fahrgestellnummer: '',
        amtlKennzeichen: '',
        
        // Tabellen-Felder (WICHTIG: Vollständig initialisiert!)
        kilometerstaende: '[]',
        zubehoer: '[]',
        manuelleTypklasse: '[{"id":"1","grund":"","haftpflicht":0,"vollkasko":0,"teilkasko":0}]',
        
        // PRODUKTDATEN (Das ist der Schlüssel für korrekte AI-Antworten!)
        produktSparten: '[{"id":"KH","beschreibung":"Kfz-Haftpflicht","check":false,"zustand":" ","stornogrund":" ","beitragNetto":0,"beitragBrutto":0,"echteEingabe":false},{"id":"KK","beschreibung":"Kfz-Vollkasko","check":false,"zustand":" ","stornogrund":" ","beitragNetto":0,"beitragBrutto":0,"echteEingabe":false},{"id":"EK","beschreibung":"Kfz-Teilkasko","check":false,"zustand":" ","stornogrund":" ","beitragNetto":0,"beitragBrutto":0,"echteEingabe":false},{"id":"KU","beschreibung":"Kfz-Unfallversicherung","check":false,"zustand":" ","stornogrund":" ","beitragNetto":0,"beitragBrutto":0,"echteEingabe":false}]',
        
        // BAUSTEIN-TABELLEN (Damit Claude weiß, welche Bausteine verfügbar sind!)
        produktBausteine_KH: '[{"id":"KBM00001","beschreibung":"Rabattschutz","check":false,"betrag":0,"betragsLabel":"","knotenId":"KBM00001","echteEingabe":false},{"id":"KBH00006","beschreibung":"Auslandsschadenschutz","check":false,"betrag":0,"betragsLabel":"","knotenId":"KBH00006","echteEingabe":false},{"id":"KBM00089","beschreibung":"BeitragsSchutz","check":false,"betrag":0,"betragsLabel":"","knotenId":"KBM00089","echteEingabe":false},{"id":"KBM00195","beschreibung":"Komfort Nicht-PKW","check":false,"betrag":0,"betragsLabel":"","knotenId":"KBM00195","echteEingabe":false},{"id":"KBE00002","beschreibung":"Eigen2schadenschutz","check":false,"betrag":20,"betragsLabel":"Summe","knotenId":"KBE00002","echteEingabe":false}]',
        
        produktBausteine_KK: '[{"id":"KBM00001","beschreibung":"Rabattschutz","check":false,"betrag":0,"betragsLabel":"","knotenId":"KBM00001","echteEingabe":false},{"id":"KBM00089","beschreibung":"BeitragsSchutz","check":false,"betrag":0,"betragsLabel":"","knotenId":"KBM00089","echteEingabe":false},{"id":"KBV00002","beschreibung":"Selbstbeteiligung Vollkasko","check":false,"betrag":300,"betragsLabel":"Selbstbeteiligung","knotenId":"KBV00002","echteEingabe":false},{"id":"KBM00002","beschreibung":"Selbstbeteiligung Teilkasko","check":false,"betrag":150,"betragsLabel":"Selbstbeteiligung","knotenId":"KBM00002","echteEingabe":false}]',
        
        produktBausteine_EK: '[]',
        produktBausteine_KU: '[]',
        
        ...existingData // Überschreibe mit bestehenden Daten
      };
      
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
        fieldValues,
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
        fieldValues,
        extractedFields,
        confidence: Math.min(confidence, 1.0)
      };
    }
  }

  generateXML(fieldValues) {
    console.error(`🔍 ===== MCP-ROBUST XML-GENERIERUNG START =====`);
    console.error(`🔍 FieldValues Input:`, JSON.stringify(fieldValues, null, 2));
    
    let xmlContent = [];
    
    // 1. Kilometerstände Tabelle
    console.error(`🔍 Prüfe kilometerstaende:`, {
      exists: !!fieldValues.kilometerstaende,
      type: typeof fieldValues.kilometerstaende,
      isArray: Array.isArray(fieldValues.kilometerstaende),
      length: Array.isArray(fieldValues.kilometerstaende) ? fieldValues.kilometerstaende.length : 'not array',
      value: fieldValues.kilometerstaende
    });
    
    if (fieldValues.kilometerstaende && Array.isArray(fieldValues.kilometerstaende) && fieldValues.kilometerstaende.length > 0) {
      console.error(`✅ Verarbeite Kilometerstände:`, fieldValues.kilometerstaende);
      let kmRows = fieldValues.kilometerstaende.map(row => `        <zeile>
          <datum>${row.datum || new Date().toISOString().split('T')[0]}</datum>
          <art>${row.art || '1'}</art>
          <kmstand>${row.kmstand || '0'}</kmstand>
        </zeile>`).join('\n');
      xmlContent.push(`      <kilometerstaende_e>
${kmRows}
      </kilometerstaende_e>`);
    } else {
      console.error(`❌ Kilometerstände nicht verarbeitet - Bedingungen nicht erfüllt`);
    }
    
    // 2. Produktsparten Tabelle
    console.error(`🔍 Prüfe produktSparten:`, {
      exists: !!fieldValues.produktSparten,
      type: typeof fieldValues.produktSparten,
      isArray: Array.isArray(fieldValues.produktSparten),
      length: Array.isArray(fieldValues.produktSparten) ? fieldValues.produktSparten.length : 'not array',
      value: fieldValues.produktSparten
    });
    
    if (fieldValues.produktSparten && Array.isArray(fieldValues.produktSparten) && fieldValues.produktSparten.length > 0) {
      console.error(`✅ Verarbeite Produktsparten:`, fieldValues.produktSparten);
      let spartenRows = fieldValues.produktSparten.map(row => `        <zeile>
          <beschreibung>${row.beschreibung || 'Kfz-Vollkasko'}</beschreibung>
          <check>${row.check === true ? 'true' : 'false'}</check>
          <zustand>${row.zustand || 'A'}</zustand>
          <stornogrund>${row.stornogrund || ' '}</stornogrund>
          <beitragNetto>${row.beitragNetto || '0'}</beitragNetto>
          <beitragBrutto>${row.beitragBrutto || '0'}</beitragBrutto>
        </zeile>`).join('\n');
      xmlContent.push(`      <produktSparten_e>
${spartenRows}
      </produktSparten_e>`);
    } else {
      console.error(`❌ Produktsparten nicht verarbeitet - Bedingungen nicht erfüllt`);
    }
    
    // 3. ProduktBausteine KH Tabelle  
    console.error(`🔍 Prüfe produktBausteine_KH:`, {
      exists: !!fieldValues.produktBausteine_KH,
      type: typeof fieldValues.produktBausteine_KH,
      isArray: Array.isArray(fieldValues.produktBausteine_KH),
      length: Array.isArray(fieldValues.produktBausteine_KH) ? fieldValues.produktBausteine_KH.length : 'not array',
      value: fieldValues.produktBausteine_KH
    });
    
    if (fieldValues.produktBausteine_KH && Array.isArray(fieldValues.produktBausteine_KH) && fieldValues.produktBausteine_KH.length > 0) {
      console.error(`✅ Verarbeite ProduktBausteine KH:`, fieldValues.produktBausteine_KH);
      let bausteinKHRows = fieldValues.produktBausteine_KH.map(row => `        <zeile>
          <id>${row.id || ''}</id>
          <beschreibung>${row.beschreibung || ''}</beschreibung>
          <check>${row.check === true ? 'true' : 'false'}</check>
          <betrag>${row.betrag || '0'}</betrag>
          <betragsLabel>${row.betragsLabel || ''}</betragsLabel>
          <knotenId>${row.knotenId || row.id || ''}</knotenId>
        </zeile>`).join('\n');
      xmlContent.push(`      <produktBausteine_KH_e>
${bausteinKHRows}
      </produktBausteine_KH_e>`);
    } else {
      console.error(`❌ ProduktBausteine KH nicht verarbeitet - Bedingungen nicht erfüllt`);
    }
    
    // 4. ProduktBausteine KK Tabelle
    console.error(`🔍 Prüfe produktBausteine_KK:`, {
      exists: !!fieldValues.produktBausteine_KK,
      type: typeof fieldValues.produktBausteine_KK,
      isArray: Array.isArray(fieldValues.produktBausteine_KK),
      length: Array.isArray(fieldValues.produktBausteine_KK) ? fieldValues.produktBausteine_KK.length : 'not array',
      value: fieldValues.produktBausteine_KK
    });
    
    if (fieldValues.produktBausteine_KK && Array.isArray(fieldValues.produktBausteine_KK) && fieldValues.produktBausteine_KK.length > 0) {
      console.error(`✅ Verarbeite ProduktBausteine KK:`, fieldValues.produktBausteine_KK);
      let bausteinKKRows = fieldValues.produktBausteine_KK.map(row => `        <zeile>
          <id>${row.id || ''}</id>
          <beschreibung>${row.beschreibung || ''}</beschreibung>
          <check>${row.check === true ? 'true' : 'false'}</check>
          <betrag>${row.betrag || '0'}</betrag>
          <betragsLabel>${row.betragsLabel || ''}</betragsLabel>
          <knotenId>${row.knotenId || row.id || ''}</knotenId>
        </zeile>`).join('\n');
      xmlContent.push(`      <produktBausteine_KK_e>
${bausteinKKRows}
      </produktBausteine_KK_e>`);
    } else {
      console.error(`❌ ProduktBausteine KK nicht verarbeitet - Bedingungen nicht erfüllt`);
    }

    // 5. Einzelfelder
    if (fieldValues.KraftDmKfzVorfahrl && fieldValues.KraftDmKfzVorfahrl !== '0') {
      console.error(`🔍 Verarbeite Fahrleistung:`, fieldValues.KraftDmKfzVorfahrl);
      xmlContent.push(`      <KraftDmKfzVorfahrl_e>${fieldValues.KraftDmKfzVorfahrl}</KraftDmKfzVorfahrl_e>`);
    }
    
    // Legacy-Unterstützung für alte Feldnamen
    if (fieldValues.jahreskilometer && fieldValues.jahreskilometer !== 0) {
      console.error(`🔍 Legacy: jahreskilometer → KraftDmKfzVorfahrl:`, fieldValues.jahreskilometer);
      xmlContent.push(`      <KraftDmKfzVorfahrl_e>${fieldValues.jahreskilometer}</KraftDmKfzVorfahrl_e>`);
    }
    
    console.error(`🔍 ===== FINALE XML-GENERIERUNG =====`);
    console.error(`🔍 XML Content Teile:`, xmlContent.length);
    console.error(`🔍 XML Content Details:`, xmlContent);
    console.error(`🔍 ===== ENDE XML-GENERIERUNG =====`);
    
    const finalXml = `<ANTRAG>
  <PERSONEN>
  </PERSONEN>
  <VERTRAG>
    <KRAFTBL>
${xmlContent.join('\n')}
    </KRAFTBL>
  </VERTRAG>
</ANTRAG>`;

    console.error(`🔍 ===== FINALE XML =====`);
    console.error(finalXml);
    console.error(`🔍 ===== ENDE FINALE XML =====`);
    
    return finalXml;
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