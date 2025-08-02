import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Edit3,
  Eye,
  Save,
  X} from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';

interface MenuItemProps {
  title: string;
  items: Array<{
    label?: string;
    shortcut?: string;
    separator?: boolean;
    submenu?: Array<{ label: string; shortcut?: string }>;
  }>;
  onItemClick?: (item: string) => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ title, items, onItemClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  return (
    <div className="relative">
      <button
        className="px-3 py-1 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => {
          setIsOpen(false);
          setActiveSubmenu(null);
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
      </button>
      
      {isOpen && (
        <div 
          className="absolute top-full left-0 z-50 bg-white border border-gray-300 shadow-lg min-w-48"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => {
            setIsOpen(false);
            setActiveSubmenu(null);
          }}
        >
          {items.map((item, index) => (
            <div key={index}>
              {item.separator ? (
                <div className="border-t border-gray-200 my-1" />
              ) : (
                <div
                  className="relative"
                  onMouseEnter={() => item.submenu && item.label && setActiveSubmenu(item.label)}
                  onMouseLeave={() => !item.submenu && setActiveSubmenu(null)}
                >
                  <button
                    className="w-full px-3 py-1 text-left text-sm hover:bg-blue-100 flex justify-between items-center"
                    onClick={() => item.label && onItemClick?.(item.label)}
                  >
                    <span>{item.label}</span>
                    <div className="flex items-center gap-2">
                      {item.shortcut && (
                        <span className="text-xs text-gray-500">{item.shortcut}</span>
                      )}
                      {item.submenu && (
                        <ChevronRight className="w-3 h-3" />
                      )}
                    </div>
                  </button>
                  
                  {item.submenu && item.label && activeSubmenu === item.label && (
                    <div className="absolute left-full top-0 bg-white border border-gray-300 shadow-lg min-w-40">
                      {item.submenu.map((subItem, subIndex) => (
                        <button
                          key={subIndex}
                          className="w-full px-3 py-1 text-left text-sm hover:bg-blue-100 flex justify-between"
                          onClick={() => onItemClick?.(subItem.label)}
                        >
                          <span>{subItem.label}</span>
                          {subItem.shortcut && (
                            <span className="text-xs text-gray-500">{subItem.shortcut}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MotorAktenMenuleiste: React.FC = () => {
  const { isEditMode, setIsEditMode } = useEditMode();
  const [currentHistoryLabel] = useState("aktuell");

  // Menü-Definitionen basierend auf den Screenshots
  const akteMenuItems = [
    { label: "Ändern", shortcut: "F7" },
    { separator: true },
    { label: "Drucken/E-Mail schreiben...", shortcut: "Strg+P" },
    { label: "Mitteilung schreiben..." },
    { label: "Alle Akten drucken", shortcut: "Strg+Alt+#" },
    { separator: true },
    { label: "Speichern", shortcut: "Strg+S" },
    { label: "Speichern + Schließen", shortcut: "F3" },
    { label: "Schließen", shortcut: "Alt+F4" },
    { separator: true },
    { label: "Risikoliste drucken" },
    { separator: true },
    { label: "Kopie erstellen" }
  ];

  const bearbeitenMenuItems = [
    { label: "Vorschlag zu Antrag", shortcut: "Strg+Alt+A" },
    { label: "Anfrage" },
    { label: "Vorläufige Deckung" },
    { separator: true },
    { label: "Beschwerde" },
    { separator: true },
    { label: "Neuberechnen" },
    { label: "Datenpaten bearbeiten", shortcut: "Strg+Alt+B" },
    { label: "Gültig ab...", shortcut: "Strg+G" },
    { separator: true },
    { 
      label: "Rahmenvertrag",
      submenu: [
        { label: "Einzelvertrag aus Vorschlagsvorlage erstellen..." },
        { label: "Währung ändern", shortcut: "Strg+Alt+C" },
        { label: "Dokument indizieren", shortcut: "F4" },
        { label: "Vers.-Nr. vergeben" }
      ]
    },
    { label: "Vertrag zu Umbrella hinzufügen..." },
    { label: "Vertrag aus Umbrella entfernen" },
    { separator: true },
    { label: "Temporär zuteilen..." },
    { label: "Teamwechsel..." },
    { separator: true },
    { label: "Zurückgeben" },
    { label: "Bearbeitungsauftrag" },
    { label: "Zuständigkeitsermittlung" },
    { separator: true },
    { label: "Dringlichkeit" },
    { label: "Schichten vergleichen" },
    { separator: true },
    { label: "Punkte neuberechnen" },
    { label: "Prämienpfl. FZG festlegen..." },
    { separator: true },
    { label: "Abmeldedatum..." },
    { label: "Nichthaftungsanzeige..." },
    { label: "Neuer Schaden" }
  ];

  const historieMenuItems = [
    { label: "Historie vor" },
    { label: "Historie zurück" },
    { separator: true },
    { label: "Beginn" },
    { label: "Aktueller Stand" },
    { label: "Ans Dateisystem" }
  ];

  const verzweigenMenuItems = [
    { label: "HVN" },
    { label: "Expert" },
    { label: "VV-Partner" },
    { label: "Flotte" },
    { label: "Spartensystem" },
    { label: "VWB-Webdialog" },
    { label: "ZDVS" },
    { separator: true },
    { label: "Zurückgeben" },
    { label: "Vertragsjournal" }
  ];

  const extrasMenuItems = [
    { label: "Vertriebshierarchie..." },
    { label: "Vorzutragsdeaten..." },
    { label: "Mindestprämien setzen" },
    { label: "Verkaufsaktionen" },
    { separator: true },
    { label: "Verzweigen zum Vermittler" },
    { separator: true },
    { label: "Grüne Versicherungskarte anfordern" },
    { separator: true },
    { label: "Rabattverlustrechner" },
    { label: "Telefonnummer übernehmen", shortcut: "Strg+U" },
    { separator: true },
    { label: "Meine Allianz beantragen" },
    { separator: true },
    { label: "Zwischenablage prüfen", shortcut: "ALT+F11" }
  ];

  const fensterMenuItems = [
    { label: "Hauptfenster" },
    { label: "Ereignisanzeige..." },
    { 
      label: "Einstellungen",
      submenu: [
        { label: "Kollektivtree öffnen..." }
      ]
    }
  ];

  const hilfeMenuItems = [
    { label: "Info zur Anwendung" },
    { separator: true },
    { label: "Objekt-Assistent", shortcut: "Strg+Shift+A" },
    { label: "Hilfe", shortcut: "F1" }
  ];

  const handleMenuItemClick = (item: string) => {
    console.log(`Menu item clicked: ${item}`);
  };

  const handleHistoryNavigation = (direction: 'first' | 'prev' | 'next' | 'last') => {
    console.log(`History navigation: ${direction}`);
    // Hier würde die Historien-Navigation implementiert werden
  };

  const handleSave = () => {
    console.log('Save button clicked');
    // TODO: Implementierung der Save-Logik
  };

  const handleSaveWithClose = () => {
    console.log('Save and Close button clicked');
    // TODO: Implementierung der Save and Close-Logik
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Hauptmenü mit Historie-Navigation */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center">
          {/* Edit/Anzeige Modus Toggle */}
          <div className="flex items-center px-2">
            <div className={`flex items-center rounded-full p-1 ${
              isEditMode ? 'bg-green-500' : 'bg-red-500'
            }`}>
              <button
                className={`flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                  !isEditMode 
                    ? 'bg-white text-red-700 shadow-sm' 
                    : 'text-white hover:bg-red-600'
                }`}
                onClick={() => setIsEditMode(false)}
              >
                <Eye className="w-3 h-3 mr-1" />
                Anzeige
              </button>
              <button
                className={`flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                  isEditMode 
                    ? 'bg-white text-green-700 shadow-sm' 
                    : 'text-white hover:bg-green-600'
                }`}
                onClick={() => setIsEditMode(true)}
              >
                <Edit3 className="w-3 h-3 mr-1" />
                Edit
              </button>
            </div>
          </div>

          {/* Modus Anzeige */}
          <div className={`px-3 py-1 text-sm font-medium ${
            isEditMode ? 'text-green-700' : 'text-red-700'
          }`}>
            {isEditMode ? 'Edit' : 'Anzeige'}
          </div>

          {/* Save Buttons */}
          <div className="flex items-center gap-1 px-2">
            <button
              className={`flex items-center p-1.5 rounded border transition-colors ${
                isEditMode 
                  ? 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700' 
                  : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              onClick={isEditMode ? handleSave : undefined}
              disabled={!isEditMode}
              title="Speichern"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              className={`flex items-center p-1.5 rounded border transition-colors ${
                isEditMode 
                  ? 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700' 
                  : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              onClick={isEditMode ? handleSaveWithClose : undefined}
              disabled={!isEditMode}
              title="Speichern und Schließen"
            >
              <Save className="w-3.5 h-3.5 mr-0.5" />
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Menüpunkte */}
          <div className="flex items-center">
            <MenuItem title="Akte" items={akteMenuItems} onItemClick={handleMenuItemClick} />
            <MenuItem title="Bearbeiten" items={bearbeitenMenuItems} onItemClick={handleMenuItemClick} />
            <MenuItem title="Historie" items={historieMenuItems} onItemClick={handleMenuItemClick} />
            <MenuItem title="Verzweigen" items={verzweigenMenuItems} onItemClick={handleMenuItemClick} />
            <MenuItem title="Extras" items={extrasMenuItems} onItemClick={handleMenuItemClick} />
            <MenuItem title="Fenster" items={fensterMenuItems} onItemClick={handleMenuItemClick} />
            <MenuItem title="?" items={hilfeMenuItems} onItemClick={handleMenuItemClick} />
          </div>
        </div>

        {/* Historie Navigation - rechts */}
        <div className="flex items-center gap-1 px-2">
          <button 
            className="p-1 hover:bg-gray-100 rounded"
            onClick={() => handleHistoryNavigation('first')}
            title="Zum Anfang"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button 
            className="p-1 hover:bg-gray-100 rounded"
            onClick={() => handleHistoryNavigation('prev')}
            title="Zurück"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="mx-2 px-2 py-1 bg-gray-100 border text-sm min-w-20 text-center">
            {currentHistoryLabel}
          </span>
          
          <button 
            className="p-1 hover:bg-gray-100 rounded"
            onClick={() => handleHistoryNavigation('next')}
            title="Vorwärts"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button 
            className="p-1 hover:bg-gray-100 rounded"
            onClick={() => handleHistoryNavigation('last')}
            title="Zum Ende"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MotorAktenMenuleiste;