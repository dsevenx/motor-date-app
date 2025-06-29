"use client"
import React, { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { ChatComponentProps, ChatMessage, ClaudeResponse } from '@/constants';

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: ClaudeResponse;
  error?: string;
  details?: string;
}

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

  // Aktuelle Werte für die API zusammenstellen
  const getCurrentValues = () => {
    const currentValues: Record<string, string> = {};
    fieldConfigs.forEach(config => {
      currentValues[config.fieldKey] = config.currentValue || '';
    });
    return currentValues;
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
        const errorData = await response.json();
        console.error('API Error:', errorData);
        return `Entschuldigung, es gab einen Fehler bei der Verarbeitung: ${errorData.error || 'Unbekannter Fehler'}`;
      }

      const result: ApiResponse = await response.json();
      console.log('API Result:', result);

      if (!result.success || !result.data) {
        return `Es gab ein Problem bei der Analyse: ${result.error || 'Keine Daten erhalten'}`;
      }

      const aiData = result.data;
      let responseMessage = '';

      // Extrahierte Daten verarbeiten und Felder aktualisieren
      const updatedFieldsWithValues: Array<{label: string, value: string, formattedValue: string}> = [];
      
      Object.entries(aiData.extractedDates).forEach(([fieldKey, extractedDate]) => {
        if (extractedDate.value && extractedDate.confidence > 0.5) {
          // Passende FieldConfig finden
          const fieldConfig = fieldConfigs.find(config => config.fieldKey === fieldKey);
          if (fieldConfig) {
            // Feld aktualisieren
            fieldConfig.onChange(extractedDate.value);
            
            // Werte für die Antwort speichern (die neuen Werte verwenden)
            const formattedDate = new Date(extractedDate.value).toLocaleDateString('de-DE');
            updatedFieldsWithValues.push({
              label: fieldConfig.label,
              value: extractedDate.value,
              formattedValue: formattedDate
            });
            
            console.log(`Updated ${fieldKey} to ${extractedDate.value} (formatted: ${formattedDate})`);
          }
        }
      });

      // Response-Message generieren
      if (updatedFieldsWithValues.length > 0) {
        const formattedDates = updatedFieldsWithValues.map(field => 
          `${field.label}: ${field.formattedValue}`
        ).join(', ');

        responseMessage = `Verstanden! Ich habe folgende Daten aktualisiert: ${formattedDates}`;

        // Validation Errors hinzufügen
        if (aiData.validationErrors && aiData.validationErrors.length > 0) {
          responseMessage += `\n\n⚠️ Hinweise: ${aiData.validationErrors.join(', ')}`;
        }

        // Suggestions hinzufügen
        if (aiData.suggestions && aiData.suggestions.length > 0) {
          responseMessage += `\n\n💡 Vorschläge: ${aiData.suggestions.join(', ')}`;
        }

      } else {
        responseMessage = 'Ich konnte keine eindeutigen Datumsinformationen in Ihrer Nachricht erkennen. ';
        
        if (aiData.recognizedPhrases && aiData.recognizedPhrases.length > 0) {
          responseMessage += `Ich habe folgende Begriffe erkannt: ${aiData.recognizedPhrases.join(', ')}. `;
        }
        
        responseMessage += 'Können Sie präziser sein? Zum Beispiel: "Das Auto wurde am 15.03.2024 gekauft" oder "Der Vertrag beginnt am 01.01.2025".';
      }

      // Confidence Score anzeigen (für Debugging)
      if (aiData.overallConfidence < 0.7) {
        responseMessage += `\n\n(Sicherheit: ${Math.round(aiData.overallConfidence * 100)}%)`;
      }

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
        <div>
          <h3 className="font-semibold text-gray-800">Claude KI-Assistent</h3>
          <p className="text-sm text-gray-600">Powered by Anthropic Claude</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
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