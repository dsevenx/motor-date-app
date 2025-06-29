"use client"
import React, { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { ChatComponentProps, ChatMessage, FieldConfig } from '@/constants';

export const ChatComponent: React.FC<ChatComponentProps> = ({ fieldConfigs }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: "Wie kann ich Ihnen helfen? Sie können mir zum Beispiel sagen: 'Ich habe mein Auto am 15.3.2024 gekauft'",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);

  // Datum aus Text extrahieren
  const extractDateFromText = (text: string): string | null => {
    // Verschiedene Datumsformate erkennen
    const datePatterns = [
      /(\d{1,2})\.(\d{1,2})\.(\d{4})/g, // DD.MM.YYYY
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/g, // DD/MM/YYYY
      /(\d{4})-(\d{1,2})-(\d{1,2})/g,   // YYYY-MM-DD
    ];

    for (const pattern of datePatterns) {
      const match = pattern.exec(text);
      if (match) {
        if (text.includes('.')) {
          // DD.MM.YYYY Format
          const day = match[1].padStart(2, '0');
          const month = match[2].padStart(2, '0');
          const year = match[3];
          return `${year}-${month}-${day}`;
        } else if (text.includes('/')) {
          // DD/MM/YYYY Format  
          const day = match[1].padStart(2, '0');
          const month = match[2].padStart(2, '0');
          const year = match[3];
          return `${year}-${month}-${day}`;
        } else {
          // YYYY-MM-DD Format
          return match[0];
        }
      }
    }
    return null;
  };

  // Feld basierend auf Synonymen identifizieren
  const identifyField = (text: string): FieldConfig | null => {
    const lowerText = text.toLowerCase();
    
    for (const fieldConfig of fieldConfigs) {
      for (const synonym of fieldConfig.synonyms) {
        if (lowerText.includes(synonym.toLowerCase())) {
          return fieldConfig;
        }
      }
    }
    return null;
  };

  // KI-Antwort basierend auf Benutzereingabe generieren
  const generateAIResponse = (userText: string): string => {
    const extractedDate = extractDateFromText(userText);
    const identifiedField = identifyField(userText);

    if (extractedDate && identifiedField) {
      // Datum aktualisieren
      identifiedField.onChange(extractedDate);
      
      const formattedDate = new Date(extractedDate).toLocaleDateString('de-DE');
      return `Verstanden! Ich habe das ${identifiedField.label} auf den ${formattedDate} gesetzt.`;
    } else if (extractedDate && !identifiedField) {
      return `Ich habe ein Datum (${new Date(extractedDate).toLocaleDateString('de-DE')}) erkannt, bin mir aber nicht sicher, zu welchem Feld es gehört. Könnten Sie präziser sein? Z.B. "Kaufdatum", "Erstzulassung", etc.`;
    } else if (!extractedDate && identifiedField) {
      return `Ich verstehe, dass es um das ${identifiedField.label} geht, aber ich konnte kein Datum erkennen. Bitte geben Sie das Datum im Format TT.MM.JJJJ an.`;
    } else {
      return getRandomResponse();
    }
  };

  const aiResponses = [
    "Wie kann ich Ihnen helfen?",
    "Ich schaue mir Ihre Fahrzeugdaten an",
    "Basierend auf Ihren Daten kann ich Ihnen bei der Terminplanung helfen.",
    "Möchten Sie, dass ich die Gültigkeit Ihrer Fahrzeugdaten überprüfe?",
    "Ich kann Ihnen auch bei der Berechnung von Fristen behilflich sein.",
  ];

  const getRandomResponse = (): string => {
    // Prioritize the two main responses
    const mainResponses = [
      "Wie kann ich Ihnen helfen?",
      "Ich schaue mir Ihrer Fahrzeugdaten an"
    ];
    
    // 70% chance for main responses, 30% for extended responses
    if (Math.random() < 0.7) {
      return mainResponses[Math.floor(Math.random() * mainResponses.length)];
    } else {
      return aiResponses[Math.floor(Math.random() * aiResponses.length)];
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        text: generateAIResponse(inputMessage),
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // 1-3 seconds delay
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
          <h3 className="font-semibold text-gray-800">KI-Assistent</h3>
          <p className="text-sm text-gray-600">Hilft bei Fahrzeugdaten</p>
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
                <p className="text-sm">{message.text}</p>
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
            placeholder="Fragen Sie mich etwas..."
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