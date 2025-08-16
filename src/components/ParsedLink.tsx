// React-Komponente für die Darstellung von HTML-Links aus Service-Daten

import React from 'react';
import { parseHtmlLink, extractLinkText } from '@/utils/htmlLinkParser';

interface ParsedLinkProps {
  htmlString: string;
  className?: string;
  fallbackClassName?: string;
}

/**
 * Komponente die HTML-Links aus Service-Daten korrekt rendert
 * Zeigt entweder einen klickbaren Link oder normalen Text an
 */
export const ParsedLink: React.FC<ParsedLinkProps> = ({ 
  htmlString, 
  className = "text-blue-600 underline hover:text-blue-800 cursor-pointer",
  fallbackClassName = "text-gray-900"
}) => {
  const parsedLink = parseHtmlLink(htmlString);

  if (parsedLink) {
    return (
      <a 
        href={parsedLink.href}
        className={className}
        target={parsedLink.type === 'email' ? '_blank' : undefined}
        rel={parsedLink.type === 'email' ? 'noopener noreferrer' : undefined}
      >
        {parsedLink.text}
      </a>
    );
  }

  // Fallback: Zeige normalen Text wenn kein Link erkannt wurde
  return (
    <span className={fallbackClassName}>
      {extractLinkText(htmlString)}
    </span>
  );
};