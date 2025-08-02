"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MenuItem {
  name: string;
  path: string;
  subItems?: { name: string; path: string; section?: string }[];
}

const menuItems: MenuItem[] = [
  {
    name: 'Stand',
    path: '/stand'
  },
  {
    name: 'Objekt',
    path: '/objekt',
    subItems: [
      { name: 'Stamm', path: '/objekt', section: 'stamm' },
      { name: 'Detail', path: '/objekt', section: 'detail' }
    ]
  },
  {
    name: 'Zusatz',
    path: '/zusatz',
    subItems: [
      { name: 'Allgemein', path: '/zusatz', section: 'allgemein' },
      { name: 'IVF', path: '/zusatz', section: 'ivf' },
      { name: 'Automotive', path: '/zusatz', section: 'automotive' }
    ]
  },
  {
    name: 'Flotte',
    path: '/flotte',
    subItems: [
      { name: 'Allgemein', path: '/flotte', section: 'allgemein' },
      { name: 'Handel/Handwerk', path: '/flotte', section: 'handel-handwerk' }
    ]
  },
  {
    name: 'Produkt',
    path: '/produkt',
    subItems: [
      { name: 'Liste', path: '/produkt', section: 'liste' },
      { name: 'Nachlässe/Zuschläge', path: '/produkt', section: 'nachlaesse-zuschlaege' },
      { name: 'Fahrer', path: '/produkt', section: 'fahrer' },
      { name: 'Merkmale', path: '/produkt', section: 'merkmale' },
      { name: 'Tarifangaben', path: '/produkt', section: 'tarifangaben' }
    ]
  },
  {
    name: 'Vertrag',
    path: '/vertrag',
    subItems: [
      { name: 'Aktivitätensteuerung', path: '/vertrag', section: 'aktivitaetensteuerung' },
      { name: 'Grundlagen', path: '/vertrag', section: 'grundlagen' }
    ]
  },
  {
    name: 'KB-TH',
    path: '/kb-th',
    subItems: [
      { name: 'Echte Eingaben', path: '/kb-th', section: 'echte-eingaben' },
      { name: 'ServiceABSEinarbeiter', path: '/kb-th', section: 'service-abs' }
    ]
  },
  {
    name: 'GUI-Test',
    path: '/gui-test'
  }
];

export const NavigationMenu: React.FC = () => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const pathname = usePathname();

  const handleMouseEnter = (itemName: string) => {
    setHoveredItem(itemName);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="bg-gray-300 border-t border-gray-400 relative">
      <div className="px-4 py-2">
        <div className="flex space-x-8">
          {menuItems.map((item) => (
            <div
              key={item.name}
              className="relative"
              onMouseEnter={() => handleMouseEnter(item.name)}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                href={item.path}
                className={`text-sm font-medium px-3 py-2 rounded transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                {item.name}
              </Link>

              {/* Submenu */}
              {item.subItems && hoveredItem === item.name && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 shadow-lg rounded-md py-1 min-w-48 z-50">
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.name}
                      href={subItem.section ? `${subItem.path}#${subItem.section}` : subItem.path}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                      {subItem.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};