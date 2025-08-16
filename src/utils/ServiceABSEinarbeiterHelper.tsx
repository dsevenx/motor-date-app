// ServiceABSEinarbeiterHelper.tsx - Helper für SOAP XML Generation und ServiceABSEinarbeiter Integration

import { FIELD_DEFINITIONS, FieldDefinition, TableRow } from '@/constants/fieldConfig';

export interface ServiceABSEinarbeiterRequest {
  xml: string;
  personen: string;
  vertrag: string;
  kraftbl: string;
}

export interface ServiceABSEinarbeiterResponse {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Helper-Klasse für die ServiceABSEinarbeiter SOAP-Integration
 * Erstellt XML für den Persistence-WebService und zeigt es auf KB-TH an
 */
export class ServiceABSEinarbeiterHelper {
  
  /**
   * Ermittelt den XML-Sende-Tag-Namen basierend auf dem Field Key
   * @param key - Field Key aus FIELD_DEFINITIONS
   * @returns XML Tag Name mit _e Suffix
   */
  static ermittelXMLSendeTagName(key: string): string {
    if (key.startsWith('Kraft')) {
      // Nimm den Teil nach 'Kraft'
      const nachKraft = key.substring(5); // 'Kraft' hat 5 Zeichen
      
      // Füge vor jeden Großbuchstaben einen Unterstrich hinzu und mache alles klein
      const mitUnterstrichen = nachKraft.replace(/[A-Z]/g, (match, offset) => {
        return offset > 0 ? '_' + match.toLowerCase() : match.toLowerCase();
      });
      
      return mitUnterstrichen + '_e';
    } else {
      // Für Keys die nicht mit 'Kraft' beginnen, einfach _e anhängen
      return key + '_e';
    }
  }
  
  /**
   * Hauptfunktion: Erzeugt das komplette Sende-XML für den ServiceABSEinarbeiter
   * @param fieldValues - Aktuelle Feldwerte aus dem Formular
   * @returns Das vollständige XML für den SOAP-Service
   */
  static erzeugeSendeXML(fieldValues: Record<string, any>): string {
    const kraftblContent = this.erzeugeKRAFTBLContent(fieldValues);
    
    const xml = `<ANTRAG>
  <PERSONEN></PERSONEN>
  <VERTRAG>
    <KRAFTBL>
${kraftblContent}
    </KRAFTBL>
  </VERTRAG>
</ANTRAG>`;

    return xml;
  }

  /**
   * Erzeugt den KRAFTBL-Inhalt basierend auf FIELD_DEFINITIONS
   * @param fieldValues - Aktuelle Feldwerte
   * @returns XML-Content für KRAFTBL-Tag
   */
  private static erzeugeKRAFTBLContent(fieldValues: Record<string, any>): string {
    const xmlParts: string[] = [];

    FIELD_DEFINITIONS.forEach(field => {
      const fieldValue = fieldValues[field.key];
      const echteEingabeValue = field.echteEingabeValue;
      
      // Prüfe ob Feld vom Nutzer oder KI eingegeben wurde (hat echteEingabe)
      let istEingegeben: boolean;
      
      if (field.type === 'table' || field.type === 'single-line-table') {
        // Für Tabellen: Prüfe ob mindestens eine Zeile echteEingabe hat
        let actualTableData: any[] = [];
        
        // Extrahiere das echte Array aus verschiedenen möglichen Strukturen
        if (Array.isArray(fieldValue)) {
          actualTableData = fieldValue;
        } else if (fieldValue && typeof fieldValue === 'object' && Array.isArray(fieldValue.value)) {
          actualTableData = fieldValue.value;
        } else if (fieldValue && typeof fieldValue === 'object' && fieldValue.data && Array.isArray(fieldValue.data)) {
          actualTableData = fieldValue.data;
        }
        
        if (actualTableData.length > 0) {
          // Prüfe Row-Level echteEingabe
          const hasExplicitEchteEingabe = actualTableData.some((row: any) => row.echteEingabe === true);
          
          // Für Produkttabellen: NUR explizite echteEingabe zählt (keine Fallback-Logik)
          if (field.key === 'produktSparten' || field.key.startsWith('produktBausteine_')) {
            istEingegeben = hasExplicitEchteEingabe;
          } else {
            // Für normale Tabellen: Fallback-Logik für Non-Default-Daten
            const hasNonDefaultData = actualTableData.some((row: any) => {
              // Prüfe ob die Zeile Non-Default-Werte hat (außer id)
              return Object.keys(row).some(key => {
                if (key === 'id' || key === 'echteEingabe') return false;
                const value = row[key];
                return value !== undefined && value !== null && value !== '' && value !== 0;
              });
            });
            
            istEingegeben = hasExplicitEchteEingabe || hasNonDefaultData;
          }
        } else {
          istEingegeben = false;
        }
      } else {
        // Für normale Felder: Prüfe Field-Level echteEingabe
        istEingegeben = echteEingabeValue !== undefined && echteEingabeValue !== field.defaultValue;
      }
      
      if (istEingegeben) {
        if (field.type === 'table' || field.type === 'single-line-table') {
          // Tabellen-Behandlung - extrahiere das echte Array
          let actualTableData: any[] = [];
          
          if (Array.isArray(fieldValue)) {
            actualTableData = fieldValue;
          } else if (fieldValue && typeof fieldValue === 'object' && Array.isArray(fieldValue.value)) {
            actualTableData = fieldValue.value;
          } else if (fieldValue && typeof fieldValue === 'object' && fieldValue.data && Array.isArray(fieldValue.data)) {
            actualTableData = fieldValue.data;
          }
          
          const tableXml = this.erzeugeTabellXML(field, actualTableData);
          if (tableXml) {
            xmlParts.push(tableXml);
          }
        } else {
          // Direkte Felder (Zahl, Datum, Text, DropDown, CheckBox)
          const fieldXml = this.erzeugeFeldXML(field, echteEingabeValue);
          if (fieldXml) {
            xmlParts.push(fieldXml);
          }
        }
      }
    });

    return xmlParts.map(part => `      ${part}`).join('\n');
  }

  /**
   * Erzeugt XML für ein direktes Feld
   * @param field - FieldDefinition
   * @param value - Wert des Feldes
   * @returns XML-String für das Feld
   */
  private static erzeugeFeldXML(field: FieldDefinition, value: any): string | null {
    if (value === undefined || value === null) return null;
    
    let xmlValue: string;
    
    // Wert-Formatierung je nach Feldtyp
    switch (field.type) {
      case 'date':
        xmlValue = value === '0001-01-01' ? '' : value;
        break;
      case 'tristate':
        xmlValue = value; // 'J', 'N', oder ' '
        break;
      case 'boolean':
        xmlValue = value ? 'J' : 'N';
        break;
      case 'number':
        xmlValue = value.toString();
        break;
      default:
        xmlValue = value.toString();
    }

    if (xmlValue === '') return null;

    const tagName = this.ermittelXMLSendeTagName(field.key);
    return `<${tagName}>${this.escapeXML(xmlValue)}</${tagName}>`;
  }

  /**
   * Erzeugt XML für eine Tabelle
   * @param field - FieldDefinition der Tabelle
   * @param tableData - Tabellendaten
   * @returns XML-String für die Tabelle
   */
  private static erzeugeTabellXML(field: FieldDefinition, tableData: TableRow[]): string | null {
    if (!Array.isArray(tableData) || tableData.length === 0) return null;
    
    const zeilen: string[] = [];

    tableData.forEach(row => {
      // Prüfe ob es eine Produkttabelle ist (Sparten oder Bausteine)
      if (this.istProduktTabelle(field.key)) {
        const zeileXml = this.erzeugeProduktZeileXML(field, row);
        if (zeileXml) {
          zeilen.push(`        <zeile>${zeileXml}</zeile>`);
        }
      } else {
        // Normale Tabelle (Kilometerstände, Zubehör, etc.)
        const zeileXml = this.erzeugeNormaleZeileXML(field, row);
        if (zeileXml) {
          zeilen.push(`        <zeile>${zeileXml}</zeile>`);
        }
      }
    });

    if (zeilen.length === 0) return null;

    const tagName = this.ermittelXMLSendeTagName(field.key);
    return `<${tagName}>\n${zeilen.join('\n')}\n      </${tagName}>`;
  }

  /**
   * Erzeugt XML für eine Produkttabellen-Zeile (nur Felder mit KnotenID und echteEingabe)
   * @param field - FieldDefinition der Tabelle
   * @param row - Zeilen-Daten
   * @returns XML-String für die Zeile
   */
  private static erzeugeProduktZeileXML(field: FieldDefinition, row: TableRow): string | null {
    if (!field.table) return null;

    // 🔥 WICHTIG: Für Produkttabellen NUR Zeilen mit expliziter echteEingabe verarbeiten
    if (row.echteEingabe !== true) {
      console.log(`🚫 Produktzeile übersprungen (keine echteEingabe): ${field.key}`, row);
      return null;
    }

    const zellXml: string[] = [];

    // Bei Spartentabelle: nur Zeilen mit KnotenID (z.B. "KH", "KK", "EK", "KU")
    if (field.key === 'produktSparten') {
      const beschreibung = row.beschreibung as string;
      const id = row.id as string;
      if (beschreibung && ['KH', 'KK', 'EK', 'KU'].includes(beschreibung)
      ||id && ['KH', 'KK', 'EK', 'KU'].includes(id)) {
        field.table.columns.forEach(column => {
          const cellValue = row[column.key];
          if (cellValue !== undefined && cellValue !== null && cellValue !== '') {
            zellXml.push(`<${column.key}>${this.escapeXML(cellValue.toString())}</${column.key}>`);
          }
        });
        console.log(`✅ Produktsparte verarbeitet: ${id || beschreibung}`, { zellXml });
      }
    }
    // Bei Bausteintabellen: nur Zeilen mit KnotenID (z.B. "KBM00087")
    else if (field.key.startsWith('produktBausteine_')) {
      // Flexible KnotenID-Erkennung: knotenId oder id verwenden
      const knotenId = (row.knotenId || row.id) as string;
      console.log(`🔍 DEBUG Baustein: field=${field.key}, knotenId=${knotenId}, row=`, row);
      
      if (knotenId && knotenId.trim() !== '') {
        field.table.columns.forEach(column => {
          const cellValue = row[column.key];
          if (cellValue !== undefined && cellValue !== null && cellValue !== '') {
            zellXml.push(`<${column.key}>${this.escapeXML(cellValue.toString())}</${column.key}>`);
          }
        });
        console.log(`✅ Produktbaustein verarbeitet: ${knotenId}`, { zellXml });
      } else {
        console.log(`❌ Produktbaustein übersprungen - keine gültige knotenId/id: ${field.key}`, row);
      }
    }

    return zellXml.length > 0 ? zellXml.join('') : null;
  }

  /**
   * Erzeugt XML für eine normale Tabellen-Zeile
   * @param field - FieldDefinition der Tabelle
   * @param row - Zeilen-Daten
   * @returns XML-String für die Zeile
   */
  private static erzeugeNormaleZeileXML(field: FieldDefinition, row: TableRow): string | null {
    if (!field.table) return null;

    const zellXml: string[] = [];

    field.table.columns.forEach(column => {
      const cellValue = row[column.key];
      if (cellValue !== undefined && cellValue !== null) {
        let xmlValue: string;
        
        // Wert-Formatierung je nach Spaltentyp
        switch (column.type) {
          case 'date':
            xmlValue = cellValue === '0001-01-01' ? '' : cellValue.toString();
            break;
          case 'tristate':
            xmlValue = cellValue.toString(); // 'J', 'N', oder ' '
            break;
          case 'boolean':
            xmlValue = cellValue ? 'J' : 'N';
            break;
          case 'number':
            xmlValue = cellValue.toString();
            break;
          default:
            xmlValue = cellValue.toString();
        }

        if (xmlValue !== '') {
          zellXml.push(`<${column.key}>${this.escapeXML(xmlValue)}</${column.key}>`);
        }
      }
    });

    return zellXml.length > 0 ? zellXml.join('') : null;
  }

  /**
   * Prüft ob es sich um eine Produkttabelle handelt
   * @param fieldKey - Schlüssel des Feldes
   * @returns true wenn Produkttabelle
   */
  private static istProduktTabelle(fieldKey: string): boolean {
    return fieldKey === 'produktSparten' || fieldKey.startsWith('produktBausteine_');
  }

  /**
   * XML-Escaping für sichere XML-Generierung
   * @param value - Zu escapender Wert
   * @returns XML-sicherer String
   */
  private static escapeXML(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Formatiert XML für bessere Lesbarkeit mit Einrückungen
   * Werte stehen inline mit den Tags
   * @param xml - Unformatiertes XML
   * @returns Formatiertes XML mit Einrückungen
   */
  static formatXML(xml: string): string {
    let formatted = '';
    let indentLevel = 0;
    const indent = '  '; // 2 Leerzeichen pro Ebene
    
    // Split by tags and capture content between tags
    const tokens = xml.split(/(<[^>]*>)/);
    
    let i = 0;
    while (i < tokens.length) {
      const token = tokens[i];
      
      if (token.trim() === '') {
        i++;
        continue;
      }
      
      if (token.startsWith('</')) {
        // Closing tag - decrease indent and add on new line
        indentLevel--;
        formatted += '\n' + indent.repeat(Math.max(0, indentLevel)) + token;
      } else if (token.startsWith('<') && token.endsWith('>')) {
        if (token.includes('/>')) {
          // Self-closing tag
          formatted += '\n' + indent.repeat(indentLevel) + token;
        } else {
          // Opening tag
          const nextToken = tokens[i + 1];
          const closingToken = tokens[i + 2];
          
          // Check if this is a simple tag with text content
          if (nextToken && !nextToken.startsWith('<') && nextToken.trim() !== '' &&
              closingToken && closingToken.startsWith('</')) {
            // Inline format: <tag>value</tag>
            formatted += '\n' + indent.repeat(indentLevel) + token + nextToken.trim() + closingToken;
            i += 2; // Skip the next two tokens
          } else {
            // Multi-line format: tag with children
            formatted += '\n' + indent.repeat(indentLevel) + token;
            indentLevel++;
          }
        }
      }
      
      i++;
    }
    
    return formatted.trim();
  }

  /**
   * Zählt die Anzahl der zu sendenden Felder (verwendet dieselbe Logik wie XML-Generierung)
   * @param fieldValues - Aktuelle Feldwerte
   * @returns Anzahl der Felder mit echten Eingaben
   */
  static zaehleEingegebeneFelder(fieldValues: Record<string, any>): number {
    let count = 0;

    FIELD_DEFINITIONS.forEach(field => {
      const fieldValue = fieldValues[field.key];
      const echteEingabeValue = field.echteEingabeValue;
      
      // Verwende dieselbe Logik wie in erzeugeKRAFTBLContent
      let istEingegeben: boolean;
      
      if (field.type === 'table' || field.type === 'single-line-table') {
        // Für Tabellen: Prüfe ob mindestens eine Zeile echteEingabe hat
        let actualTableData: any[] = [];
        
        // Extrahiere das echte Array aus verschiedenen möglichen Strukturen
        if (Array.isArray(fieldValue)) {
          actualTableData = fieldValue;
        } else if (fieldValue && typeof fieldValue === 'object' && Array.isArray(fieldValue.value)) {
          actualTableData = fieldValue.value;
        } else if (fieldValue && typeof fieldValue === 'object' && fieldValue.data && Array.isArray(fieldValue.data)) {
          actualTableData = fieldValue.data;
        }
        
        if (actualTableData.length > 0) {
          // Prüfe Row-Level echteEingabe
          const hasExplicitEchteEingabe = actualTableData.some((row: any) => row.echteEingabe === true);
          
          // Für Produkttabellen: NUR explizite echteEingabe zählt
          if (field.key === 'produktSparten' || field.key.startsWith('produktBausteine_')) {
            istEingegeben = hasExplicitEchteEingabe;
          } else {
            // Für normale Tabellen: Fallback-Logik für Non-Default-Daten
            const hasNonDefaultData = actualTableData.some((row: any) => {
              return Object.keys(row).some(key => {
                if (key === 'id' || key === 'echteEingabe') return false;
                const value = row[key];
                return value !== undefined && value !== null && value !== '' && value !== 0;
              });
            });
            istEingegeben = hasExplicitEchteEingabe || hasNonDefaultData;
          }
        } else {
          istEingegeben = false;
        }
      } else {
        // Für normale Felder: Prüfe Field-Level echteEingabe
        istEingegeben = echteEingabeValue !== undefined && echteEingabeValue !== field.defaultValue;
      }
      
      if (istEingegeben) {
        count++;
      }
    });

    return count;
  }

  /**
   * Erstellt eine Zusammenfassung der zu sendenden Daten (verwendet dieselbe Logik wie XML-Generierung)
   * @param fieldValues - Aktuelle Feldwerte
   * @returns Zusammenfassung als Array von Strings
   */
  static erstelleZusammenfassung(fieldValues: Record<string, any>): string[] {
    const zusammenfassung: string[] = [];

    FIELD_DEFINITIONS.forEach(field => {
      const fieldValue = fieldValues[field.key];
      const echteEingabeValue = field.echteEingabeValue;
      
      // Verwende dieselbe Logik wie in erzeugeKRAFTBLContent
      let istEingegeben: boolean;
      
      if (field.type === 'table' || field.type === 'single-line-table') {
        // Für Tabellen: Prüfe ob mindestens eine Zeile echteEingabe hat
        let actualTableData: any[] = [];
        
        // Extrahiere das echte Array aus verschiedenen möglichen Strukturen
        if (Array.isArray(fieldValue)) {
          actualTableData = fieldValue;
        } else if (fieldValue && typeof fieldValue === 'object' && Array.isArray(fieldValue.value)) {
          actualTableData = fieldValue.value;
        } else if (fieldValue && typeof fieldValue === 'object' && fieldValue.data && Array.isArray(fieldValue.data)) {
          actualTableData = fieldValue.data;
        }
        
        if (actualTableData.length > 0) {
          // Prüfe Row-Level echteEingabe
          const hasExplicitEchteEingabe = actualTableData.some((row: any) => row.echteEingabe === true);
          
          // Für Produkttabellen: NUR explizite echteEingabe zählt
          if (field.key === 'produktSparten' || field.key.startsWith('produktBausteine_')) {
            istEingegeben = hasExplicitEchteEingabe;
            if (istEingegeben) {
              // Zähle nur Zeilen mit echteEingabe für Produkttabellen
              const eingegbeneZeilen = actualTableData.filter((row: any) => row.echteEingabe === true);
              zusammenfassung.push(`${field.label}: ${eingegbeneZeilen.length} eingegeben Zeile(n)`);
            }
          } else {
            // Für normale Tabellen: Fallback-Logik für Non-Default-Daten
            const hasNonDefaultData = actualTableData.some((row: any) => {
              return Object.keys(row).some(key => {
                if (key === 'id' || key === 'echteEingabe') return false;
                const value = row[key];
                return value !== undefined && value !== null && value !== '' && value !== 0;
              });
            });
            istEingegeben = hasExplicitEchteEingabe || hasNonDefaultData;
            if (istEingegeben) {
              zusammenfassung.push(`${field.label}: ${actualTableData.length} Zeile(n)`);
            }
          }
        } else {
          istEingegeben = false;
        }
      } else {
        // Für normale Felder: Prüfe Field-Level echteEingabe
        istEingegeben = echteEingabeValue !== undefined && echteEingabeValue !== field.defaultValue;
        
        if (istEingegeben) {
          let displayValue = echteEingabeValue;
          if (field.type === 'date' && displayValue !== '0001-01-01') {
            displayValue = new Date(displayValue as string).toLocaleDateString('de-DE');
          }
          zusammenfassung.push(`${field.label}: ${displayValue}`);
        }
      }
    });

    return zusammenfassung;
  }
}