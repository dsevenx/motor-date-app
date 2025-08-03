// contractTypes.ts - TypeScript Typen für Contract und Tree

export interface TreeNode {
  id: string;
  name: string;
  description: string;
  type: 'company' | 'group' | 'contract' | 'general' | 'fuhrpark';
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

export interface ContractHeader {
  companyName: string;
  address: {
    street: string;
    city: string;
    zipCode: string;
  };
  contractNumber: string;
  validFrom: string;
  status: string;
  maz: string;
  internet: string;
  telBusiness: string;
  telMobile: string;
  email: string;
  responsible: string;
  referenceNumber: string;
  type: string;
  fax: string;
}

export interface Contract {
  id: string;
  name: string;
  contractstate: string;
  contractAusfertigunsgrund: string;
  inceptionDate: Date;
  header: ContractHeader;
  tree: ContractTree;
  ordnervereinbarungen: Ordnervereinbarung[];
  createdAt: Date;
  updatedAt: Date;
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