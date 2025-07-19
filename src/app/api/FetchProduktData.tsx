
// Mock Produkt Service Data (simuliert API-Call)
/*
const mockProduktData: Produktlist[] =[{
        "stornogrund": "",
        "check": true,
        "bausteine": [{
                "betrag": "100.000.000",
                "check": false,
                "verhalten": "W",
                "knotenId": "KBH00002",
                "subBausteine": [],
                "parentKnotenId": "KH",
                "betragsLabel": "Deckungssumme",
                "beschreibung": "Versicherungssumme"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00180",
                "subBausteine": [],
                "parentKnotenId": "KH",
                "beschreibung": "Sondereinstufung weiteres Fahrzeug"
            }, {
                "betrag": "100.000.000",
                "check": false,
                "verhalten": "W",
                "knotenId": "KBH00003",
                "subBausteine": [],
                "parentKnotenId": "KH",
                "betragsLabel": "Deckungssumme",
                "beschreibung": "Gesetzliche Mindestversicherungssumme"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBH00119",
                "subBausteine": [],
                "parentKnotenId": "KH",
                "beschreibung": "Premium Schutzbrief"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00061",
                "subBausteine": [],
                "parentKnotenId": "KH",
                "beschreibung": "SFR-Korrektur abw. SF-Klasse"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00060",
                "subBausteine": [],
                "parentKnotenId": "KH",
                "beschreibung": "SFR-Korrektur Überschneidung"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00088",
                "subBausteine": [],
                "parentKnotenId": "KH",
                "beschreibung": "Fahrerschutz"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBH00172",
                "subBausteine": [],
                "parentKnotenId": "KH",
                "beschreibung": "Schutzbrief Mobilität"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBH00056",
                "subBausteine": [],
                "parentKnotenId": "KH",
                "beschreibung": "Flughafenvorfeld"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KH",
                "beschreibung": "Mallorca Police"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00087",
                "subBausteine": [],
                "parentKnotenId": "KH",
                "beschreibung": "Komfort"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00019",
                "subBausteine": [],
                "parentKnotenId": "KH",
                "beschreibung": "Einstuf. SF-Klasse abweichend vom tatsächlichen Verlauf"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00001",
                "subBausteine": [],
                "parentKnotenId": "KH",
                "beschreibung": "Rabattschutz"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KH",
                "beschreibung": "Allgemeine Versicherungsbedingungen KFZ"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KH",
                "beschreibung": "Umweltschadenschutz"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBH00110",
                "subBausteine": [],
                "parentKnotenId": "KH",
                "beschreibung": "Übernahme Sondereinstufung Vorversicherer"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00089",
                "subBausteine": [],
                "parentKnotenId": "KH",
                "beschreibung": "BeitragsSchutz"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00181",
                "subBausteine": [],
                "parentKnotenId": "KH",
                "beschreibung": "Sondereinstufung weiteres Fahrzeug mit Mindestalter"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00202",
                "subBausteine": [],
                "parentKnotenId": "KH",
                "beschreibung": "Komfort Automotive"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBH00112",
                "subBausteine": [],
                "parentKnotenId": "KH",
                "beschreibung": "Sondereinstufung SF Plus 1"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBH00008",
                "subBausteine": [],
                "parentKnotenId": "KH",
                "beschreibung": "Überführungs- Probefahrtkennzeichen"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00165",
                "subBausteine": [],
                "parentKnotenId": "KH",
                "beschreibung": "Oldtimerversicherung"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBH00006",
                "subBausteine": [],
                "parentKnotenId": "KH",
                "beschreibung": "Auslandsschadenschutz"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00098",
                "subBausteine": [],
                "parentKnotenId": "KH",
                "beschreibung": "Nettotarif"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBH00113",
                "subBausteine": [],
                "parentKnotenId": "KH",
                "beschreibung": "SF-Übertragung"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBH00111",
                "subBausteine": [],
                "parentKnotenId": "KH",
                "beschreibung": "BonusDrive"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00095",
                "subBausteine": [],
                "parentKnotenId": "KH",
                "beschreibung": "Führerscheineinstufung"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00026",
                "subBausteine": [],
                "parentKnotenId": "KH",
                "beschreibung": "Vereinbarung wegen Ausnahmegenehmigung § 70 StVZO"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBH00160",
                "subBausteine": [],
                "parentKnotenId": "KH",
                "beschreibung": "Mitarbeitergeschäft Kooperationspartner"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00185",
                "subBausteine": [],
                "parentKnotenId": "KH",
                "beschreibung": "Vorbehalt Berufsgruppe"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "KBH00001",
                "subBausteine": [],
                "parentKnotenId": "KH",
                "beschreibung": "Beitragsbaustein KH"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00086",
                "subBausteine": [],
                "parentKnotenId": "KH",
                "beschreibung": "Begleitetes Fahren ab 17"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00017",
                "subBausteine": [],
                "parentKnotenId": "KH",
                "beschreibung": "Angaben Vor-VR aus Antrag"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KH",
                "beschreibung": "Versichertes Objekt"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBH00159",
                "subBausteine": [],
                "parentKnotenId": "KH",
                "beschreibung": "Mitarbeitergeschäft Allianz Gruppe"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00195",
                "subBausteine": [{
                        "betrag": "10.000",
                        "check": true,
                        "verhalten": "P",
                        "knotenId": "        ",
                        "subBausteine": [],
                        "parentKnotenId": "KH",
                        "betragsLabel": "Summe",
                        "beschreibung": "Eigenschadenschutz"
                    }, {
                        "betrag": "10.000",
                        "check": true,
                        "verhalten": "P",
                        "knotenId": "        ",
                        "subBausteine": [],
                        "parentKnotenId": "KH",
                        "betragsLabel": "Summe",
                        "beschreibung": "Eigenschadenschutz"
                    }, {
                        "betrag": "10.000",
                        "check": true,
                        "verhalten": "P",
                        "knotenId": "        ",
                        "subBausteine": [],
                        "parentKnotenId": "KH",
                        "betragsLabel": "Summe",
                        "beschreibung": "Eigenschadenschutz"
                    }, {
                        "betrag": "10.000",
                        "check": true,
                        "verhalten": "P",
                        "knotenId": "        ",
                        "subBausteine": [],
                        "parentKnotenId": "KH",
                        "betragsLabel": "Summe",
                        "beschreibung": "Eigenschadenschutz"
                    }
                ],
                "parentKnotenId": "KH",
                "beschreibung": "Komfort Nicht-PKW"
            }
        ],
        "beitragNetto": "0.00",
        "verhalten": "W",
        "beschreibung": "Kfz-Haftpflicht",
        "beitragBrutto": "0.00",
        "zustand": "A",
        "sparte": "KH"
    }, {
        "stornogrund": "",
        "check": false,
        "bausteine": [{
                "check": false,
                "verhalten": "W",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Neupreisentschädigung"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00085",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Werkstattbonus"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Unfall"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Neupreisentschädigung"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Differenzkasko GAP"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00181",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Sondereinstufung weiteres Fahrzeug mit Mindestalter"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Tierbiss mit Folgeschäden mit unbegrenzter Deckung"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00195",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Komfort Nicht-PKW"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Kurzschluss mit Folgeschaden mit unbegrenzter Deckung"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00060",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "SFR-Korrektur Überschneidung"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00180",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Sondereinstufung weiteres Fahrzeug"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBV00037",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Camperinhaltsschutz"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Kaufpreisentschädigung"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00001",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Rabattschutz"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00087",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Komfort"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00019",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Einstuf. SF-Klasse abweichend vom tatsächlichen Verlauf"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Carsharing / Mietwagen SB-Schutz"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00017",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Angaben Vor-VR aus Antrag"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Feuer"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00061",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "SFR-Korrektur abw. SF-Klasse"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00092",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Werterhaltgarantie"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Carsharing / Mietwagen SB-Schutz"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Glasschaden"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Allgefahrendeckung Elektro-/Hybridfahrzeug"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00202",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Komfort Automotive"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00082",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Oldtimer Wertgutachten"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Reparatur in Partnerwerkstatt"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Zusammenstoß mit Tieren"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Allgemeine Versicherungsbedingungen KFZ"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Kaufpreisentschädigung"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Allgefahrendeckung Elektro-/Hybridfahrzeug"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Differenzkasko GAP"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBV00016",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Allgefahrendeckung"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBH00112",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Sondereinstufung SF Plus 1"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Neupreisentschädigung"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00098",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Nettotarif"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Differenzkasko GAP"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00165",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Oldtimerversicherung"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Vorsorgeversicherung"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Entwendung"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBH00113",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "SF-Übertragung"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Allgefahrendeckung Elektro-/Hybridfahrzeug"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Vandalismus"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Kaufpreisentschädigung"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBH00110",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Übernahme Sondereinstufung Vorversicherer"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Zusatzdeckung Elektro-/Hybridfahrzeug"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Vandalismusschäden"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00089",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "BeitragsSchutz"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Kurzschluss mit Folgeschaden mit unbegrenzter Deckung"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Versichertes Objekt"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Zusatzdeckung Elektro-/Hybridfahrzeug"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Transport auf Schiffen / Fähren"
            }, {
                "betrag": "500",
                "check": true,
                "verhalten": "P",
                "knotenId": "KBV00002",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "betragsLabel": "Selbstbeteiligung",
                "beschreibung": "Selbstbeteiligung Vollkasko"
            }, {
                "betrag": "300",
                "check": true,
                "verhalten": "P",
                "knotenId": "KBM00002",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "betragsLabel": "Selbstbeteiligung",
                "beschreibung": "Selbstbeteiligung Teilkasko"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "KBV00001",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Beitragsbaustein VK"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Kurzschluss mit Folgeschaden mit unbegrenzter Deckung"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Transportschäden"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Zusatzdeckung Elektro-/Hybridfahrzeug"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00022",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Vereinbarung über Entschädigungsgrenze in der FZ.-Versicherung"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Naturgewalten Elementarschäden"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Bekleidungsschutz"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00095",
                "subBausteine": [],
                "parentKnotenId": "KK",
                "beschreibung": "Führerscheineinstufung"
            }
        ],
        "beitragNetto": "0.00",
        "verhalten": "W",
        "beschreibung": "Kfz-Vollkasko",
        "beitragBrutto": "0.00",
        "zustand": "A",
        "sparte": "KK"
    }, {
        "stornogrund": "",
        "check": false,
        "bausteine": [{
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00089",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "BeitragsSchutz"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBT00003",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Garagenversicherung"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Carsharing / Mietwagen SB-Schutz"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00087",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Komfort"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Reparatur in Partnerwerkstatt"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Neupreisentschädigung"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00092",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Werterhaltgarantie"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00085",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Werkstattbonus"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Feuer"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Zusatzdeckung Elektro-/Hybridfahrzeug"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00165",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Oldtimerversicherung"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Naturgewalten Elementarschäden"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Bekleidungsschutz"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Kaufpreisentschädigung"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Neupreisentschädigung"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Neupreisentschädigung"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00195",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Komfort Nicht-PKW"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00202",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Komfort Automotive"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Differenzkasko GAP"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "KBT00001",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Beitragsbaustein TK"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Differenzkasko GAP"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Tierbiss mit Folgeschäden mit unbegrenzter Deckung"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Vandalismusschäden"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Versichertes Objekt"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00082",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Oldtimer Wertgutachten"
            }, {
                "betrag": "300",
                "check": true,
                "verhalten": "P",
                "knotenId": "KBM00002",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "betragsLabel": "Selbstbeteiligung",
                "beschreibung": "Selbstbeteiligung Teilkasko"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Transportschäden"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBV00037",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Camperinhaltsschutz"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00098",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Nettotarif"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Allgemeine Versicherungsbedingungen KFZ"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Entwendung"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Zusammenstoß mit Tieren"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Kurzschluss mit Folgeschaden mit unbegrenzter Deckung"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Kurzschluss mit Folgeschaden mit unbegrenzter Deckung"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Carsharing / Mietwagen SB-Schutz"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Kaufpreisentschädigung"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Zusatzdeckung Elektro-/Hybridfahrzeug"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBM00022",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Vereinbarung über Entschädigungsgrenze in der FZ.-Versicherung"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Transport auf Schiffen / Fähren"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "KBT00005",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Dauercamping"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Differenzkasko GAP"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Vorsorgeversicherung"
            }, {
                "check": false,
                "verhalten": "W",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Kaufpreisentschädigung"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Kurzschluss mit Folgeschaden mit unbegrenzter Deckung"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Glasschaden"
            }, {
                "check": true,
                "verhalten": "P",
                "knotenId": "        ",
                "subBausteine": [],
                "parentKnotenId": "EK",
                "beschreibung": "Zusatzdeckung Elektro-/Hybridfahrzeug"
            }
        ],
        "beitragNetto": "0.00",
        "verhalten": "W",
        "beschreibung": "Kfz-Teilkasko",
        "beitragBrutto": "0.00",
        "zustand": "A",
        "sparte": "EK"
    }
]
;

// Simuliert API-Call zum Produkt Service
export const fetchProduktData = async (ProduktId: string): Promise<DropdownOption[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const datalist = mockProduktData.find(d => d.id === ProduktId);
  return datalist?.options || [];
};
*/
