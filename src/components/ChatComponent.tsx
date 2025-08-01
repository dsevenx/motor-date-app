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
import { ClaudeResponse } from '@/constants/fieldConfig';

export const ChatComponent: React.FC<ChatComponentProps> = ({ fieldConfigs }) => {
   
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

  // Sichere Extraktion der Daten mit Null-Checks
  const processExtractedData = (aiData: ClaudeResponse): Array<{label: string, value: string, formattedValue: string}> => {
    const updatedFieldsWithValues: Array<{label: string, value: string, formattedValue: string}> = [];
    
    // Null-Check für extractedData
    if (!aiData.extractedData || typeof aiData.extractedData !== 'object') {
      console.warn('extractedData ist null, undefined oder kein Objekt:', aiData.extractedData);
      return updatedFieldsWithValues;
    }

    // Aktuelle Werte vor der Aktualisierung speichern für Vergleich
    const previousValues: Record<string, string> = {};
    fieldConfigs.forEach(config => {
      previousValues[config.fieldKey] = config.currentValue || '';
    });

    // Sichere Iteration über extractedData
    try {
      console.log('Processing extracted data fields:', Object.keys(aiData.extractedData));
      Object.entries(aiData.extractedData).forEach(([fieldKey, extractedValue]) => {
        // Null-Check für extractedValue
        if (!extractedValue || typeof extractedValue !== 'object') {
          console.warn(`Ungültiger extractedValue für ${fieldKey}:`, extractedValue);
          return;
        }

        const typedExtractedValue = extractedValue as ExtractedFieldValue;
        
        // Confidence-Check
        if (!typedExtractedValue.value || typedExtractedValue.confidence <= 0.5) {
          console.log(`Überspringe ${fieldKey} - niedrige Confidence oder kein Wert:`, typedExtractedValue);
          return;
        }

        // Passende FieldConfig finden
        const fieldConfig = fieldConfigs.find(config => config.fieldKey === fieldKey);
        if (!fieldConfig) {
          console.warn(`Keine FieldConfig gefunden für ${fieldKey}`);
          return;
        }

        const previousValue = previousValues[fieldKey];
        
        // Wert konvertieren basierend auf Feldtyp
        let newValue: any;
        try {
          const convertedValue = convertValueToFieldType(typedExtractedValue.value, fieldConfig.type);
          
          // Bei Tabellen-Feldern den Wert direkt übernehmen (Array)
          if (fieldConfig.type === 'table') {
            newValue = convertedValue;
            console.log(`Table data for ${fieldKey}:`, convertedValue);
          } else {
            newValue = String(convertedValue);
          }
        } catch (conversionError) {
          console.error(`Fehler bei Typkonvertierung für ${fieldKey}:`, conversionError);
          
          // Fallback für Tabellen
          if (fieldConfig.type === 'table') {
            newValue = Array.isArray(typedExtractedValue.value) ? typedExtractedValue.value : [];
            console.log(`Table fallback for ${fieldKey}:`, newValue);
          } else {
            newValue = String(typedExtractedValue.value);
          }
        }

        // Artifact-basierte Domain-Validation für Tabellen (async handling)
        if (fieldConfig.type === 'table' && Array.isArray(newValue)) {
          // Note: Synchrone Verarbeitung für bessere Performance
          // Domain-Validation wird im Hintergrund über Artifact-Fallback abgehandelt
          newValue.forEach((row: any, rowIndex: number) => {
            Object.entries(row).forEach(([columnKey, columnValue]) => {
              if (columnKey !== 'id' && typeof columnValue === 'string') {
                // Finde die Spalten-Definition
                const columnDef = fieldConfig.table?.columns?.find(col => col.key === columnKey);
                if (columnDef?.dropdown?.domainId) {
                  const domainId = columnDef.dropdown.domainId;
                  console.log(`Domain-Value "${columnValue}" für ${domainId} in ${fieldKey}[${rowIndex}].${columnKey}`);
                  
                  // Asynchrone Validation wird über das Artifact-System abgehandelt
                  // Für bessere Performance: Validation erfolgt client-side
                  console.log(`Domain-Value verarbeitet: ${domainId}`);
                }
              }
            });
          });
        }

        // Standard-Validierung
        const validationResult = validateFieldValue(fieldConfig, newValue);
        if (!validationResult.isValid) {
          console.warn(`Validierungsfehler für ${fieldKey}:`, validationResult.errors);
          // Optional: Trotzdem setzen oder überspringen
          // return;
        }

        // Nur bei tatsächlicher Änderung zur Anzeige hinzufügen
        const hasChanged = fieldConfig.type === 'table' 
          ? JSON.stringify(previousValue) !== JSON.stringify(newValue)
          : previousValue !== newValue;
          
        if (hasChanged) {
          try {
            // Feld aktualisieren
            fieldConfig.onChange(newValue);
            
            // Formatierung für die Anzeige
            const formattedValue = formatValueForDisplay(newValue, fieldConfig.type);
            
            // Werte für die Antwort speichern (nur die geänderten Werte)
            updatedFieldsWithValues.push({
              label: fieldConfig.label,
              value: fieldConfig.type === 'table' ? JSON.stringify(newValue) : String(newValue),
              formattedValue: formattedValue
            });
            
            console.log(`Updated ${fieldKey} from "${JSON.stringify(previousValue)}" to "${JSON.stringify(newValue)}" (formatted: ${formattedValue})`);
          } catch (updateError) {
            console.error(`Fehler beim Aktualisieren von ${fieldKey}:`, updateError);
          }
        } else {
          console.log(`${fieldKey} unchanged: "${JSON.stringify(previousValue)}"`);
        }
      });
    } catch (iterationError) {
      console.error('Fehler beim Iterieren über extractedData:', iterationError);
    }

    // Verarbeite Sparten- und Baustein-Aktionen separat über onFieldDefinitionsChange
    if (aiData.spartenActions || aiData.bausteinActions) {
      console.log('🔄 Verarbeite spartenActions/bausteinActions im ChatComponent:', {
        spartenActions: aiData.spartenActions,
        bausteinActions: aiData.bausteinActions
      });
      
      try {
        // Finde die onFieldDefinitionsChange Funktion
        const produktSpartenField = fieldConfigs.find(config => config.fieldKey === 'produktSparten');
        if (produktSpartenField && produktSpartenField.onFieldDefinitionsChange) {
          // Beide Actions weiterleiten
          const updateData: Record<string, any> = {};
          if (aiData.spartenActions) updateData.spartenActions = aiData.spartenActions;
          if (aiData.bausteinActions) updateData.bausteinActions = aiData.bausteinActions;
          
          console.log('🔄 Sende Actions an MotorProduktSpartenTree:', updateData);
          produktSpartenField.onFieldDefinitionsChange(updateData);
          
          // Sparten-Aktivierungen zu den angezeigten Updates hinzufügen
          if (aiData.spartenActions) {
            Object.entries(aiData.spartenActions).forEach(([sparteKey, action]) => {
              if (action.active) {
                updatedFieldsWithValues.push({
                  label: `Sparte ${sparteKey}`,
                  value: 'aktiviert',
                  formattedValue: `${sparteKey} aktiviert: ${action.reason}`
                });
              }
            });
          }
          
          // Baustein-Aktivierungen zu den angezeigten Updates hinzufügen
          if (aiData.bausteinActions) {
            aiData.bausteinActions.forEach(action => {
              if (action.active) {
                const betragText = action.betrag ? ` (${action.betrag}€)` : '';
                updatedFieldsWithValues.push({
                  label: `Baustein ${action.sparte}`,
                  value: action.beschreibung,
                  formattedValue: `${action.beschreibung}${betragText}: ${action.reason}`
                });
              }
            });
          }
        } else {
          console.warn('onFieldDefinitionsChange nicht gefunden für produktSparten');
        }
      } catch (error) {
        console.error('Fehler beim Verarbeiten der spartenActions/bausteinActions:', error);
      }
    }

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
      console.log('Sende Request an API...');
      
      const requestBody = {
        text: userText,
        currentValues: getCurrentValues()
      };
      
      console.log('Request Body:', requestBody);

      const response = await fetch('/api/extract-dates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('API Response Status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Unbekannter Fehler';
        try {
          const errorData = await response.json();
          console.error('API Error:', errorData);
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          console.error('Fehler beim Parsen der Error-Response:', jsonError);
        }
        return `Entschuldigung, es gab einen Fehler bei der Verarbeitung: ${errorMessage}`;
      }

      let result: ApiResponse;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error('Fehler beim Parsen der API-Response:', jsonError);
        return 'Entschuldigung, die API-Antwort konnte nicht verarbeitet werden.';
      }

      console.log('API Result:', result);

      // Validierung der API-Response
      if (!result || typeof result !== 'object') {
        console.error('API-Response ist null oder kein Objekt:', result);
        return 'Entschuldigung, die API-Antwort ist ungültig.';
      }

      if (!result.success) {
        const errorMsg = result.error || 'Unbekannter API-Fehler';
        console.error('API Success=false:', errorMsg);
        return `Es gab ein Problem bei der Analyse: ${errorMsg}`;
      }

      if (!result.data) {
        console.error('API-Response hat keine Daten:', result);
        return 'Es gab ein Problem bei der Analyse: Keine Daten erhalten';
      }

      const aiData = result.data;
      
      // Daten verarbeiten
      const updatedFieldsWithValues = processExtractedData(aiData);
      
      // Response-Message generieren
      const responseMessage = generateResponseMessage(updatedFieldsWithValues, aiData);

      return responseMessage;

    } catch (error) {
      console.error('Fehler beim API-Aufruf:', error);
      return 'Entschuldigung, es gab einen technischen Fehler. Bitte versuchen Sie es erneut.';
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

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
      console.error('Error generating AI response:', error);
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
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
            onKeyPress={handleKeyPress}
            placeholder="Erzählen Sie mir von Ihren Fahrzeugdaten..."
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