"use client"

import React, { useState, useEffect } from 'react';
import { TreeNode, Contract, ContextMenuAction } from '@/types/contractTypes';
import { TreeNodeComponent } from './TreeNodeComponent';
import { TreeContextMenu } from './TreeContextMenu';
import { MotorCheckBox } from './MotorCheckBox';
import { MotorButton } from './MotorButton';
import { fetchContractDataDB, updateTreeNode, addTreeNode } from '@/app/api/FetchContractDB';
import { RefreshCw, Folder } from 'lucide-react';

export const ContractTreeComponent: React.FC = () => {
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>();
  const [showApplications, setShowApplications] = useState<'J' | 'N' | ' '>('J');
  const [showCancelledContracts, setShowCancelledContracts] = useState<'J' | 'N' | ' '>(' ');
  const [contextMenu, setContextMenu] = useState<ContextMenuAction & { visible: boolean }>({
    type: 'add',
    nodeId: '',
    position: { x: 0, y: 0 },
    visible: false
  });

  // Lade Contract-Daten
  useEffect(() => {
    loadContractData();
  }, []);

  const loadContractData = async () => {
    setLoading(true);
    try {
      const contractData = await fetchContractDataDB();
      setContract(contractData);
      setSelectedNodeId(contractData.tree.activeNodeId);
    } catch (error) {
      console.error('Fehler beim Laden der Contract-Daten:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tree-Knoten expandieren/kollabieren
  const handleToggleNode = (nodeId: string) => {
    if (!contract) return;

    const updateNodeInTree = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, expanded: !node.expanded };
        }
        if (node.children) {
          return { ...node, children: updateNodeInTree(node.children) };
        }
        return node;
      });
    };

    const updatedTree = {
      ...contract.tree,
      rootNodes: updateNodeInTree(contract.tree.rootNodes)
    };

    setContract({ ...contract, tree: updatedTree });
  };

  // Knoten auswählen
  const handleSelectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    
    if (!contract) return;

    // Markiere den ausgewählten Knoten als aktives Objekt
    const updateActiveNode = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(node => {
        const isActive = node.id === nodeId;
        const updatedNode = { ...node, aktivesObjekt: isActive };
        
        if (node.children) {
          updatedNode.children = updateActiveNode(node.children);
        }
        
        return updatedNode;
      });
    };

    const updatedTree = {
      ...contract.tree,
      rootNodes: updateActiveNode(contract.tree.rootNodes),
      activeNodeId: nodeId
    };

    setContract({ ...contract, tree: updatedTree });
  };

  // Kontextmenü anzeigen
  const handleContextMenu = (nodeId: string, event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      type: 'add',
      nodeId,
      position: { x: event.clientX, y: event.clientY },
      visible: true
    });
  };

  // Kontextmenü schließen
  const handleCloseContextMenu = () => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  // Knoten hinzufügen
  const handleAddNode = async (parentId: string) => {
    console.log(`Hinzufügen für Knoten: ${parentId}`);
    
    // Hier würde normalerweise ein Dialog geöffnet werden
    // Für Demo erstellen wir einen neuen Knoten
    try {
      const newNode = await addTreeNode(parentId, {
        name: 'Neuer Knoten',
        description: 'Neu hinzugefügter Knoten',
        type: 'general',
        aktivesObjekt: false,
        expanded: false,
        level: 0 // wird basierend auf Parent berechnet
      });
      
      console.log('Neuer Knoten erstellt:', newNode);
      // TODO: Tree aktualisieren
      await loadContractData(); // Reload für Demo
    } catch (error) {
      console.error('Fehler beim Hinzufügen:', error);
    }
  };

  // Knoten bearbeiten
  const handleEditNode = async (nodeId: string) => {
    console.log(`Bearbeiten für Knoten: ${nodeId}`);
    
    // Hier würde normalerweise ein Bearbeitungsdialog geöffnet werden
    try {
      await updateTreeNode(nodeId, {
        name: 'Bearbeiteter Knoten',
        description: 'Aktualisierte Beschreibung'
      });
      
      console.log('Knoten aktualisiert');
      // TODO: Tree aktualisieren
      await loadContractData(); // Reload für Demo
    } catch (error) {
      console.error('Fehler beim Bearbeiten:', error);
    }
  };


  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <RefreshCw className="animate-spin h-6 w-6 text-blue-600" />
        <span className="ml-2 text-gray-600">Lade Kollektivstruktur...</span>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <Folder className="h-6 w-6 mr-2" />
        Keine Contract-Daten verfügbar
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-w-fit">
      {/* Header */}
      <div className="flex-shrink-0 bg-blue-50 border-b border-blue-200 p-3">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Folder className="h-5 w-5 text-blue-600" />
         {contract.name}
        </h3>
       </div>

      {/* Anzeigeoptionen */}
      <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200 p-2">
        <div className="flex items-center justify-between min-w-fit">
          <div className="flex items-center gap-4 text-sm">
            <MotorCheckBox
              value={showApplications}
              onChange={(value) => setShowApplications(value)}
              label="Anträge anzeigen"
              hideLabel={false}
              allowInViewMode={true}
            />
            <MotorCheckBox
              value={showCancelledContracts}
              onChange={(value) => setShowCancelledContracts(value)}
              label="Stornierte Verträge anzeigen"
              hideLabel={false}
              allowInViewMode={true}
            />
          </div>
          <MotorButton
            onClick={loadContractData}
            variant="primary"
            size="small"
           
          >
            Aktualisieren
          </MotorButton>
        </div>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="p-2">
          {contract.tree.rootNodes.map((node) => (
            <TreeNodeComponent
              key={node.id}
              node={node}
              onToggle={handleToggleNode}
              onSelect={handleSelectNode}
              onContextMenu={handleContextMenu}
              selectedNodeId={selectedNodeId}
            />
          ))}
        </div>
      </div>


      {/* Context Menu */}
      <TreeContextMenu
        visible={contextMenu.visible}
        position={contextMenu.position}
        nodeId={contextMenu.nodeId}
        onAdd={handleAddNode}
        onEdit={handleEditNode}
        onClose={handleCloseContextMenu}
      />
    </div>
  );
};