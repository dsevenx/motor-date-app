"use client"
import React, { useState } from 'react';
import { Send, Bot, User, Info } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { 
  ApiResponse, 
  ChatComponentProps, 
  ChatMessage, 
  ExtractedFieldValue,
  validateFieldValue,
  formatValueForDisplay,
  convertValueToFieldType
} from '@/constants';
// echteEingabe wird automatisch durch setFieldValueWithEchteEingabe in Motor-Komponenten gesetzt
import { ClaudeResponse } from '@/constants/fieldConfig';
import { updateGlobalFieldDefinitions } from '@/hooks/useGlobalFieldDefinitions';
import { useGlobalProductData } from '@/hooks/useGlobalProductData';

export const ChatComponent: React.FC<ChatComponentProps> = ({ fieldConfigs }) => {
  
  // 🌐 Globale Produktdaten für Chat-Integration
  const { ensureProductDataLoaded, isLoaded: isProductDataLoaded } = useGlobalProductData();
   
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: "Wie kann ich Ihnen helfen? Sie können mir zum Beispiel sagen: 'Ich habe mein Auto am 15.3.2024 gekauft' oder 'Der Vertrag läuft ab am 31.12.2025'",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Aktuelle Werte für die API zusammenstellen
  const getCurrentValues = (): Record<string, string> => {
    const currentValues: Record<string, string> = {};
    fieldConfigs.forEach(config => {
      currentValues[config.fieldKey] = config.currentValue || '';
    });
    return currentValues;
  };

  // Intelligente Merge-Funktion für Tabellen-Updates
  const mergeTableData = (currentValue: any, aiValue: any[], fieldKey: string): any[] => {
    // Normalisiere die Eingabewerte zu Arrays
    let currentArray: any[] = [];
    let aiArray: any[] = [];
    
    // currentValue kann sowohl Array als auch {value: Array} sein
    if (Array.isArray(currentValue)) {
      currentArray = currentValue;
    } else if (currentValue && Array.isArray(currentValue.value)) {
      currentArray = currentValue.value;
    }
    
    // aiValue ist normalerweise ein Array
    if (Array.isArray(aiValue)) {
      aiArray = aiValue;
    } else {
      aiArray = [];
    }

    // Für Sparten- und Baustein-Tabellen: Intelligente Merge-Logik
    if (fieldKey === 'produktSparten' || fieldKey.startsWith('produktBausteine_')) {
      
      // Merge-Strategie: AI-Updates überschreiben nur die spezifischen Einträge
      const mergedTable = [...currentArray]; // Start mit bestehenden Werten (normalisiert)
      
      aiArray.forEach((aiRow: any) => {
        console.log(`🔍 mergeTableData: Processing AI row for ${fieldKey}:`, {
          id: aiRow.id,
          beschreibung: aiRow.beschreibung,
          check: aiRow.check,
          zustand: aiRow.zustand,
          knotenId: aiRow.knotenId
        });
        
        // Mehrere Matching-Strategien für robustes Matching
        let existingIndex = mergedTable.findIndex(row => row.id === aiRow.id);
        
        // Fallback 1: Suche nach beschreibung falls id nicht matched
        if (existingIndex < 0 && aiRow.beschreibung) {
          existingIndex = mergedTable.findIndex(row => 
            row.beschreibung?.toLowerCase().includes(aiRow.beschreibung?.toLowerCase()) ||
            aiRow.beschreibung?.toLowerCase().includes(row.beschreibung?.toLowerCase())
          );
        }
        
        // Fallback 2: Spezielle Behandlung für Vollkasko/VK
        if (existingIndex < 0 && fieldKey === 'produktSparten') {
          if (aiRow.beschreibung?.toLowerCase().includes('vollkasko') || 
              aiRow.beschreibung?.toLowerCase().includes('vk') ||
              aiRow.id === 'KK') {
            existingIndex = mergedTable.findIndex(row => 
              row.id === 'KK' || 
              row.beschreibung?.toLowerCase().includes('vollkasko')
            );
          }
        }
        
        if (existingIndex >= 0) {
          const beforeUpdate = { ...mergedTable[existingIndex] };
          console.log(`🔄 mergeTableData: Found existing row at index ${existingIndex}:`, beforeUpdate);
          
          // Update bestehende Zeile - check, betrag, echteEingabe, behalte ALLE anderen Felder
          const newCheckValue = aiRow.check !== undefined ? aiRow.check : mergedTable[existingIndex].check;
          const newBetragValue = aiRow.betrag !== undefined ? aiRow.betrag : mergedTable[existingIndex].betrag;
          mergedTable[existingIndex] = {
            ...mergedTable[existingIndex], // Bestehende Felder behalten (KRITISCH!)
            check: newCheckValue,
            betrag: newBetragValue, // HINZUGEFÜGT: Betrag aus AI-Response übernehmen
            echteEingabe: true, // Markiere als User-Eingabe
            // Zustand-Logik: Bei Aktivierung "A" (Aktiv), bei Deaktivierung " " (Leer) - wie in updateCheckStatus
            zustand: newCheckValue ? 'A' : ' ',
            // Stornogrund (zustandsdetail) immer leer
            stornogrund: ' '
          };
          
          const afterUpdate = { ...mergedTable[existingIndex] };
          console.log(`✅ mergeTableData: Updated row:`, {
            before: { check: beforeUpdate.check, zustand: beforeUpdate.zustand, knotenId: beforeUpdate.knotenId },
            after: { check: afterUpdate.check, zustand: afterUpdate.zustand, knotenId: afterUpdate.knotenId }
          });
        } else {
          // Neue Zeile hinzufügen (sollte bei Standard-Sparten normalerweise nicht passieren)
          console.log(`➕ mergeTableData: Adding new row (no existing match found):`, aiRow);
          const newRow = {
            ...aiRow,
            echteEingabe: true, // Markiere als User-Eingabe
            // Zustand-Logik auch für neue Zeilen
            zustand: aiRow.check ? 'A' : ' ',
            stornogrund: ' '
          };
          console.log(`✅ mergeTableData: New row created:`, {
            check: newRow.check, 
            zustand: newRow.zustand, 
            knotenId: newRow.knotenId
          });
          mergedTable.push(newRow);
        }
      });
      return mergedTable;
    }
    
    // Für andere Tabellen: Standard-Merge (AI überschreibt komplett)
    return aiArray.map((row: any) => ({
      ...row,
      echteEingabe: row.echteEingabe !== undefined ? row.echteEingabe : true
    }));
  };

  // Sichere Extraktion der Daten mit Null-Checks
  const processExtractedData = (aiData: ClaudeResponse): Array<{label: string, value: string, formattedValue: string}> => {
    const updatedFieldsWithValues: Array<{label: string, value: string, formattedValue: string}> = [];
    
    // Entfernte überflüssige processExtractedData-Logs
    
    // Null-Check für extractedData
    if (!aiData.extractedData || typeof aiData.extractedData !== 'object') {
      return updatedFieldsWithValues;
    }

    // Aktuelle Werte vor der Aktualisierung speichern für Vergleich
    const previousValues: Record<string, string> = {};
    fieldConfigs.forEach(config => {
      previousValues[config.fieldKey] = config.currentValue || '';
    });

    // Batch alle Updates für gleichzeitige Ausführung
    const pendingUpdates: Array<{ fieldConfig: any, newValue: any }> = [];

    // Sichere Iteration über extractedData
    try {
      Object.entries(aiData.extractedData).forEach(([fieldKey, extractedValue]) => {
        
        // Null-Check für extractedValue
        if (!extractedValue || typeof extractedValue !== 'object') {
          return;
        }

        const typedExtractedValue = extractedValue as ExtractedFieldValue;
        
        // Confidence-Check
        if (!typedExtractedValue.value || typedExtractedValue.confidence <= 0.5) {
          return;
        }

        // Passende FieldConfig finden
        const fieldConfig = fieldConfigs.find(config => config.fieldKey === fieldKey);
        if (!fieldConfig) {
          return;
        }

        const previousValue = previousValues[fieldKey];
        
        // Wert konvertieren basierend auf Feldtyp
        let newValue: any;
        try {
          const convertedValue = convertValueToFieldType(typedExtractedValue.value, fieldConfig.type);
          
          // Bei Tabellen-Feldern mit intelligenter Merge-Logik
          if (fieldConfig.type === 'table' || fieldConfig.type === 'single-line-table') {
            // Verwende Merge-Logik für Tabellen
            const currentTableValue = fieldConfig.currentValue || [];
            const aiTableValue = Array.isArray(convertedValue) ? convertedValue : [];
            
            if (fieldConfig.type === 'single-line-table' && aiTableValue.length > 0) {
              // Spezielle Behandlung für einzeilige Tabellen (existing logic)
              if (Array.isArray(currentTableValue) && currentTableValue.length > 0) {
                const existingRow = currentTableValue[0];
                const aiRow = aiTableValue[0];
                
                newValue = [{
                  ...existingRow, // Preserve existing ID and other properties
                  ...aiRow,       // Override with AI extracted values
                  id: existingRow.id || '1' // Ensure ID is preserved
                }];
              } else {
                newValue = aiTableValue.map((row: any, index: number) => ({
                  ...row,
                  id: row.id || (index + 1).toString()
                }));
              }
            } else {
              // Verwende intelligente Merge-Funktion für normale Tabellen
              newValue = mergeTableData(currentTableValue, aiTableValue, fieldKey);
            }
          } else {
            newValue = String(convertedValue);
          }
        } catch (conversionError) {
          
          // Fallback für Tabellen
          if (fieldConfig.type === 'table' || fieldConfig.type === 'single-line-table') {
            newValue = Array.isArray(typedExtractedValue.value) ? typedExtractedValue.value : [];
          } else {
            newValue = String(typedExtractedValue.value);
          }
        }

        // Artifact-basierte Domain-Validation für Tabellen (async handling)
        if ((fieldConfig.type === 'table' || fieldConfig.type === 'single-line-table') && Array.isArray(newValue)) {
          // Note: Synchrone Verarbeitung für bessere Performance
          // Domain-Validation wird im Hintergrund über Artifact-Fallback abgehandelt
          newValue.forEach((row: any, rowIndex: number) => {
            Object.entries(row).forEach(([columnKey, columnValue]) => {
              if (columnKey !== 'id' && typeof columnValue === 'string') {
                // Finde die Spalten-Definition
                const columnDef = fieldConfig.table?.columns?.find(col => col.key === columnKey);
                if (columnDef?.dropdown?.domainId) {
                  const domainId = columnDef.dropdown.domainId;
                  // Asynchrone Validation wird über das Artifact-System abgehandelt
                  // Für bessere Performance: Validation erfolgt client-side
                }
              }
            });
          });
        }

        // Standard-Validierung
        const validationResult = validateFieldValue(fieldConfig, newValue);
        if (!validationResult.isValid) {
          // Optional: Trotzdem setzen oder überspringen
          // return;
        }

        // Nur bei tatsächlicher Änderung zur Anzeige hinzufügen
        const hasChanged = (fieldConfig.type === 'table' || fieldConfig.type === 'single-line-table')
          ? JSON.stringify(previousValue) !== JSON.stringify(newValue)
          : previousValue !== newValue;
          
        if (hasChanged) {
          try {
            
            // Update für später sammeln statt sofort ausführen
            pendingUpdates.push({ fieldConfig, newValue });
            
            // Formatierung für die Anzeige
            const formattedValue = formatValueForDisplay(newValue, fieldConfig.type);
            
            // Werte für die Antwort speichern (nur die geänderten Werte)
            updatedFieldsWithValues.push({
              label: fieldConfig.label,
              value: (fieldConfig.type === 'table' || fieldConfig.type === 'single-line-table') ? JSON.stringify(newValue) : String(newValue),
              formattedValue: formattedValue
            });
            
          } catch (updateError) {
          }
        } else {
        }
      });
    } catch (iterationError) {
    }

    // ALLE Updates in einem Batch ausführen (verhindert "maximum update depth exceeded")
    if (pendingUpdates.length > 0) {
      try {
        // Verwende setTimeout für asynchrone Ausführung
        setTimeout(() => {
          const globalUpdates: Record<string, any> = {};
          
          pendingUpdates.forEach(({ fieldConfig, newValue }) => {
            try {
              fieldConfig.onChange(newValue);
              // Sammle für direkte globale Synchronisation
              globalUpdates[fieldConfig.fieldKey] = newValue;
            } catch (error) {
            }
          });
          
          // ZUSÄTZLICHE DIREKTE SYNCHRONISATION (als Backup)
          if (Object.keys(globalUpdates).length > 0) {
            updateGlobalFieldDefinitions(globalUpdates);
          }
        }, 0);
      } catch (batchError) {
      }
    }

    // Die Sparten- und Baustein-Daten kommen jetzt direkt als Tabellen-Updates in extractedData

    return updatedFieldsWithValues;
  };

  // Response-Message generieren
  const generateResponseMessage = (
    updatedFieldsWithValues: Array<{label: string, value: string, formattedValue: string}>,
    aiData: ClaudeResponse
  ): string => {
    let responseMessage = '';

    if (updatedFieldsWithValues.length > 0) {
      const formattedDates = updatedFieldsWithValues.map(field => 
        `${field.label}: ${field.formattedValue}`
      ).join(', ');

      responseMessage = `Verstanden! Ich habe folgende Daten aktualisiert: ${formattedDates}`;

      // Validation Errors hinzufügen
      if (aiData.validationErrors && Array.isArray(aiData.validationErrors) && aiData.validationErrors.length > 0) {
        responseMessage += `\n\n⚠️ Hinweise: ${aiData.validationErrors.join(', ')}`;
      }

      // Suggestions hinzufügen
      if (aiData.suggestions && Array.isArray(aiData.suggestions) && aiData.suggestions.length > 0) {
        responseMessage += `\n\n💡 Vorschläge: ${aiData.suggestions.join(', ')}`;
      }

    } else {
      responseMessage = 'Ich konnte keine neuen oder geänderten Datumsinformationen in Ihrer Nachricht erkennen. ';
      
      if (aiData.recognizedPhrases && Array.isArray(aiData.recognizedPhrases) && aiData.recognizedPhrases.length > 0) {
        responseMessage += `Ich habe folgende Begriffe erkannt: ${aiData.recognizedPhrases.join(', ')}. `;
      }
      
      responseMessage += 'Können Sie präziser sein? Zum Beispiel: "Das Auto wurde am 15.03.2024 gekauft" oder "Der Vertrag beginnt am 01.01.2025".';
    }

    // Erläuterung und Confidence Score hinzufügen (wenn aktiviert)
    if (showExplanation) {
      // Confidence Score anzeigen
      const confidenceScore = typeof aiData.overallConfidence === 'number' ? aiData.overallConfidence : 0;
      responseMessage += `\n\n📊 Sicherheit: ${Math.round(confidenceScore * 100)}%`;
      
      // Erläuterung hinzufügen, falls vorhanden
      if (aiData.explanation && typeof aiData.explanation === 'string') {
        responseMessage += `\n\n💭 Erläuterung: ${aiData.explanation}`;
      }
    } else {
      // Nur bei niedriger Confidence Score anzeigen (auch wenn Checkbox nicht aktiviert)
      const confidenceScore = typeof aiData.overallConfidence === 'number' ? aiData.overallConfidence : 0;
      if (confidenceScore < 0.7) {
        responseMessage += `\n\n📊 Sicherheit: ${Math.round(confidenceScore * 100)}%`;
      }
    }

    return responseMessage;
  };

  // KI-Antwort über API generieren
  const generateAIResponse = async (userText: string): Promise<string> => {
    try {
      
      const currentValues = getCurrentValues();
      
      const requestBody = {
        text: userText,
        currentValues: currentValues
      };
      

      const response = await fetch('/api/extract-dates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });


      if (!response.ok) {
        let errorMessage = 'Unbekannter Fehler';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
        }
        return `Entschuldigung, es gab einen Fehler bei der Verarbeitung: ${errorMessage}`;
      }

      let result: ApiResponse;
      try {
        result = await response.json();
      } catch (jsonError) {
        return 'Entschuldigung, die API-Antwort konnte nicht verarbeitet werden.';
      }


      // Validierung der API-Response
      if (!result || typeof result !== 'object') {
        return 'Entschuldigung, die API-Antwort ist ungültig.';
      }

      if (!result.success) {
        const errorMsg = result.error || 'Unbekannter API-Fehler';
        return `Es gab ein Problem bei der Analyse: ${errorMsg}`;
      }

      if (!result.data) {
        return 'Es gab ein Problem bei der Analyse: Keine Daten erhalten';
      }

      const aiData = result.data;
      
      
      // Daten verarbeiten  
      const updatedFieldsWithValues = processExtractedData(aiData);
      
      // Response-Message generieren
      const responseMessage = generateResponseMessage(updatedFieldsWithValues, aiData);
      return responseMessage;

    } catch (error) {
      return 'Entschuldigung, es gab einen technischen Fehler. Bitte versuchen Sie es erneut.';
    }
  };

  const handleSendMessage = async () => {
    
    if (!inputMessage.trim() || isTyping) {
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    const currentInput = inputMessage;
    setInputMessage('');
    setIsTyping(true);
    

    try {
      // 🌐 Stelle sicher, dass Produktdaten geladen sind für AI-Verarbeitung
      if (!isProductDataLoaded) {
        await ensureProductDataLoaded();
      }
      
      // AI Response generieren
      const aiResponseText = await generateAIResponse(currentInput);
      
      // Realistische Verzögerung für bessere UX
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        text: aiResponseText,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        text: 'Entschuldigung, es gab einen Fehler bei der Verarbeitung Ihrer Anfrage.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isTyping) {
      setInputMessage(e.target.value || '');
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-blue-50 rounded-t-lg">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">Claude KI-Assistent</h3>
          <p className="text-sm text-gray-600">
            Powered by Anthropic Claude
          </p>
        </div>
        
        {/* Explanation Checkbox */}
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-gray-500" />
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={showExplanation}
              onChange={(e) => setShowExplanation(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span>Erläuterung anzeigen</span>
          </label>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex items-start gap-2 max-w-xs ${
                message.isUser ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.isUser 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {message.isUser ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
              <div
                className={`rounded-lg px-3 py-2 ${
                  message.isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.isUser ? 'text-blue-200' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-gray-600" />
              </div>
              <div className="bg-gray-100 rounded-lg px-3 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Erzählen Sie mir von Ihren Autoversicherungsdaten..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isTyping}
            readOnly={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage?.trim() || isTyping}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};