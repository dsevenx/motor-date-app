// Business Logic Layer für Contract-Daten
// Entscheidet basierend auf EditMode zwischen DB-Aufruf und Tardis-Flow

import { Contract, ContractTree, Ordnervereinbarung } from '@/types/contractTypes';
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
  const preparedContract: Contract = {
    ...contractFromDB,
    header: {
      ...contractFromDB.header,
      address: {
        ...contractFromDB.header.address,
        street: contractFromDB.header.address.street ? 
          `${contractFromDB.header.address.street} vorbereitet` : 
          contractFromDB.header.address.street
      }
    }
  };
  
  console.log('✅ TardisCallVorbereiten: Contract vorbereitet');
  return preparedContract;
};

// Simuliert den Tardis WebService Aufruf
export const fetchContractTardis = async (preparedContract: Contract): Promise<Contract> => {
  console.log('🌌 fetchContractTardis: Rufe Tardis WebService auf...');
  
  // Simuliere WebService-Aufruf (normalerweise HTTP-Request)
  await new Promise(resolve => setTimeout(resolve, 500)); // Simuliere Latenz
  
  // Simuliere Tardis-Antwort: Füge "für Tardis" an Straße an
  const tardisContract: Contract = {
    ...preparedContract,
    header: {
      ...preparedContract.header,
      address: {
        ...preparedContract.header.address,
        street: preparedContract.header.address.street ? 
          `${preparedContract.header.address.street} für Tardis` : 
          preparedContract.header.address.street
      }
    }
  };
  
  console.log('✅ fetchContractTardis: Tardis WebService Antwort erhalten');
  return tardisContract;
};

// Optimierte Funktion: Nur ContractTree laden (ändert sich nicht bei EditMode-Switch)
export const fetchContractTreeBL = async (): Promise<ContractTree> => {
  console.log('🌲 fetchContractTreeBL: Lade nur ContractTree (EditMode-unabhängig)');
  
  // ContractTree ist immer gleich - direkt aus DB laden
  const contract = await fetchContractDataDB();
  console.log('✅ fetchContractTreeBL: ContractTree geladen');
  return contract.tree;
};

// Optimierte Funktion: Nur Ordnervereinbarungen laden (abhängig von EditMode)
export const fetchOrdnervereinbarungenBL = async (isEditMode: boolean): Promise<Ordnervereinbarung[]> => {
  console.log(`📁 fetchOrdnervereinbarungenBL: Lade Ordnervereinbarungen (EditMode: ${isEditMode})`);
  
  if (!isEditMode) {
    // Anzeige-Modus: Direkt aus DB laden
    console.log('👁️ Anzeige-Modus: Lade Ordnervereinbarungen direkt aus DB');
    const contract = await fetchContractDataDB();
    console.log('✅ fetchOrdnervereinbarungenBL: DB-Ordnervereinbarungen geladen');
    return contract.ordnervereinbarungen;
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
    return finalContract.ordnervereinbarungen;
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
    console.log(`👁️ [${callId}] DB-Contract Fahrleistung:`, contract.header.address.street); // Proxy für Daten-Check
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
    console.log(`🚀 [${callId}] Tardis-Contract Fahrleistung:`, finalContract.header.address.street); // Proxy für Daten-Check
    
    console.log(`✅ [${callId}] fetchContractDataBL: Tardis-Flow abgeschlossen`);
    return finalContract;
  }
};