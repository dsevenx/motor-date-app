// fieldConfig.ts - Zentrale Feld-Konfiguration mit Tabellen-Unterstützung

export type FieldType = 'date' | 'text' | 'number' | 'boolean' | 'select' | 'table' | 'single-line-table' | 'tristate' | 'dropdown';

export type NumberFormat = 'currency' | 'integer' | 'decimal' | 'percentage' | 'count';

export interface TableColumn {
  key: string;
  label: string;
  type: FieldType;
  width?: string;
  validation?: {
    min?: string | number;
    max?: string | number;
    numberFormat?: NumberFormat;
    maxLength?: number;
  };
  ui?: {
    placeholder?: string;
  };
  dropdown?: {
    domainId?: string;
  };
}

export interface TableRow {
  id: string;
  [key: string]: any;
}

export interface FieldDefinition {
  key: string;                    // Eindeutiger Schlüssel
  label: string;                  // Anzeigename
  type: FieldType;               // Datentyp
  defaultValue: string | number | boolean | TableRow[] | 'J' | 'N' | ' '; // Standardwert
  echteEingabe?: string | number | boolean | TableRow[] | 'J' | 'N' | ' '; // Echte Benutzereingabe
  synonyms: string[];            // KI-Erkennungsworte
  required?: boolean;            // Pflichtfeld
  validation?: {
    min?: string | number;       // Mindestvalue (für Datum/Zahl)
    max?: string | number;       // Maximalwert
    numberFormat?: NumberFormat; // Zahlenformat
    customRule?: string;         // Benutzerdefinierte Regel für KI
    maxLength?: number;          // Maximale Länge (für Text)
  };
  ui?: {
    disabled?: boolean;          // UI-Zustand
    placeholder?: string;        // Platzhalter
    helpText?: string;           // Hilfetext
    group?: string;              // Gruppierung in der UI
    infoText?: string;           // Info-Text für Tooltip
  };
  ai?: {
    priority?: 'high' | 'medium' | 'low';  // KI-Priorität
    context?: string;            // Zusätzlicher Kontext für KI
    correctionRules?: string[];  // Spezifische Korrekturregeln
  };
  // Tabellen-spezifische Eigenschaften
  table?: {
    columns: TableColumn[];      // Spalten-Definition
    addButtonText?: string;      // Text für Add-Button
    emptyText?: string;          // Text bei leerer Tabelle
    relatedFields?: string[];    // Verbundene Felder für KI-Erkennung
  };
  // DropDown-spezifische Eigenschaften
  dropdown?: {
    domainId: string;           // ID für FetchDomainData
  };
}

// Zentrale Feld-Konfiguration
export const FIELD_DEFINITIONS: FieldDefinition[] = [
  {
    key: 'beginndatum',
    label: 'Beginndatum',
    type: 'date',
    defaultValue: '0001-01-01',
    synonyms: ['beginndatum', 'startdatum', 'anfangsdatum', 'ab wann', 'von wann', 'vertragsbeginn', 'versicherungsbeginn', 'gültigkeitsbeginn'],
    required: true,
    validation: {
      customRule: 'Muss vor Ablaufdatum liegen'
    },
    ai: {
      priority: 'high',
      context: 'Beginndatum ist meist der Vertragsbeginn oder Versicherungsbeginn',
      correctionRules: ['Anmeldedatum ≤ Beginndatum (sonst gleichsetzen)']
    }
  },
  {
    key: 'ablaufdatum',
    label: 'Ablaufdatum',
    type: 'date',
    defaultValue: '0001-01-01',
    synonyms: ['ablaufdatum', 'enddatum', 'gültigkeitsende', 'bis wann', 'vertragsende', 'versicherungsende', 'läuft ab', 'endet', 'frist'],
    validation: {
      customRule: 'Muss nach Beginndatum liegen'
    },
    ai: {
      priority: 'high',
      context: 'Ablaufdatum ist das Ende der Gültigkeit',
      correctionRules: ['Ablaufdatum > Beginndatum (sonst null)']
    }
  },
  {
    key: 'erstzulassungsdatum',
    label: 'Erstzulassungsdatum',
    type: 'date',
    defaultValue: '0001-01-01',
    synonyms: [
      'erstzulassung', 
      'erstmals zugelassen', 
      'zulassung', 
      'neuzulassung', 
      'zum ersten mal angemeldet', 
      'fahrzeug ist von',
      'jahre alt',
      'jahr alt', 
      'baujahr',
      'alter',
      'alt',
      'von 20',
      'aus dem jahr',
      'aus 20'
    ],
    ai: {
      priority: 'medium',
      context: 'Erstzulassungsdatum ist das erste Zulassungsdatum des Fahrzeugs. WICHTIG: Bei Altersangaben wie "X Jahre alt" das Erstzulassungsdatum berechnen: aktuelles Jahr - X Jahre.',
      correctionRules: [
        'Erstzulassungsdatum ≤ Anmeldedatum (sonst gleichsetzen)', 
        'Neuwagen: Erstzulassungsdatum = Anmeldedatum',
        'Bei "X Jahre alt": Erstzulassungsdatum = aktuelles Jahr - X Jahre (1. Januar als Default)',
        'Bei "X Jahre altes Auto": Erstzulassungsdatum = aktuelles Jahr - X Jahre'
      ]
    }
  },
  {
    key: 'anmeldedatum',
    label: 'Anmeldedatum',
    type: 'date',
    defaultValue: '0001-01-01',
    synonyms: ['anmeldedatum', 'gekauft', 'erworben', 'auto gekauft', 'fahrzeug gekauft', 'kauf', 'kaufdatum', 'übernommen', 'angemeldet'],
    ai: {
      priority: 'medium',
      context: 'Anmeldedatum ist das Kaufdatum oder Übernahmedatum',
      correctionRules: ['Anmeldedatum ≤ Beginndatum (sonst gleichsetzen)']
    }
  },
  {
    key: 'KraftBoZefdatum',
    label: 'Gültig-Ab-Datum',
    type: 'date',
    defaultValue: '0001-01-01',
    synonyms: ['vorgangsdatum', 'zef-datum', 'wirkbegdat', 'wirkbeginn'],
    ai: {
      priority: 'medium',
      context: 'Vorgangsdatum ist das Datum, ab dem der Vorgang/usecase gültig ist',
      correctionRules: ['Beginndatum ≤ Vorgangsdatum (sonst gleichsetzen)']
    }
  },
  {
    key: 'urbeginn',
    label: 'Urbeginn',
    type: 'date',
    defaultValue: '0001-01-01',
    synonyms: ['urbeginn', 'ursprüngliche Beginn', 'startdatum des ersten vertrags', 'anfangsdatum des ersten vertrags', 'ursprünglicher vertragsbeginn'],
    ai: {
      priority: 'low',
      context: 'Urbeginn ist der ursprüngliche Beginn des ersten Vertrags'
    }
  },
  {
    key: 'stornodatum',
    label: 'Stornodatum/Stilllegung',
    type: 'date',
    defaultValue: '0001-01-01',
    synonyms: ['stornodatum', 'kündigungsdatum', 'stilllegung', 'abmeldung', 'vertrag beenden', 'vertrag kündigen'],
    ai: {
      priority: 'high',
      context: 'Stornodatum ist das Kündigungs- oder Stilllegungsdatum',
      correctionRules: ['Suche nach "musste...abmelden", "aufgrund...am", "wegen...am"']
    }
  },
  {
    key: 'fahrzeugmarke',
    label: 'Fahrzeugmarke',
    type: 'text',
    defaultValue: '',
    synonyms: ['marke', 'hersteller', 'auto von', 'fahrzeug von', 'bmw', 'mercedes', 'audi', 'volkswagen', 'opel'],
    ui: {
      placeholder: 'z.B. BMW, Mercedes, Audi...'
    },
    ai: {
      priority: 'medium',
      context: 'Fahrzeugmarke ist der Hersteller des Fahrzeugs'
    }
  },
  {
    key: 'neuwert',
    label: 'Neuwert',
    type: 'number',
    defaultValue: 0,
    synonyms: ['Neupreis', 'habe beim Hersteller bezahlt', 'Listenpreis'],
    validation: {
      min: 0,
      max: 2000000,
      numberFormat: 'currency'
    },
    ui: {
      placeholder: 'Neuwert eingeben...'
    },
    ai: {
      priority: 'low',
      context: 'Neuwert des Fahrzeugs'
    }
  },
  // TriState-Felder
  {
    key: 'vorsteuerabzugsberechtigt',
    label: 'Vorsteuerabzugsberechtigt',
    type: 'tristate',
    defaultValue: ' ',
    synonyms: [
      'vorsteuerabzugsberechtigt', 'vorsteuer', 'berechtigt', 'abzugsberechtigt',
      'steuerlich absetzbar', 'absetzbar', 'betrieblich', 'geschäftlich',
      'unternehmen', 'firma', 'selbstständig', 'gewerblich',
      'kann absetzen', 'steuerlich', 'von der steuer absetzen'
    ],
    ai: {
      priority: 'medium',
      context: 'Vorsteuerabzugsberechtigung für geschäftliche/betriebliche Nutzung des Fahrzeugs',
      correctionRules: [
        'Bei geschäftlicher/betrieblicher Nutzung meist "J"',
        'Bei privater Nutzung meist "N"',
        'Bei Unsicherheit " " (unbekannt)'
      ]
    },
    ui: {
      infoText: 'Berechtigung zum Vorsteuerabzug bei geschäftlicher Nutzung'
    }
  },
  {
    key: 'abweichende_fahrzeugdaten',
    label: 'Abweichende Fahrzeugdaten',
    type: 'tristate',
    defaultValue: ' ',
    synonyms: [
      'abweichende fahrzeugdaten', 'abweichend', 'anders', 'unterschiedlich',
      'modifiziert', 'verändert', 'tuning', 'umgebaut', 'angepasst',
      'nicht original', 'nicht serienmäßig', 'custom', 'individuell',
      'besonderheiten', 'abweichungen', 'sonderausstattung'
    ],
    ai: {
      priority: 'medium',
      context: 'Fahrzeug weicht von Standarddaten ab (Tuning, Modifikationen, etc.)',
      correctionRules: [
        'Bei Tuning/Modifikationen meist "J"',
        'Bei Serienfahrzeug meist "N"',
        'Bei Unsicherheit " " (unbekannt)'
      ]
    },
    ui: {
      infoText: 'Fahrzeug wurde modifiziert oder weicht von Seriendaten ab'
    }
  },
  // DropDown-Felder
   {
    key: 'KraftBoGruppeAusfertigungsgrundABS',
    label: 'Ausfertigungsgrund ABS',
    type: 'dropdown',
    defaultValue: '',
    synonyms: [
      'Vorgangsart', 'Use Case', 'Ausfertigungsgrund', 'Anlass', 'Grund für Ausfertigung',
    ],
    ai: {
      priority: 'medium',
      context: 'Was möchte der Nutzer von unserem Autoversicherungsverwaltungssystem wissen?',
      correctionRules: [
        'Bei Ändern im Zweifelsfall G80',
        'Bei Beauskunften G01 von Neugschäft'
      ]
    },
    dropdown: {
      domainId: 'KraftBoGruppeMoeglAusfertigungsgrundABS'
    }
  },
  {
    key: 'fahrerkreis',
    label: 'Fahrerkreis',
    type: 'dropdown',
    defaultValue: '',
    synonyms: [
      'fahrerkreis', 'wer darf fahren', 'fahrer', 'berechtigt', 'einzelfahrer',
      'partnertarif', 'familienfahrer', 'beliebige fahrer', 'mindestalter',
      'nur ich', 'mit partner', 'ganze familie', 'alle'
    ],
    ai: {
      priority: 'medium',
      context: 'Fahrerkreis bestimmt, wer das Fahrzeug fahren darf',
      correctionRules: [
        'Bei "nur ich/allein" meist "Einzelfahrer"',
        'Bei "mit Partner/Ehepartner" meist "Partnertarif"',
        'Bei "Familie/Kinder" meist "Familienfahrer"',
        'Bei "jeder/alle" meist "Beliebige Fahrer mit Mindestalter"'
      ]
    },
    dropdown: {
      domainId: 'KraftBoGruppeMoeglFahrerkreis'
    }
  },
  {
    key: 'wirtschaftszweig',
    label: 'Wirtschaftszweig',
    type: 'dropdown',
    defaultValue: '',
    synonyms: [
      'wirtschaftszweig', 'branche', 'tätigkeit', 'beruf', 'wirtschaftsbereich',
      'sektor', 'berufsfeld', 'arbeitsbereich', 'geschäftstätigkeit'
    ],
    ai: {
      priority: 'low',
      context: 'Wirtschaftszweig des Versicherungsnehmers'
    },
    dropdown: {
      domainId: 'KraftBoGruppeMoeglWirtschaftszweig'
    }
  },
  {
    key: 'inkassoart',
    label: 'Inkassoart',
    type: 'dropdown',
    defaultValue: '',
    synonyms: [
      'inkassoart', 'zahlungsart', 'zahlungsweise', 'wie bezahlen',
      'lastschrift', 'überweisung', 'vermittlerinkasso', 'einzug',
      'abbuchung', 'sepa', 'dauerauftrag', 'bezahlart'
    ],
    ai: {
      priority: 'medium',
      context: 'Art der Beitragszahlung/Inkasso',
      correctionRules: [
        'Bei "Lastschrift/Einzug/SEPA" meist "Lastschrift"',
        'Bei "Überweisung/Dauerauftrag/selbst zahlen" meist "Überweisung"',
        'Bei "über Makler/Vermittler" meist "Vermittlerinkasso"'
      ]
    },
    dropdown: {
      domainId: 'KraftBoGruppeMoeglInkassoart'
    }
  },
  // Tabelle: Kilometerstände
  {
    key: 'kilometerstaende',
    label: 'Kilometerstände',
    type: 'table',
    defaultValue: [],
    synonyms: [
      'kilometer', 'km', 'kilometerstand', 'laufleistung', 'gefahren', 
      'bei antragsaufnahme', 'bei vertragsbeginn', 'bei versicherungsbeginn',
      'zu beginn war', 'aktueller stand', 'jetzt', 'heute', 'momentan'
    ],
    ai: {
      priority: 'medium',
      context: 'Kilometerstände zu verschiedenen Zeitpunkten. Erkenne verschiedene Zeitpunkte und ordne sie zu: Antragsaufnahme, Versicherungsbeginn, Vertragsende, etc.',
      correctionRules: [
        'Datum sollte logisch zum Kontext passen',
        'KM-Stand sollte chronologisch steigen',
        'Bei "zu Beginn" verwende beginndatum',
        'Bei "jetzt/heute/aktuell" verwende aktuelles Datum'
      ]
    },
    table: {
      columns: [
        {
          key: 'datum',
          label: 'Datum',
          type: 'date',
          width: '160px'
        },
        {
          key: 'art',
          label: 'Art des KM-Stands',
          type: 'dropdown',
          width: '200px',
          ui: {
            placeholder: 'Bitte eingeben'
          },
          dropdown: {
            domainId: 'KraftBoGruppeMoeglKmAngabeGrund'
          }
        },
        {
          key: 'kmstand',
          label: 'KM-Stand',
          type: 'number',
          width: '120px',
          validation: {
            min: 0,
            max: 1000000,
            numberFormat: 'integer'
          }
        }
      ],
      addButtonText: 'Kilometerstand hinzufügen',
      emptyText: 'Keine Kilometerstände erfasst',
      relatedFields: ['beginndatum', 'anmeldedatum', 'erstzulassungsdatum']
    }
  },
  // Tabelle: Zubehör
  {
    key: 'zubehoer',
    label: 'Zubehör',
    type: 'table',
    defaultValue: [],
    synonyms: [
      'zubehör', 'zusatzausstattung', 'extras', 'sonderausstattung',
      'soundsystem', 'sound', 'musik', 'radio', 'navigation', 'navi',
      'tuning', 'fahrwerk', 'felgen', 'räder', 'reifen',
      'sicherheit', 'alarm', 'diebstahlschutz', 'wegfahrsperre',
      'launch', 'launchcontrol', 'sportauspuff', 'auspuff',
      'habe ein', 'habe eine', 'zusätzlich', 'eingebaut', 'montiert',
      'im wert von', 'kostet', 'wert', 'euro', 'für', 'von'
    ],
    ai: {
      priority: 'medium',
      context: 'Fahrzeug-Zubehör mit Wertangaben. Erkenne Hersteller, Art des Zubehörs, Wert und ob es zuschlagspflichtig ist. Mehrere Zubehörteile in einem Satz sollen als separate Einträge erfasst werden.',
      correctionRules: [
        'Werte über 1000€ sind meist zuschlagspflichtig',
        'Sicherheitssysteme sind meist zuschlagspflichtig',
        'Tuning-Teile sind meist zuschlagspflichtig',
        'Standard-Zubehör wie Radios unter 500€ meist nicht zuschlagspflichtig'
      ]
    },
    table: {
      columns: [
        {
          key: 'hersteller',
          label: 'Hersteller',
          type: 'text',
          width: '140px',
          ui: {
            placeholder: 'z.B. BMW, Bose...'
          }
        },
        {
          key: 'art',
          label: 'Art des Zubehörs',
          type: 'dropdown',
          width: '180px',
          ui: {
            placeholder: 'Bitte eingeben'
          },
          dropdown: {
            domainId: 'KraftBoGruppeMoeglArtZubehoerteil'
          }
        },
        {
          key: 'zuschlag',
          label: 'Zuschlagspflichtig',
          type: 'tristate',
          width: '100px'
        },
        {
          key: 'wert',
          label: 'Wert in Euro',
          type: 'number',
          width: '120px',
          validation: {
            min: 0,
            max: 100000,
            numberFormat: 'currency'
          }
        }
      ],
      addButtonText: 'Zubehör hinzufügen',
      emptyText: 'Kein Zubehör erfasst',
      relatedFields: ['neuwert']
    }
  },

  // === PRODUKT-SPARTEN-TABELLEN ===
  
  // Spartentabelle (4 Hauptsparten)
  {
    key: 'produktSparten',
    label: 'Produktsparten',
    type: 'table',
    defaultValue: [],
    synonyms: ['produktsparten', 'sparten', 'versicherungssparten'],
    table: {
      columns: [
        {
          key: 'beschreibung',
          label: 'Sparte',
          type: 'text',
          width: '200px'
        },
        {
          key: 'check',
          label: 'Aktiv',
          type: 'boolean',
          width: '80px'
        },
        {
          key: 'zustand',
          label: 'Zustand',
          type: 'dropdown',
          width: '120px',
          dropdown: {
            domainId: 'KraftBoGruppeMoeglZustand'
          }
        },
        {
          key: 'zustandsdetail',
          label: 'Zustandsdetail',
          type: 'dropdown',
          width: '140px',
           dropdown: {
            domainId: 'KraftBoGruppeMoeglStornogruendeSparte'
          }
        },
        {
          key: 'beitragNetto',
          label: 'JVB',
          type: 'number',
          width: '100px',
          validation: {
            numberFormat: 'currency'
          }
        },
        {
          key: 'beitragBrutto',
          label: 'JZB',
          type: 'number',
          width: '100px',
          validation: {
            numberFormat: 'currency'
          }
        }
      ],
      emptyText: 'Keine Sparten verfügbar'
    }
  },

  // Bausteintabelle KH (Kfz-Haftpflicht)
  {
    key: 'produktBausteine_KH',
    label: 'Bausteine Kfz-Haftpflicht',
    type: 'table',
    defaultValue: [],
    synonyms: ['bausteine haftpflicht', 'kh bausteine'],
    table: {
      columns: [
        {
          key: 'beschreibung',
          label: 'Baustein',
          type: 'text',
          width: '300px'
        },
        {
          key: 'check',
          label: 'Aktiv',
          type: 'boolean',
          width: '80px'
        },
        {
          key: 'betrag',
          label: 'Betrag',
          type: 'number',
          width: '120px',
          validation: {
            numberFormat: 'currency'
          }
        },
        {
          key: 'betragsLabel',
          label: 'Betrags-Art',
          type: 'text',
          width: '120px'
        },
        {
          key: 'knotenId',
          label: 'Knoten-ID',
          type: 'text',
          width: '100px'
        }
      ],
      emptyText: 'Keine Bausteine verfügbar'
    }
  },

  // Bausteintabelle KK (Kfz-Vollkasko)
  {
    key: 'produktBausteine_KK',
    label: 'Bausteine Kfz-Vollkasko',
    type: 'table',
    defaultValue: [],
    synonyms: ['bausteine vollkasko', 'kk bausteine'],
    table: {
      columns: [
        {
          key: 'beschreibung',
          label: 'Baustein',
          type: 'text',
          width: '300px'
        },
        {
          key: 'check',
          label: 'Aktiv',
          type: 'boolean',
          width: '80px'
        },
        {
          key: 'betrag',
          label: 'Betrag',
          type: 'number',
          width: '120px',
          validation: {
            numberFormat: 'currency'
          }
        },
        {
          key: 'betragsLabel',
          label: 'Betrags-Art',
          type: 'text',
          width: '120px'
        },
        {
          key: 'knotenId',
          label: 'Knoten-ID',
          type: 'text',
          width: '100px'
        }
      ],
      emptyText: 'Keine Bausteine verfügbar'
    }
  },

  // Bausteintabelle EK (Kfz-Teilkasko)  
  {
    key: 'produktBausteine_EK',
    label: 'Bausteine Kfz-Teilkasko',
    type: 'table',
    defaultValue: [],
    synonyms: ['bausteine teilkasko', 'ek bausteine'],
    table: {
      columns: [
        {
          key: 'beschreibung',
          label: 'Baustein',
          type: 'text',
          width: '300px'
        },
        {
          key: 'check',
          label: 'Aktiv',
          type: 'boolean',
          width: '80px'
        },
        {
          key: 'betrag',
          label: 'Betrag',
          type: 'number',
          width: '120px',
          validation: {
            numberFormat: 'currency'
          }
        },
        {
          key: 'betragsLabel',
          label: 'Betrags-Art',
          type: 'text',
          width: '120px'
        },
        {
          key: 'knotenId',
          label: 'Knoten-ID',
          type: 'text',
          width: '100px'
        }
      ],
      emptyText: 'Keine Bausteine verfügbar'
    }
  },

  // Bausteintabelle KU (weitere Sparte)
  {
    key: 'produktBausteine_KU',
    label: 'Bausteine Unfall Sparte',
    type: 'table',
    defaultValue: [],
    synonyms: ['bausteine Unfall', 'ku bausteine'],
    table: {
      columns: [
        {
          key: 'beschreibung',
          label: 'Baustein',
          type: 'text',
          width: '300px'
        },
        {
          key: 'check',
          label: 'Aktiv',
          type: 'boolean',
          width: '80px'
        },
        {
          key: 'betrag',
          label: 'Betrag',
          type: 'number',
          width: '120px',
          validation: {
            numberFormat: 'currency'
          }
        },
        {
          key: 'betragsLabel',
          label: 'Betrags-Art',
          type: 'text',
          width: '120px'
        },
        {
          key: 'knotenId',
          label: 'Knoten-ID',
          type: 'text',
          width: '100px'
        }
      ],
      emptyText: 'Keine Bausteine verfügbar'
    }
  },

  // === FAHRZEUG-DETAIL FELDER ===
  
  // Fahrleistung
  {
    key: 'KraftDmKfzVorfahrl',
    label: 'Aktuelle Fahrleistung (km)',
    type: 'number',
    defaultValue: 0,
    synonyms: [
      'fahrleistung', 'jahresfahrleistung', 'km pro jahr', 'kilometer pro jahr',
      'jährliche fahrleistung', 'voraussichtliche fahrleistung', 'geschätzte fahrleistung'
    ],
    validation: {
      min: 0,
      max: 200000,
      numberFormat: 'integer'
    },
    ui: {
      placeholder: 'Fahrleistung in km eingeben...',
      group: 'fahrzeugDetail'
    },
    ai: {
      priority: 'medium',
      context: 'Jährliche Fahrleistung des Fahrzeugs in Kilometern'
    }
  },

  // Manuelle Typklasse (als einzeilige Tabelle)
  {
    key: 'manuelleTypklasse',
    label: 'Manuelle Typklasse',
    type: 'single-line-table',
    defaultValue: [{
      id: '1',
      grund: '',
      haftpflicht: 0,
      vollkasko: 0,
      teilkasko: 0
    }],
    synonyms: [
      'manuelle typklasse', 'typklasse manuell', 'manuelle einstufung',
      'grund für typklasse', 'typklasse grund', 'abweichende typklasse',
      'typklasse', 'typklassen', 'kh', 'tk', 'vk', 'teilkasko', 'vollkasko', 'haftpflicht',
      'man hat mir gesagt', 'typklasse ist', 'klassiert', 'einstufung'
    ],
    ai: {
      priority: 'low',
      context: 'Manuelle Typklasse-Einstufung mit Grund und drei Typklassen'
    },
    table: {
      columns: [
        {
          key: 'grund',
          label: 'Grund der Typklasse',
          type: 'dropdown',
          width: '250px',
          ui: {
            placeholder: 'Grund auswählen...'
          },
          dropdown: {
            domainId: 'KraftBoGruppeMoeglGrundManTypklasse'
          }
        },
        {
          key: 'haftpflicht',
          label: 'Haftpflicht',
          type: 'number',
          width: '120px',
          validation: {
            min: 0,
            max: 50,
            numberFormat: 'integer'
          }
        },
        {
          key: 'vollkasko',
          label: 'Vollkasko',
          type: 'number',
          width: '120px',
          validation: {
            min: 0,
            max: 50,
            numberFormat: 'integer'
          }
        },
        {
          key: 'teilkasko',
          label: 'Teilkasko',
          type: 'number',
          width: '120px',
          validation: {
            min: 0,
            max: 50,
            numberFormat: 'integer'
          }
        }
      ],
      emptyText: 'Keine manuelle Typklasse definiert'
    },
    ui: {
      group: 'fahrzeugDetail'
    }
  }
];

// Hilfsfunktionen für die Konfiguration
export const getFieldByKey = (key: string): FieldDefinition | undefined => {
  return FIELD_DEFINITIONS.find(field => field.key === key);
};

export const getFieldsByType = (type: FieldType): FieldDefinition[] => {
  return FIELD_DEFINITIONS.filter(field => field.type === type);
};

export const getFieldsByGroup = (group: string): FieldDefinition[] => {
  return FIELD_DEFINITIONS.filter(field => field.ui?.group === group);
};

// Hilfsfunktion: Dynamisch Baustein-Felder für verfügbare Sparten generieren
export const generateBausteinFieldsForSparten = (sparten: string[]): FieldDefinition[] => {
  const bausteinFields: FieldDefinition[] = [];
  
  sparten.forEach(sparte => {
    const sparteName = getSparteName(sparte);
    bausteinFields.push({
      key: `produktBausteine_${sparte}`,
      label: `Bausteine ${sparteName}`,
      type: 'table',
      defaultValue: [],
      synonyms: [`bausteine ${sparteName.toLowerCase()}`, `${sparte.toLowerCase()} bausteine`],
      table: {
        columns: [
          {
            key: 'beschreibung',
            label: 'Baustein',
            type: 'text',
            width: '300px'
          },
          {
            key: 'check',
            label: 'Aktiv',
            type: 'boolean',
            width: '80px'
          },
          {
            key: 'betrag',
            label: 'Betrag',
            type: 'number',
            width: '120px',
            validation: {
              numberFormat: 'currency'
            }
          },
          {
            key: 'betragsLabel',
            label: 'Betrags-Art',
            type: 'text',
            width: '120px'
          },
          {
            key: 'knotenId',
            label: 'Knoten-ID',
            type: 'text',
            width: '100px'
          }
        ],
        emptyText: 'Keine Bausteine verfügbar'
      }
    });
  });
  
  return bausteinFields;
};

// Hilfsfunktion: Sparten-Namen mapping
const getSparteName = (sparte: string): string => {
  switch (sparte) {
    case 'KH': return 'Kfz-Haftpflicht';
    case 'KK': return 'Kfz-Vollkasko';
    case 'EK': return 'Kfz-Teilkasko';
    case 'KU': return 'weitere Sparte';
    default: return sparte;
  }
};

export const getTableFields = (): FieldDefinition[] => {
  return FIELD_DEFINITIONS.filter(field => field.type === 'table' || field.type === 'single-line-table');
};

export const getDropdownFields = (): FieldDefinition[] => {
  return FIELD_DEFINITIONS.filter(field => field.type === 'dropdown');
};

export const getAllSynonyms = (): Record<string, string[]> => {
  return FIELD_DEFINITIONS.reduce((acc, field) => {
    acc[field.key] = field.synonyms;
    return acc;
  }, {} as Record<string, string[]>);
};

export const getValidationRules = (): Record<string, string[]> => {
  return FIELD_DEFINITIONS.reduce((acc, field) => {
    if (field.ai?.correctionRules) {
      acc[field.key] = field.ai.correctionRules;
    }
    return acc;
  }, {} as Record<string, string[]>);
};

// Hilfsfunktionen für Tabellen
export const createEmptyTableRow = (tableField: FieldDefinition): TableRow => {
  if (!tableField.table) throw new Error('Field is not a table');
  
  const row: TableRow = {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 11)
  };
  
  tableField.table.columns.forEach(column => {
    switch (column.type) {
      case 'date':
        row[column.key] = '0001-01-01';
        break;
      case 'number':
        row[column.key] = 0;
        break;
      case 'boolean':
        row[column.key] = false;
        break;
      case 'tristate':
        row[column.key] = ' ';
        break;
      case 'text':
      case 'select':
      case 'dropdown':
      default:
        row[column.key] = '';
        break;
    }
  });
  
  return row;
};

export const addTableRow = (tableKey: string, currentRows: TableRow[]): TableRow[] => {
  const field = getFieldByKey(tableKey);
  if (!field || (field.type !== 'table' && field.type !== 'single-line-table')) return currentRows;
  
  const newRow = createEmptyTableRow(field);
  return [...currentRows, newRow];
};

export const removeTableRow = (currentRows: TableRow[], rowId: string): TableRow[] => {
  return currentRows.filter(row => row.id !== rowId);
};

export const updateTableRow = (currentRows: TableRow[], rowId: string, updates: Partial<TableRow>): TableRow[] => {
  return currentRows.map(row => 
    row.id === rowId ? { ...row, ...updates } : row
  );
};

// Typen für die API-Responses (dynamisch generiert)
export type ExtractedFieldValue = {
  value: string | number | boolean | TableRow[] | 'J' | 'N' | ' ' | null;
  confidence: number;
  source: string;
  corrected?: boolean;
  originalValue?: string | number | boolean | TableRow[] | 'J' | 'N' | ' ' | null;
};

export type ExtractedData = {
  [K in typeof FIELD_DEFINITIONS[number]['key']]: ExtractedFieldValue;
};

export interface SpartenAction {
  active: boolean;
  reason: string;
}

export interface BausteinAction {
  sparte: string;
  knotenId: string;
  beschreibung: string;
  active: boolean;
  betrag?: number;
  reason: string;
}

export interface ClaudeResponse {
  extractedData: ExtractedData;
  spartenActions?: {
    KH: SpartenAction;
    KK: SpartenAction;
    EK: SpartenAction;
    KU: SpartenAction;
  };
  bausteinActions?: BausteinAction[];
  overallConfidence: number;
  validationErrors: string[];
  suggestions: string[];
  recognizedPhrases: string[];
  explanation: string;
  appliedCorrections: string[];
  newTableRows?: {
    [tableKey: string]: TableRow[];
  };
}

// Stable caches to prevent infinite re-renders
const _defaultValuesCache: Record<string, any> = {};
const _echteEingabeCache: Record<string, any> = {};

// Generiere Standardwerte für den State
export const generateDefaultValues = (): Record<string, any> => {
  return FIELD_DEFINITIONS.reduce((acc, field) => {
    // Use cached value if available to maintain object identity
    if (_defaultValuesCache[field.key] === undefined) {
      // Deep clone arrays and objects to prevent mutation
      if (Array.isArray(field.defaultValue)) {
        _defaultValuesCache[field.key] = field.defaultValue.map(item => 
          typeof item === 'object' && item !== null ? { ...item } : item
        );
      } else if (typeof field.defaultValue === 'object' && field.defaultValue !== null) {
        _defaultValuesCache[field.key] = { ...(field.defaultValue as object) };
      } else {
        _defaultValuesCache[field.key] = field.defaultValue;
      }
    }
    acc[field.key] = _defaultValuesCache[field.key];
    return acc;
  }, {} as Record<string, any>);
};

// Generiere echte Eingabe Werte für KB-TH
export const generateEchteEingabeValues = (): Record<string, any> => {
  return FIELD_DEFINITIONS.reduce((acc, field) => {
    const value = field.echteEingabe || field.defaultValue;
    
    // Use cached value if available to maintain object identity
    if (_echteEingabeCache[field.key] === undefined || field.echteEingabe !== undefined) {
      // Deep clone arrays and objects to prevent mutation
      if (Array.isArray(value)) {
        _echteEingabeCache[field.key] = value.map(item => 
          typeof item === 'object' && item !== null ? { ...item } : item
        );
      } else if (typeof value === 'object' && value !== null) {
        _echteEingabeCache[field.key] = { ...(value as object) };
      } else {
        _echteEingabeCache[field.key] = value;
      }
    }
    acc[field.key] = _echteEingabeCache[field.key];
    return acc;
  }, {} as Record<string, any>);
};

// Aktualisiere echte Eingabe für ein Feld
export const updateEchteEingabe = (fieldKey: string, value: any): void => {
  const fieldIndex = FIELD_DEFINITIONS.findIndex(field => field.key === fieldKey);
  if (fieldIndex !== -1) {
    FIELD_DEFINITIONS[fieldIndex].echteEingabe = value;
    // Invalidate cache for this field so it gets updated
    delete _echteEingabeCache[fieldKey];
  }
};

// Markiere ein Feld als echte Eingabe (KI oder User)
export const markAsEchteEingabe = (fieldKey: string, value: any, isFromAI: boolean = false): void => {
  const field = getFieldByKey(fieldKey);
  if (!field) return;
  
  // 1. Field-Level echteEingabe setzen
  updateEchteEingabe(fieldKey, value);
  
  // 2. Für Tabellen: Auch Row-Level echteEingabe markieren
  if ((field.type === 'table' || field.type === 'single-line-table') && Array.isArray(value)) {
    const updatedValue = value.map(row => ({
      ...row,
      echteEingabe: true // Markiere als echte Eingabe (von KI oder User)
    }));
    
    // Aktualisiere nochmal mit dem erweiterten Wert
    updateEchteEingabe(fieldKey, updatedValue);
  }
  
  console.log(`${isFromAI ? '🤖 KI' : '👤 User'} marked ${fieldKey} as echteEingabe:`, value);
};

// Generiere Field Configs für die Chat-Komponente
export const generateFieldConfigs = (
  values: Record<string, any>,
  setters: Record<string, (value: any) => void>,
  onFieldDefinitionsChange?: (updates: Record<string, any>) => void
) => {
  return FIELD_DEFINITIONS.map(field => ({
    fieldKey: field.key,
    label: field.label,
    synonyms: field.synonyms,
    currentValue: values[field.key],
    onChange: setters[field.key],
    type: field.type,
    table: field.table,
    dropdown: field.dropdown,
    onFieldDefinitionsChange: field.key === 'produktSparten' ? onFieldDefinitionsChange : undefined
  }));
};