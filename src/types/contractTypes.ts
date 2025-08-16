// contractTypes.ts - TypeScript Typen für Contract und Tree

export interface TreeNode {
  id: string;
  name: string;
  description: string;
  type: 'company' | 'group' | 'contract' | 'general' | 'fuhrpark' | 'TM' | 'EV' | 'OK' | 'RA' | 'FE';
  aktivesObjekt?: boolean; // Für fettgeschriebene Darstellung
  children?: TreeNode[];
  expanded?: boolean;
  level?: number;
  parentId?: string;
  contractNumber?: string;
  address?: string;
}

export interface ContractTree {
  rootNodes: TreeNode[];
  activeNodeId?: string;
}

export interface Ordnervereinbarung {
  id: string;
  text: string;
  category: string;
}

export interface DeAllgInfos {
  email: string;
  bgvgVnr: string;
  nameVn: string;
  geburtsdatum: string;
  strasseVn: string;
  telGesch: string;
  telPrivat: string;
  verantwortlich: string;
  telMobil: string;
  internet: string;
  vertragsinfo: string;
  vertrName: string;
  vertrAnschrift: string;
  vertrPlzOrt: string;
  vertrTelFax: string;
  vertrEMail: string;
  pollfnrMitDatum: string;
  boMeineAllianzLabel: string;
  boMeineAllianzText: string;
  dienstleistungsgebiet: string;
  ortVn: string;
}

export interface VertragsstandVertrag {
  beginn: string;
  kontostand: string;
  angebotsname: string;
  inkassodaten: string;
  inkassoart: string;
  zahlweise: string;
  mahnstatus: string;
  produkt: string;
  stand: string;
  storno: string;
  ablauf: string;
  einzug: string;
}

export interface KVUEVertragsHierarchie {
  name: string;
  id: string;
  type: 'company' | 'group' | 'contract' | 'general' | 'fuhrpark' | 'TM' | 'EV' | 'OK' | 'RA' | 'FE';
  level: number;
  children: KVUEVertragsHierarchie[];
  description: string;
  aktivesObjekt: boolean;
  expanded: boolean;
}

export interface VertragsstandSummen {
  summeBgz: string;
  summeJzb: string;
}

export interface VertragsstandSparte {
  zustand: string;
  spartenart: string;
  stornogrund: string;
  sparte: string;
  jzb: string;
  bgz: string;
  rst: string;
  sfr: string;
  tatSfr: string;
  bs: string;
  rST: string;
  bGZ: string;
  jZB: string;
}

export interface VertragsstandHinweis {
  hinweisGUI: string;
  hinweisKomplett: string;
}

export interface FolgeVorvertrag {
  vertrKey: string;
  pollfnrVorhanden: boolean;
  storniert: boolean;
  gefunden: boolean;
  vollkaskoLebt: boolean;
  begDat: string;
  sichtbar: boolean;
  ablDat: string;
}

export interface VertragsstandFahrzeug {
  vorvertragText: string;
  fin: string;
  folgevertrag: FolgeVorvertrag;
  nachlassKh: string;
  sonderfahrzeug: string;
  nachlassKu: string;
  vorvertrag: FolgeVorvertrag;
  fahrerkreis: string;
  fzgArtEinsatz: string;
  beruflUmfeld: string;
  nachlass: string;
  nachlassKf: string;
  kfzKennzeichen: string;
  fahrleistung: string;
  tarifgrWirschaftszw: string;
  folgevertragText: string;
  hsnTsn: string;
}

export interface GruppeKmstand {
  datum: string;
  kmStand: number;
  grund: string;
  KmStand: number;
}

export interface GruppeZubehoerteil {
  zubehoerteil: string;
  zuschlagZubehoerteil: string;
  herstellerZubehoerteil: string;
  wertZubehoerteil: string;
}

export interface GruppeDe1KraftschichtTypklasseMan {
  typklasseKH: number;
  typklasseTK: number;
  typklasseVK: number;
  grund: string;
}

export interface KContract {
  erstzuldatum: string;
  gruppeDe1KraftschichtTypklasseMan: GruppeDe1KraftschichtTypklasseMan;
  gruppeZubehoerteile: GruppeZubehoerteil[];
  vertragsstandVertrag: VertragsstandVertrag;
  KVUEVertragsHierarchie: KVUEVertragsHierarchie;
  vertragsstandSummen: VertragsstandSummen;
  vertragsstandSparten: VertragsstandSparte[];
  vertragsstandHinweis: VertragsstandHinweis;
  vertragsstandFahrzeug: VertragsstandFahrzeug;
  gruppeKmstand: GruppeKmstand[];
  allgAblaufdatum: string;
  deAllgInfos: DeAllgInfos;
  AllgBeginn: string;
  vertrkey: string;
  anmeldedatum: string;
  vertragZahlweise: string;
  "de1KraftVertragZusVorfahrl(": number;
  hsnanum: string;
  tsnanum: string;
}

export interface ContractExtEntity {
  classId: string;
  questions: any[];
  contractLayers: any[];
}

export interface ContractRoot {
  classId: string;
  extEntity: ContractExtEntity;
  kContract: KContract;
}

export interface Contract {
  kraftversion: string;
  messages: Array<{
    msgCode: string;
    msgType: string;
    text: string;
  }>;
  contract: ContractRoot;
}

export interface ContextMenuAction {
  type: 'add' | 'edit';
  nodeId: string;
  position: { x: number; y: number };
}

export interface TreeContextMenuProps {
  visible: boolean;
  position: { x: number; y: number };
  nodeId: string;
  onAdd: (nodeId: string) => void;
  onEdit: (nodeId: string) => void;
  onClose: () => void;
}