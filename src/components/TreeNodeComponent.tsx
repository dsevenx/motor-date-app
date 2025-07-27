"use client"

import React from 'react';
import { ChevronRight, ChevronDown, Building2, Folder, FileText, Settings, Truck } from 'lucide-react';
import { TreeNode } from '@/types/contractTypes';

interface TreeNodeComponentProps {
  node: TreeNode;
  onToggle: (nodeId: string) => void;
  onSelect: (nodeId: string) => void;
  onContextMenu: (nodeId: string, event: React.MouseEvent) => void;
  selectedNodeId?: string;
}

export const TreeNodeComponent: React.FC<TreeNodeComponentProps> = ({
  node,
  onToggle,
  onSelect,
  onContextMenu,
  selectedNodeId
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedNodeId === node.id;
  const isExpanded = node.expanded;

  // Icon basierend auf Typ
  const getIcon = () => {
    switch (node.type) {
      case 'company':
        return <Building2 size={16} className="text-blue-600" />;
      case 'group':
        return <Folder size={16} className="text-yellow-600" />;
      case 'contract':
        return <FileText size={16} className="text-green-600" />;
      case 'fuhrpark':
        return <Truck size={16} className="text-purple-600" />;
      case 'general':
      default:
        return <Settings size={16} className="text-gray-600" />;
    }
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onContextMenu(node.id, event);
  };

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onSelect(node.id);
  };

  const handleToggle = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (hasChildren) {
      onToggle(node.id);
    }
  };

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-1 py-1 px-2 hover:bg-gray-100 cursor-pointer rounded ${
          isSelected ? 'bg-blue-100 border border-blue-300' : ''
        }`}
        style={{ paddingLeft: `${(node.level || 0) * 16 + 8}px` }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        {/* Expand/Collapse Icon */}
        <div 
          className="w-4 h-4 flex items-center justify-center cursor-pointer"
          onClick={handleToggle}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown size={14} className="text-gray-500" />
            ) : (
              <ChevronRight size={14} className="text-gray-500" />
            )
          ) : (
            <span className="w-4" />
          )}
        </div>

        {/* Node Icon */}
        <div className="flex-shrink-0">
          {getIcon()}
        </div>

        {/* Node Text */}
        <div className="flex-1 min-w-0">
          <div 
            className={`text-sm truncate ${
              node.aktivesObjekt ? 'font-bold text-gray-900' : 'text-gray-700'
            }`}
          >
            {node.name}
          </div>
          {node.description && (
            <div className="text-xs text-gray-500 truncate">
              {node.description}
            </div>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children?.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              onToggle={onToggle}
              onSelect={onSelect}
              onContextMenu={onContextMenu}
              selectedNodeId={selectedNodeId}
            />
          ))}
        </div>
      )}
    </div>
  );
};