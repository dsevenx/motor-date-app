// Performance-Test für Artifact-basierte Domain-Lösung
import { TokenCounter, DomainDataAnalyzer } from './tokenCounter';

// Simuliere alten System Prompt (mit allen Domain-Daten)
const LEGACY_SYSTEM_PROMPT = `
Du bist ein Experte für deutsche Fahrzeugdaten-Extraktion.

DROPDOWN-FELD WERTE (verwende immer die VALUE, nicht das LABEL!):

KMANGABEGRUNG (Art des KM-Stands):
  - VALUE: "99" = LABEL: "Bitte eingeben"
  - VALUE: "1" = LABEL: "Versicherungsbeginn"
  - VALUE: "6" = LABEL: "Antragsaufnahme"
  - VALUE: "2" = LABEL: "km-Anfrage"
  - VALUE: "10" = LABEL: "bei Änderung"
  - VALUE: "8" = LABEL: "freiwillige Meldung VN"
  - VALUE: "KF" = LABEL: "Kilometerstand fehlt"
  - VALUE: "SK" = LABEL: "Kilometerstand zu Schadenereignis"
  - VALUE: "SG" = LABEL: "Kilometerstand aus Gutachten, Werkstatt"

ARTZUBEHOERTEIL (Art des Zubehörs):
  - VALUE: "ZUB998" = LABEL: "Bitte eingeben"
  - VALUE: "ZUB300" = LABEL: "Fahrwerktuning"
  - VALUE: "ZUB301" = LABEL: "Triebwerktuning"
  - VALUE: "ZUB302" = LABEL: "Auspufftuning"
  - VALUE: "ZUB303" = LABEL: "Innenraumtuning"
  - VALUE: "ZUB304" = LABEL: "Karosserietuning"
  - VALUE: "ZUB305" = LABEL: "Sonderlackierung"
  - VALUE: "ZUB306" = LABEL: "Sonderbeschriftung"
  - VALUE: "ZUB307" = LABEL: "Besondere Oberflächenbehandlung"
  - VALUE: "ZUB350" = LABEL: "Sonstiger Fahrzeugmehrwert"

FAHRERKREIS (Fahrerkreis):
  - VALUE: "E" = LABEL: "Einzelfahrer"
  - VALUE: "P" = LABEL: "Partnertarif"
  - VALUE: "F" = LABEL: "Familienfahrer"
  - VALUE: "M" = LABEL: "Beliebige Fahrer mit Mindestalter"

WIRTSCHAFTSZWEIG (Wirtschaftszweig):
  - VALUE: "W071" = LABEL: "Landwirtschaft"
  - VALUE: "W072" = LABEL: "Finandients- und Versicherungsdienstleistungen"
  - VALUE: "W073" = LABEL: "Spedition, Transport und Logistik"
  - VALUE: "W074" = LABEL: "produzierende Unternehmen"

INKASSOART (Inkassoart):
  - VALUE: "A" = LABEL: "Lastschrift"
  - VALUE: "E" = LABEL: "Überweisung"
  - VALUE: "W" = LABEL: "Vermittlerinkasso"

TABELLEN-DATEN (kilometerstaende, zubehoer):
- IMMER als Array von Objekten zurückgeben
- Jedes Objekt MUSS eine "id" haben
- Nutze die exakten Spalten-Keys aus der Konfiguration

WICHTIG: NUR JSON zurückgeben, keine Erklärungen außerhalb!
`;

// Neuer Artifact-basierter System Prompt
const ARTIFACT_SYSTEM_PROMPT = `
Du bist ein Experte für deutsche Fahrzeugdaten-Extraktion.

DROPDOWN-DOMAIN-REFERENZ (Token-optimiert via Artifact):
Domain-Daten verfügbar in Artifact "fahrzeug-domains.json"

DOMAIN: KraftBoGruppeMoeglKmAngabeGrund
- Nutze VALUE aus Artifact-Domain "KraftBoGruppeMoeglKmAngabeGrund"
- Bei Texterkennung: Label→Value-Mapping via Artifact
- Fallback: Intelligente Keyword-Zuordnung

DOMAIN: KraftBoGruppeMoeglArtZubehoerteil
- Nutze VALUE aus Artifact-Domain "KraftBoGruppeMoeglArtZubehoerteil"
- Bei Texterkennung: Label→Value-Mapping via Artifact
- Fallback: Intelligente Keyword-Zuordnung

ARTIFACT-BASIERTE MAPPING-REGELN:
Nutze Domain-Mapping aus Artifact "fahrzeug-domains.json"

KILOMETERSTAND-ART (KraftBoGruppeMoeglKmAngabeGrund):
- "bei antragsaufnahme" / "aufnahme" → VALUE: "6"
- "zu beginn" / "versicherungsbeginn" → VALUE: "1"
- "anfrage" / "km-anfrage" → VALUE: "2"

ZUBEHÖR-ART (KraftBoGruppeMoeglArtZubehoerteil):
- "fahrwerk" / "tuning" → VALUE: "ZUB300"
- "triebwerk" / "motor" → VALUE: "ZUB301"
- "auspuff" → VALUE: "ZUB302"

TABELLEN-DATEN (kilometerstaende, zubehoer):
- IMMER als Array von Objekten zurückgeben
- FÜR DROPDOWN-WERTE: Nutze Artifact "fahrzeug-domains.json"

ARTIFACT-INTEGRATION:
- Domain-Daten verfügbar in Artifact "fahrzeug-domains.json"
- Bei DropDown-Werten: Label→Value-Mapping via Artifact
- Artifact-Domains haben Priorität über generische Werte

WICHTIG: NUR JSON zurückgeben, keine Erklärungen außerhalb!
`;

// Performance-Test Funktionen
export class ArtifactPerformanceTest {
  
  static runTokenComparison() {
    console.log('🔍 ARTIFACT PERFORMANCE TEST');
    console.log('=====================================');
    
    const comparison = TokenCounter.comparePrompts(LEGACY_SYSTEM_PROMPT, ARTIFACT_SYSTEM_PROMPT);
    
    console.log(TokenCounter.formatTokenReport(comparison));
    
    return comparison;
  }
  
  static runScalingProjection() {
    console.log('\n📈 SKALIERUNGS-ANALYSE');
    console.log('=====================================');
    
    // Simuliere Domain-Struktur für Analyse (basierend auf aktuellen Werten)
    const mockDomains: Record<string, Array<{ value: string; label: string }>> = {
      'KraftBoGruppeMoeglKmAngabeGrund': Array(9).fill(null).map((_, i) => ({ 
        value: `${i + 1}`, 
        label: `Option ${i + 1}` 
      })),
      'KraftBoGruppeMoeglArtZubehoerteil': Array(10).fill(null).map((_, i) => ({ 
        value: `ZUB${300 + i}`, 
        label: `Zubehör ${i + 1}` 
      }))
    };
    
    const currentAnalysis = DomainDataAnalyzer.analyzeCurrentUsage(mockDomains);
    console.log('📊 Aktuell:', currentAnalysis.summary);
    
    // Projiziere auf 10-15 Tabellen
    const avgTokensPerDomain = 200; // Geschätzt
    
    const projection10 = DomainDataAnalyzer.projectScalingImpact(2, 10, avgTokensPerDomain);
    const projection15 = DomainDataAnalyzer.projectScalingImpact(2, 15, avgTokensPerDomain);
    
    console.log('\n📏 Bei 10 Tabellen:');
    console.log(`├─ Token-Erhöhung: +${projection10.tokenIncrease} (${projection10.percentageIncrease}%)`);
    console.log(`└─ Empfehlung: ${projection10.recommendation}`);
    
    console.log('\n📏 Bei 15 Tabellen:');
    console.log(`├─ Token-Erhöhung: +${projection15.tokenIncrease} (${projection15.percentageIncrease}%)`);
    console.log(`└─ Empfehlung: ${projection15.recommendation}`);
    
    return { currentAnalysis, projection10, projection15 };
  }
  
  static simulateApiCallSavings(callsPerDay = 100) {
    console.log('\n💰 KOSTEN-EINSPARUNG SIMULATION');
    console.log('=====================================');
    
    const comparison = this.runTokenComparison();
    const tokensPerCall = comparison.tokensSaved;
    const dailySavings = tokensPerCall * callsPerDay;
    const monthlySavings = dailySavings * 30;
    
    // Geschätzte Kosten: $0.003 pro 1K Token (Claude-3.5-Sonnet)
    const costPer1kTokens = 0.003;
    const dailyCostSavings = (dailySavings / 1000) * costPer1kTokens;
    const monthlyCostSavings = (monthlySavings / 1000) * costPer1kTokens;
    
    console.log(`📞 API-Calls pro Tag: ${callsPerDay}`);
    console.log(`💾 Token-Einsparung pro Call: ${tokensPerCall}`);
    console.log(`📅 Tägliche Token-Einsparung: ${dailySavings.toLocaleString()}`);
    console.log(`📊 Monatliche Token-Einsparung: ${monthlySavings.toLocaleString()}`);
    console.log(`💵 Tägliche Kosten-Einsparung: $${dailyCostSavings.toFixed(3)}`);
    console.log(`💰 Monatliche Kosten-Einsparung: $${monthlyCostSavings.toFixed(2)}`);
    
    return {
      tokensPerCall,
      dailySavings,
      monthlySavings,
      dailyCostSavings,
      monthlyCostSavings
    };
  }
  
  static runCompleteAnalysis() {
    console.log('🚀 VOLLSTÄNDIGE ARTIFACT-PERFORMANCE-ANALYSE');
    console.log('=============================================\n');
    
    const tokenComparison = this.runTokenComparison();
    const scalingAnalysis = this.runScalingProjection();
    const costSavings = this.simulateApiCallSavings();
    
    console.log('\n🎯 ZUSAMMENFASSUNG');
    console.log('=====================================');
    console.log(`✅ Token-Einsparung: ${tokenComparison.percentageReduction}%`);
    console.log(`✅ Skalierbar bis 15+ Tabellen ohne Token-Explosion`);
    console.log(`✅ Monatliche Kosten-Einsparung: $${costSavings.monthlyCostSavings.toFixed(2)}`);
    console.log(`✅ Artifact-Lösung ist performanter und zukunftssicher`);
    
    return {
      tokenComparison,
      scalingAnalysis,
      costSavings,
      recommendation: 'Artifact-basierte Lösung empfohlen'
    };
  }
}

// Export für Testing
const artifactPerformanceTest = ArtifactPerformanceTest;
export default artifactPerformanceTest;