// Business Logic Layer für Contract-Daten
// Entscheidet basierend auf EditMode zwischen DB-Aufruf und Tardis-Flow

import { Contract, ContractTree, Ordnervereinbarung, TreeNode, KVUEVertragsHierarchie } from '@/types/contractTypes';
import { fetchContractDataDB } from './FetchContractDB';
import { FIELD_DEFINITIONS } from '@/constants/fieldConfig';

// Simuliert die Tardis-Vorbereitung
export const TardisCallVorbereiten = async (
  contractFromDB: Contract, 
  fieldDefinitions: any[]
): Promise<Contract> => {
  console.log('🚀 TardisCallVorbereiten: Bereite Contract für Tardis vor...');
  console.log('🔧 FIELD_DEFINITIONS Anzahl:', fieldDefinitions.length);
  
  // Suche nach Fahrleistung in FIELD_DEFINITIONS
  const fahrleistungField = fieldDefinitions.find(f => 
    f.key === 'kraftDmKfzVorfahrl' || f.key === 'fahrleistung' || f.key.includes('fahrleistung')
  );
  
  if (fahrleistungField) {
    console.log('🚗 Fahrleistung gefunden in FIELD_DEFINITIONS:', {
      key: fahrleistungField.key,
      value: fahrleistungField.value || fahrleistungField.defaultValue
    });
  } else {
    console.log('❌ Keine Fahrleistung in FIELD_DEFINITIONS gefunden');
    console.log('🔍 Verfügbare FIELD_DEFINITIONS Keys:', fieldDefinitions.map(f => f.key));
  }
  
  // Simuliere Modifikation: Füge "vorbereitet" an Straße in der Header-Adresse an

    const preparedContract = { ...contractFromDB };

  if (
    preparedContract.contract &&
    preparedContract.contract.kContract &&
    preparedContract.contract.kContract.deAllgInfos
  ) {
    preparedContract.contract = {
      ...preparedContract.contract,
      kContract: {
        ...preparedContract.contract.kContract,
        deAllgInfos: {
          ...preparedContract.contract.kContract.deAllgInfos,
          nameVn: preparedContract.contract.kContract.deAllgInfos.nameVn
            ? `${preparedContract.contract.kContract.deAllgInfos.nameVn} vorbereitet`
            : preparedContract.contract.kContract.deAllgInfos.nameVn,
        },
      },
    };
  }

  console.log('✅ TardisCallVorbereiten: Contract vorbereitet');
  return preparedContract;
};

// Simuliert den Tardis WebService Aufruf
export const fetchContractTardis = async (preparedContract: Contract): Promise<Contract> => {
  console.log('🌌 fetchContractTardis: Rufe Tardis WebService auf...');
  
  // Simuliere WebService-Aufruf (normalerweise HTTP-Request)
  await new Promise(resolve => setTimeout(resolve, 500)); // Simuliere Latenz
  
  // Simuliere Tardis-Antwort: Füge "für Tardis" an nameVn in deAllgInfos an
  // Nur nameVn in preparedContract.contract.kContract.deAllgInfos updaten, falls vorhanden
  const tardisContract = { ...preparedContract };

  if (
    tardisContract.contract &&
    tardisContract.contract.kContract &&
    tardisContract.contract.kContract.deAllgInfos
  ) {
    tardisContract.contract = {
      ...tardisContract.contract,
      kContract: {
        ...tardisContract.contract.kContract,
        deAllgInfos: {
          ...tardisContract.contract.kContract.deAllgInfos,
          nameVn: tardisContract.contract.kContract.deAllgInfos.nameVn
            ? `${tardisContract.contract.kContract.deAllgInfos.nameVn} für Tardis`
            : tardisContract.contract.kContract.deAllgInfos.nameVn,
        },
      },
    };
  }

  console.log('✅ fetchContractTardis: Tardis WebService Antwort erhalten');
  return tardisContract;
};

// Konvertiert KVUEVertragsHierarchie zu TreeNode
const convertKVUEToTreeNode = (kvue: KVUEVertragsHierarchie, parentId?: string): TreeNode => {
  return {
    id: kvue.id,
    name: kvue.name,
    description: kvue.description,
    type: kvue.type as TreeNode['type'],
    aktivesObjekt: kvue.aktivesObjekt,
    expanded: kvue.expanded,
    level: kvue.level,
    parentId: parentId,
    children: kvue.children?.map(child => convertKVUEToTreeNode(child, kvue.id))
  };
};

// Optimierte Funktion: Nur ContractTree laden (ändert sich nicht bei EditMode-Switch)
export const fetchContractTreeBL = async (): Promise<ContractTree> => {
  console.log('🌲 fetchContractTreeBL: Lade nur ContractTree (EditMode-unabhängig)');
  
  // ContractTree ist immer gleich - direkt aus DB laden
  const contract = await fetchContractDataDB();
  const kvueHierarchy = contract.contract.kContract.KVUEVertragsHierarchie;
  
  // Konvertiere KVUEVertragsHierarchie zu ContractTree
  const contractTree: ContractTree = {
    rootNodes: [convertKVUEToTreeNode(kvueHierarchy)],
    activeNodeId: findActiveNodeId(kvueHierarchy)
  };
  
  console.log('✅ fetchContractTreeBL: ContractTree geladen und konvertiert');
  return contractTree;
};

// Hilfsfunktion: Findet die ID des aktiven Knotens
const findActiveNodeId = (kvue: KVUEVertragsHierarchie): string | undefined => {
  if (kvue.aktivesObjekt) {
    return kvue.id;
  }
  
  for (const child of kvue.children || []) {
    const activeId = findActiveNodeId(child);
    if (activeId) return activeId;
  }
  
  return undefined;
};

// Optimierte Funktion: Nur Ordnervereinbarungen laden (abhängig von EditMode)
export const fetchOrdnervereinbarungenBL = async (isEditMode: boolean): Promise<Ordnervereinbarung[]> => {
  console.log(`📁 fetchOrdnervereinbarungenBL: Lade Ordnervereinbarungen (EditMode: ${isEditMode})`);
  
  if (!isEditMode) {
    // Anzeige-Modus: Direkt aus DB laden
    console.log('👁️ Anzeige-Modus: Lade Ordnervereinbarungen direkt aus DB');
    const contract = await fetchContractDataDB();
    console.log('✅ fetchOrdnervereinbarungenBL: DB-Ordnervereinbarungen geladen');
    //return contract.ordnervereinbarungen;

    return [
    {
      id: "1",
      text: "Anzeige Erste Vereinbarung",
      category: "Allgemein",
    },
    {
      id: "2",
      text: "Anzeige Zweite Vereinbarung",
      category: "Spezial",
    },
  ];

  } else {
    // Edit-Modus: Tardis-Flow für Ordnervereinbarungen
    console.log('✏️ Edit-Modus: Starte Tardis-Flow für Ordnervereinbarungen');
    
    // 1. Basis-Daten aus DB laden
    const contractFromDB = await fetchContractDataDB();
    console.log('📊 Basis-Daten aus DB geladen');
    
    // 2. Mit FIELD_DEFINITIONS vorbereiten
    const preparedContract = await TardisCallVorbereiten(contractFromDB, FIELD_DEFINITIONS);
    
    // 3. Tardis WebService aufrufen
    const finalContract = await fetchContractTardis(preparedContract);
    
    console.log('✅ fetchOrdnervereinbarungenBL: Tardis-Flow für Ordnervereinbarungen abgeschlossen');

    return [
    {
      id: "1",
      text: "Erste Vereinbarung",
      category: "Allgemein",
    },
    {
      id: "2",
      text: "Zweite Vereinbarung",
      category: "Spezial",
    },
  ];
    //return finalContract.ordnervereinbarungen;
  }
};

// Business Logic Layer - Hauptfunktion (für Rückwärtskompatibilität)
export const fetchContractDataBL = async (isEditMode: boolean): Promise<Contract> => {
  const callId = Date.now();
  console.log(`📋 ===== fetchContractDataBL CALL ${callId} =====`);
  console.log(`📋 EditMode: ${isEditMode}`);
  console.log(`📋 Call Stack:`, new Error().stack?.split('\n').slice(1, 4));
  
  if (!isEditMode) {
    // Anzeige-Modus: Direkt aus DB laden
    console.log(`👁️ [${callId}] Anzeige-Modus: Lade direkt aus DB`);
    const contract = await fetchContractDataDB();
    console.log(`👁️ [${callId}] DB-Contract Fahrleistung:`, contract.contract.kContract.deAllgInfos.nameVn); // Proxy für Daten-Check
    console.log(`✅ [${callId}] fetchContractDataBL: DB-Daten geladen`);
    return contract;
  } else {
    // Edit-Modus: Tardis-Flow
    console.log(`✏️ [${callId}] Edit-Modus: Starte Tardis-Flow`);
    
    // 1. Basis-Daten aus DB laden
    const contractFromDB = await fetchContractDataDB();
    console.log(`📊 [${callId}] DB-Contract geladen`);
    
    // 2. Mit FIELD_DEFINITIONS vorbereiten
    const preparedContract = await TardisCallVorbereiten(contractFromDB, FIELD_DEFINITIONS);
    console.log(`🔧 [${callId}] Contract vorbereitet`);
    
    // 3. Tardis WebService aufrufen
    const finalContract = await fetchContractTardis(preparedContract);
    console.log(`🚀 [${callId}] Tardis-Contract Fahrleistung:`, finalContract.contract.kContract.deAllgInfos.nameVn); // Proxy für Daten-Check
    
    console.log(`✅ [${callId}] fetchContractDataBL: Tardis-Flow abgeschlossen`);
    return finalContract;
  }
};