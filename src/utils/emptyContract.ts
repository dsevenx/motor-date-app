// Utility-Funktion für leere Contract-Struktur
import { Contract } from '@/types/contractTypes';

/**
 * Erstellt einen komplett leeren Contract mit allen erforderlichen Feldern
 * Verwendet als Fallback wenn kein vertrkey angegeben oder File nicht gefunden
 */
export const createEmptyContract = (): Contract => {
  return {
    kraftversion: "",
    messages: [
      {
        msgCode: "404",
        msgType: "WARNUNG",
        text: "Kein Contract gefunden - leere Struktur geladen"
      }
    ],
    contract: {
      classId: "",
      extEntity: {
        classId: "",
        questions: [],
        contractLayers: []
      },
      kContract: {
        erstzuldatum: "",
        gruppeDe1KraftschichtTypklasseMan: {
          typklasseKH: 0,
          typklasseTK: 0,
          typklasseVK: 0,
          grund: ""
        },
        gruppeZubehoerteile: [],
        vertragsstandVertrag: {
          beginn: "",
          kontostand: "",
          angebotsname: "",
          inkassodaten: "",
          inkassoart: "",
          zahlweise: "",
          mahnstatus: "",
          produkt: "",
          stand: "",
          storno: "",
          ablauf: "",
          einzug: ""
        },
        KVUEVertragsHierarchie: {
          name: "Kein Contract geladen",
          id: "empty",
          type: "company",
          level: 0,
          children: [],
          description: "Leere Struktur - bitte gültigen vertrkey angeben",
          aktivesObjekt: false,
          expanded: false
        },
        vertragsstandSummen: {
          summeBgz: "",
          summeJzb: ""
        },
        vertragsstandSparten: [
          {
            zustand: "",
            spartenart: "",
            stornogrund: "",
            sparte: "",
            jzb: "",
            bgz: "",
            rst: "",
            sfr: "",
            tatSfr: "",
            bs: "",
            rST: "",
            bGZ: "",
            jZB: ""
          }
        ],
        vertragsstandHinweis: {
          hinweisGUI: "",
          hinweisKomplett: ""
        },
        vertragsstandFahrzeug: {
          vorvertragText: "",
          fin: "",
          folgevertrag: {
            vertrKey: "",
            pollfnrVorhanden: false,
            storniert: false,
            gefunden: false,
            vollkaskoLebt: false,
            begDat: "",
            sichtbar: false,
            ablDat: ""
          },
          nachlassKh: "",
          sonderfahrzeug: "",
          nachlassKu: "",
          vorvertrag: {
            vertrKey: "",
            pollfnrVorhanden: false,
            storniert: false,
            gefunden: false,
            vollkaskoLebt: false,
            begDat: "",
            sichtbar: false,
            ablDat: ""
          },
          fahrerkreis: "",
          fzgArtEinsatz: "",
          beruflUmfeld: "",
          nachlass: "",
          nachlassKf: "",
          kfzKennzeichen: "",
          fahrleistung: "",
          tarifgrWirschaftszw: "",
          folgevertragText: "",
          hsnTsn: ""
        },
        gruppeKmstand: [],
        allgAblaufdatum: "",
        deAllgInfos: {
          email: "",
          bgvgVnr: "",
          nameVn: "Kein Contract geladen",
          geburtsdatum: "",
          strasseVn: "",
          telGesch: "",
          telPrivat: "",
          verantwortlich: "",
          telMobil: "",
          internet: "",
          vertragsinfo: "Bitte gültigen vertrkey-Parameter angeben",
          vertrName: "",
          vertrAnschrift: "",
          vertrPlzOrt: "",
          vertrTelFax: "",
          vertrEMail: "",
          pollfnrMitDatum: "",
          boMeineAllianzLabel: "",
          boMeineAllianzText: "",
          dienstleistungsgebiet: "",
          ortVn: ""
        },
        AllgBeginn: "",
        vertrkey: "",
        anmeldedatum: "",
        vertragZahlweise: "",
        "de1KraftVertragZusVorfahrl(": 0,
        hsnanum: "",
        tsnanum: ""
      }
    }
  };
};