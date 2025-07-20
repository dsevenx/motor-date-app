// Token-Counting Utilities für Performance-Monitoring
export class TokenCounter {
  private static readonly TOKENS_PER_CHAR = 0.25; // Approximation für deutsche Texte
  
  static estimateTokens(text: string): number {
    // Einfache Schätzung basierend auf Zeichen
    return Math.ceil(text.length * this.TOKENS_PER_CHAR);
  }
  
  static comparePrompts(oldPrompt: string, newPrompt: string) {
    const oldTokens = this.estimateTokens(oldPrompt);
    const newTokens = this.estimateTokens(newPrompt);
    const difference = oldTokens - newTokens;
    const percentageReduction = ((difference / oldTokens) * 100).toFixed(1);
    
    return {
      oldTokens,
      newTokens,
      tokensSaved: difference,
      percentageReduction: parseFloat(percentageReduction),
      summary: `Token-Einsparung: ${difference} Tokens (${percentageReduction}%)`
    };
  }
  
  static formatTokenReport(comparison: ReturnType<typeof TokenCounter.comparePrompts>) {
    return `
📊 TOKEN-PERFORMANCE-REPORT:
├─ Alter System Prompt: ${comparison.oldTokens} Tokens
├─ Neuer System Prompt: ${comparison.newTokens} Tokens
├─ Einsparung: ${comparison.tokensSaved} Tokens
├─ Prozentualer Gewinn: ${comparison.percentageReduction}%
└─ Status: ${comparison.percentageReduction > 0 ? '✅ Optimiert' : '❌ Erhöht'}
    `.trim();
  }
}

// Domain-Data-Analyzer für weitere Optimierungen
export class DomainDataAnalyzer {
  static analyzeCurrentUsage(domains: Record<string, Array<{ value: string; label: string }>>) {
    let totalOptions = 0;
    let estimatedTokens = 0;
    
    Object.entries(domains).forEach(([, options]) => {
      totalOptions += options.length;
      
      // Schätze Token für jede Option (VALUE + LABEL + Formatierung)
      options.forEach(option => {
        const optionText = `VALUE: "${option.value}" = LABEL: "${option.label}"`;
        estimatedTokens += TokenCounter.estimateTokens(optionText);
      });
    });
    
    return {
      domainCount: Object.keys(domains).length,
      totalOptions,
      estimatedTokens,
      averageOptionsPerDomain: Math.round(totalOptions / Object.keys(domains).length),
      summary: `${Object.keys(domains).length} Domains, ${totalOptions} Optionen, ~${estimatedTokens} Tokens`
    };
  }
  
  static projectScalingImpact(currentDomains: number, targetDomains: number, tokensPerDomain: number) {
    const currentTokens = currentDomains * tokensPerDomain;
    const targetTokens = targetDomains * tokensPerDomain;
    const increase = targetTokens - currentTokens;
    const percentageIncrease = ((increase / currentTokens) * 100).toFixed(1);
    
    return {
      currentTokens,
      targetTokens,
      tokenIncrease: increase,
      percentageIncrease: parseFloat(percentageIncrease),
      warning: parseFloat(percentageIncrease) > 50,
      recommendation: parseFloat(percentageIncrease) > 50 
        ? 'Artifact-Lösung dringend empfohlen!' 
        : 'Moderate Token-Erhöhung'
    };
  }
}

// Real-time Performance Monitor
export class PerformanceMonitor {
  private static metrics = {
    apiCalls: 0,
    totalTokensSaved: 0,
    artifactAccess: 0,
    fallbackUsage: 0,
    avgResponseTime: 0,
    responseTimeSum: 0
  };
  
  static recordAPICall(tokensSaved: number, responseTime: number) {
    this.metrics.apiCalls++;
    this.metrics.totalTokensSaved += tokensSaved;
    this.metrics.responseTimeSum += responseTime;
    this.metrics.avgResponseTime = this.metrics.responseTimeSum / this.metrics.apiCalls;
  }
  
  static recordArtifactSuccess() {
    this.metrics.artifactAccess++;
  }
  
  static recordFallback() {
    this.metrics.fallbackUsage++;
  }
  
  static getReport() {
    const successRate = this.metrics.artifactAccess + this.metrics.fallbackUsage > 0
      ? (this.metrics.artifactAccess / (this.metrics.artifactAccess + this.metrics.fallbackUsage)) * 100
      : 0;
    
    return {
      ...this.metrics,
      artifactSuccessRate: Math.round(successRate),
      avgTokensSavedPerCall: this.metrics.apiCalls > 0 
        ? Math.round(this.metrics.totalTokensSaved / this.metrics.apiCalls) 
        : 0,
      summary: `${this.metrics.apiCalls} API-Calls, ${this.metrics.totalTokensSaved} Tokens gespart, ${Math.round(successRate)}% Artifact-Erfolg`
    };
  }
  
  static reset() {
    this.metrics = {
      apiCalls: 0,
      totalTokensSaved: 0,
      artifactAccess: 0,
      fallbackUsage: 0,
      avgResponseTime: 0,
      responseTimeSum: 0
    };
  }
  
  static formatReport() {
    const report = this.getReport();
    return `
🚀 PERFORMANCE-MONITOR:
├─ API-Calls: ${report.apiCalls}
├─ Tokens gespart: ${report.totalTokensSaved} (Ø ${report.avgTokensSavedPerCall}/Call)
├─ Artifact-Erfolgsrate: ${report.artifactSuccessRate}%
├─ Ø Response-Zeit: ${Math.round(report.avgResponseTime)}ms
├─ Fallback-Nutzung: ${report.fallbackUsage}
└─ Status: ${report.artifactSuccessRate > 80 ? '✅ Optimal' : report.artifactSuccessRate > 60 ? '⚠️ Acceptable' : '❌ Problematic'}
    `.trim();
  }
}

const tokenCounterUtils = {
  TokenCounter,
  DomainDataAnalyzer,
  PerformanceMonitor
};

export default tokenCounterUtils;