// Utility-Funktionen für das Parsen von HTML-Links in Service-Daten

export interface ParsedLink {
  href: string;
  text: string;
  type: 'email' | 'tel' | 'other';
}

/**
 * Parst HTML-Links aus Service-Daten und extrahiert href und Text
 * Beispiel: '<a href="mailto:test@test.de">test@test.de</a>' 
 */
export const parseHtmlLink = (htmlString: string): ParsedLink | null => {
  if (!htmlString || typeof htmlString !== 'string') {
    return null;
  }

  // Regex für HTML-Links: <a href="...">....</a>
  const linkRegex = /<a\s+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/i;
  const match = htmlString.match(linkRegex);

  if (match) {
    const [, href, text] = match;
    
    // Bestimme Link-Typ basierend auf href
    let type: ParsedLink['type'] = 'other';
    if (href.startsWith('mailto:')) {
      type = 'email';
    } else if (href.startsWith('tel:')) {
      type = 'tel';
    }

    return {
      href: href,
      text: text.trim(),
      type
    };
  }

  return null;
};

/**
 * Extrahiert nur den reinen Text aus einem HTML-Link
 * Fallback: Gibt den Original-String zurück wenn kein Link gefunden wird
 */
export const extractLinkText = (htmlString: string): string => {
  const parsed = parseHtmlLink(htmlString);
  return parsed ? parsed.text : htmlString;
};

/**
 * Extrahiert nur die href-URL aus einem HTML-Link
 * Fallback: Gibt null zurück wenn kein Link gefunden wird
 */
export const extractLinkHref = (htmlString: string): string | null => {
  const parsed = parseHtmlLink(htmlString);
  return parsed ? parsed.href : null;
};

/**
 * Prüft ob ein String ein HTML-Link ist
 */
export const isHtmlLink = (htmlString: string): boolean => {
  return parseHtmlLink(htmlString) !== null;
};

/**
 * Bereinigt HTML-Entities in Strings (z.B. &quot; zu ")
 */
export const unescapeHtml = (str: string): string => {
  const map: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#x60;': '`',
    '&#x2F;': '/'
  };
  
  return str.replace(/&[#\w]+;/g, (entity) => map[entity] || entity);
};

/**
 * Entfernt doppelte Backslashes aus Service-Daten
 * Beispiel: "Fax\\: +49 (069) 712684455" wird zu "Fax: +49 (069) 712684455"
 */
export const cleanDoubleBackslashes = (str: string): string => {
  if (!str || typeof str !== 'string') {
    return str;
  }
  
  // Ersetze alle doppelten Backslashes durch einfache
  return str.replace(/\\/g, '');
};

/**
 * Kombinierte Bereinigungsfunktion für Service-Daten
 * Entfernt sowohl doppelte Backslashes als auch HTML-Entities
 */
export const cleanServiceText = (str: string): string => {
  if (!str || typeof str !== 'string') {
    return str;
  }
  
  // Zuerst doppelte Backslashes entfernen, dann HTML-Entities
  return unescapeHtml(cleanDoubleBackslashes(str));
};