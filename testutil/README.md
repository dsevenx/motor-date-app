# Test Utilities für Artifact-Performance

Dieser Ordner enthält alle Test- und Performance-Monitoring-Tools für die Artifact-basierte Domain-Lösung.

## 📁 Dateien

### 🔧 Core Test-Klassen
- **`tokenCounter.ts`** - Token-Counting und Performance-Analyse-Utilities
- **`performanceTest.ts`** - Hauptklasse für Artifact-Performance-Tests
- **`domainMapping.ts`** - Domain-Mapping-Utilities mit Fallback-Mechanismen

### 🖥️ UI-Komponenten
- **`PerformanceTestPanel.tsx`** - React-Komponente für Performance-Tests
- **`performance-test.html`** - Standalone Browser-Test-Interface

## 🚀 Verwendung

### Option 1: Browser-Interface
```bash
# Öffne die HTML-Datei direkt
open testutil/performance-test.html
```

### Option 2: Programmatisch
```typescript
// In Browser-Konsole oder Node.js
import { ArtifactPerformanceTest } from './performanceTest.js';

// Vollständige Analyse
ArtifactPerformanceTest.runCompleteAnalysis();

// Einzelne Tests
ArtifactPerformanceTest.runTokenComparison();
ArtifactPerformanceTest.runScalingProjection();
ArtifactPerformanceTest.simulateApiCallSavings(100);
```

## 📊 Test-Szenarien

### 1. Token-Vergleich
- Vergleicht alte vs. neue System Prompts
- Misst Token-Einsparung (aktuell: ~67%)
- Berechnet Kosten-Impact

### 2. Skalierungs-Projektion
- Simuliert 10-15 Tabellen-Szenarien
- Zeigt Token-Wachstum mit/ohne Artifact
- Validiert Zukunftssicherheit

### 3. Kosten-Simulation
- Berechnet Einsparungen bei verschiedenen API-Call-Volumina
- ROI-Analyse für verschiedene Nutzungsszenarien
- Monatliche/jährliche Kostenprojektionen

## 🔬 Wann verwenden?

- **Bei neuen Tabellen**: Performance-Impact messen
- **Bei Domain-Erweiterungen**: Token-Wachstum überwachen
- **Vor Produktions-Deployment**: Kosten-Benefit-Analyse
- **Performance-Optimierung**: Bottlenecks identifizieren

## 📈 Erwartete Ergebnisse

```
✅ Token-Einsparung: 67% (4.000 Tokens/Call)
✅ Skalierung: 95% weniger Token-Wachstum
✅ Kosten: $36-360/Monat Einsparung
✅ Performance: Optimal für 50+ Tabellen
```

## ⚠️ Hinweise

- Tests sind unabhängig von der Hauptanwendung
- Keine Auswirkung auf Production-Code
- Können bei Bedarf erweitert/angepasst werden
- Fallback-Mechanismen für Offline-Tests eingebaut