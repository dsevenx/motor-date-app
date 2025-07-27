"use client"

import React, { useEffect, useRef } from 'react';
import { Plus, Edit } from 'lucide-react';
import { TreeContextMenuProps } from '@/types/contractTypes';

export const TreeContextMenu: React.FC<TreeContextMenuProps> = ({
  visible,
  position,
  nodeId,
  onAdd,
  onEdit,
  onClose
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      ref={menuRef}
      className="fixed bg-white border border-gray-300 rounded-md shadow-lg py-1 min-w-[140px] z-50"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <button
        onClick={() => {
          onAdd(nodeId);
          onClose();
        }}
        className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
      >
        <Plus size={16} className="text-green-600" />
        Hinzufügen
      </button>
      <button
        onClick={() => {
          onEdit(nodeId);
          onClose();
        }}
        className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
      >
        <Edit size={16} className="text-blue-600" />
        Bearbeiten
      </button>
    </div>
  );
};