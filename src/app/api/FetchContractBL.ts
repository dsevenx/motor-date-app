// Business Logic Layer für Contract-Daten
// Entscheidet basierend auf EditMode zwischen DB-Aufruf und Tardis-Flow

import { Contract } from '@/types/contractTypes';
import { fetchContractDataDB } from './FetchContractDB';
import { FIELD_DEFINITIONS } from '@/constants/fieldConfig';

// Simuliert die Tardis-Vorbereitung
export const TardisCallVorbereiten = async (
  contractFromDB: Contract, 
  fieldDefinitions: any[]
): Promise<Contract> => {
  console.log('🚀 TardisCallVorbereiten: Bereite Contract für Tardis vor...');
  
  // Simuliere Verarbeitung der FIELD_DEFINITIONS
  // Hier würden normalerweise die FIELD_DEFINITIONS mit dem Contract kombiniert werden
  
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

// Business Logic Layer - Hauptfunktion
export const fetchContractDataBL = async (isEditMode: boolean): Promise<Contract> => {
  console.log(`📋 fetchContractDataBL: Starte Abfrage (EditMode: ${isEditMode})`);
  
  if (!isEditMode) {
    // Anzeige-Modus: Direkt aus DB laden
    console.log('👁️ Anzeige-Modus: Lade direkt aus DB');
    const contract = await fetchContractDataDB();
    console.log('✅ fetchContractDataBL: DB-Daten geladen');
    return contract;
  } else {
    // Edit-Modus: Tardis-Flow
    console.log('✏️ Edit-Modus: Starte Tardis-Flow');
    
    // 1. Basis-Daten aus DB laden
    const contractFromDB = await fetchContractDataDB();
    console.log('📊 Basis-Daten aus DB geladen');
    
    // 2. Mit FIELD_DEFINITIONS vorbereiten
    const preparedContract = await TardisCallVorbereiten(contractFromDB, FIELD_DEFINITIONS);
    
    // 3. Tardis WebService aufrufen
    const finalContract = await fetchContractTardis(preparedContract);
    
    console.log('✅ fetchContractDataBL: Tardis-Flow abgeschlossen');
    return finalContract;
  }
};