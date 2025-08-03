// FetchContract.tsx - Simuliert Contract-Daten basierend auf dem Screenshot

import { Contract, TreeNode, ContractTree, Ordnervereinbarung, ContractHeader } from '@/types/contractTypes';

// Mock-Daten basierend auf dem Screenshot
const createMockTreeData = (): ContractTree => {
  const treeNodes: TreeNode[] = [
    {
      id: '1',
      name: 'Rokoschütte AG',
      description: 'Hörselbergstrasse 4a, 81677 München AS842753907',
      type: 'company',
      aktivesObjekt: false,
      expanded: true,
      level: 0,
      children: [
        {
          id: '1.1',
          name: 'Rokoschütte AG',
          description: 'Hörselbergstrasse 4a, 81677 München AS845647342',
          type: 'group',
          aktivesObjekt: false,
          expanded: true,
          level: 1,
          parentId: '1',
          children: [
            {
              id: '1.1.1',
              name: 'Freier Stückpreis ohne BAK',
              description: '',
              type: 'contract',
              aktivesObjekt: false,
              expanded: true,
              level: 2,
              parentId: '1.1',
              children: [
                {
                  id: '1.1.1.1',
                  name: 'Allgemein',
                  description: 'AS427534047',
                  type: 'general',
                  aktivesObjekt: true, // Dieser Knoten ist aktiv (fett dargestellt)
                  level: 3,
                  parentId: '1.1.1'
                },
                {
                  id: '1.1.1.2',
                  name: 'ZielOK',
                  description: '',
                  type: 'general',
                  aktivesObjekt: false,
                  level: 3,
                  parentId: '1.1.1'
                },
                {
                  id: '1.1.1.3',
                  name: 'Fuhrpark',
                  description: '',
                  type: 'fuhrpark',
                  aktivesObjekt: false,
                  expanded: true,
                  level: 3,
                  parentId: '1.1.1'
                }
              ]
            }
          ]
        },
        {
          id: '1.2',
          name: 'Rokoschütte AG',
          description: 'Hörselbergstrasse 4a, 81677 München AS845647342',
          type: 'group',
          aktivesObjekt: false,
          expanded: true,
          level: 1,
          parentId: '1',
          children: [
            {
              id: '1.2.1',
              name: 'Freier Stückpreis ohne BAK',
              description: '',
              type: 'contract',
              aktivesObjekt: false,
              expanded: true,
              level: 2,
              parentId: '1.2',
              children: [
                {
                  id: '1.2.1.1',
                  name: 'AllgemeinGR1',
                  description: '',
                  type: 'general',
                  aktivesObjekt: false,
                  level: 3,
                  parentId: '1.2.1'
                },
                {
                  id: '1.2.1.2',
                  name: 'AllgemeinGR2',
                  description: '',
                  type: 'general',
                  aktivesObjekt: false,
                  level: 3,
                  parentId: '1.2.1'
                },
                {
                  id: '1.2.1.3',
                  name: 'AllgemeinGR3',
                  description: '',
                  type: 'general',
                  aktivesObjekt: false,
                  level: 3,
                  parentId: '1.2.1'
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  return {
    rootNodes: treeNodes,
    activeNodeId: '1.1.1.1'
  };
};

const createMockHeaderData = (): ContractHeader => {
  return {
    companyName: 'Rokoschütte AG und Co. KGaA',
    address: {
      street: 'Potsdamer Platz',
      city: 'München',
      zipCode: 'DE-81677'
    },
    contractNumber: 'AS-5850902489',
    validFrom: '21.07.2025',
    status: 'Kollektivgeschäft, Antrag, Aktiv; in Arbeit',
    maz: 'Nicht vorh.',
    internet: 'Allianz Beratungs-und Vertriebs AG VT-Allgemein',
    telBusiness: 'Theodor-Stern-Kai 1',
    telMobile: '+49 (0170) 233456789',
    email: 'testmail@test.de',
    responsible: '',
    referenceNumber: '9/001/0002',
    type: 'SW',
    fax: '+49 (069) 712684455'
  };
};

const createMockOrdnervereinbarungen = (): Ordnervereinbarung[] => {
  return [
    {
      id: '1',
      text: 'MLIK 346',
      category: 'mlik'
    },
    {
      id: '2',
      text: 'Fuhrpark: VR2 118% 2 F2',
      category: 'fuhrpark'
    },
    {
      id: '3',
      text: 'Max.FP-Nachlass: 0%',
      category: 'nachlass'
    },
    {
      id: '4',
      text: 'Stückpreis verl.: 01.01.2025: S11',
      category: 'stückpreis'
    }
  ];
};

export const fetchContractDataDB = async (): Promise<Contract> => {
  // Simuliere API-Aufruf mit Delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    id: 'contract_001',
    name: 'Rokoschütte AG Kollektivstruktur',
    contractstate: '2',
    contractAusfertigunsgrund: 'G01',
    inceptionDate: new Date('2025-07-01'),
    header: createMockHeaderData(),
    tree: createMockTreeData(),
    ordnervereinbarungen: createMockOrdnervereinbarungen(),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  };
};

export const updateTreeNode = async (nodeId: string, updates: Partial<TreeNode>): Promise<boolean> => {
  // Simuliere API-Update
  await new Promise(resolve => setTimeout(resolve, 200));
  console.log(`Updating node ${nodeId} with:`, updates);
  return true;
};

export const addTreeNode = async (parentId: string, newNode: Omit<TreeNode, 'id'>): Promise<TreeNode> => {
  // Simuliere API-Erstellung
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const newTreeNode: TreeNode = {
    ...newNode,
    id: `${parentId}.${Date.now()}`,
    parentId
  };
  
  console.log(`Adding new node to parent ${parentId}:`, newTreeNode);
  return newTreeNode;
};

export default fetchContractDataDB;