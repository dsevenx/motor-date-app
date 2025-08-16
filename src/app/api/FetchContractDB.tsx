// FetchContractDB.tsx - Lädt Contract-Daten über API-Route

import { Contract } from '@/types/contractTypes';

const getVertrkeyFromUrl = (): string | null => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('vertrkey');
  }
  return null;
};

export const fetchContractDataDB = async (vertrkey?: string): Promise<Contract> => {
  try {
    // Simuliere kurzen API-Delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Bestimme welcher vertrkey verwendet werden soll
    let targetVertrkey = vertrkey;
    
    // Falls kein vertrkey übergeben wurde, versuche aus URL zu lesen
    if (!targetVertrkey) {
      targetVertrkey = getVertrkeyFromUrl() || undefined;
    }
    
    // Konstruiere API-URL
    const apiUrl = new URL('/api/contracts', window.location.origin);
    if (targetVertrkey) {
      apiUrl.searchParams.set('vertrkey', targetVertrkey);
    }
    
    console.log(`Fetching contract data from API: ${apiUrl.toString()}`);
    
    // API-Call
    const response = await fetch(apiUrl.toString());
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Error ${response.status}: ${errorData.error || 'Unknown error'}`);
    }
    
    const contractData: Contract = await response.json();
    console.log('Successfully fetched contract data from API');
    
    return contractData;
    
  } catch (error) {
    console.error('Error fetching contract data:', error);
    throw error;
  }
};

// Alternative Funktion für explizite vertrkey-Übergabe
export const fetchContractDataByKey = async (vertrkey: string): Promise<Contract> => {
  return fetchContractDataDB(vertrkey);
};

// Funktion für Client-side URL-Parameter-Handling
export const fetchContractDataFromUrl = async (): Promise<Contract> => {
  let vertrkey: string | null = null;
  
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    vertrkey = urlParams.get('vertrkey');
  }
  
  return fetchContractDataDB(vertrkey || undefined);
};

export const updateTreeNode = async (nodeId: string, updates: any): Promise<boolean> => {
  // Simuliere API-Update
  await new Promise(resolve => setTimeout(resolve, 200));
  console.log(`Updating node ${nodeId} with:`, updates);
  return true;
};

export const addTreeNode = async (parentId: string, newNode: any): Promise<any> => {
  // Simuliere API-Erstellung
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const newTreeNode = {
    ...newNode,
    id: `${parentId}.${Date.now()}`,
    parentId
  };
  
  console.log(`Adding new node to parent ${parentId}:`, newTreeNode);
  return newTreeNode;
};

export default fetchContractDataDB;