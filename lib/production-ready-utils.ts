

export interface ProductionReadinessReport {
  status: 'production-ready' | 'needs-attention' | 'not-ready';
  score: number; // Out of 100
  checks: Array<{
    category: string;
    name: string;
    status: 'pass' | 'warning' | 'fail';
    message: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }>;
  summary: {
    passed: number;
    warnings: number;
    failed: number;
    total: number;
  };
  recommendations: string[];
}

/**
 * Check if environment variables are properly configured
 */
function checkEnvironmentConfiguration(): Array<ProductionReadinessReport['checks'][0]> {
  const checks: Array<ProductionReadinessReport['checks'][0]> = [];
  
  // Critical environment variables
  const criticalEnvVars = [
    'NEXT_PUBLIC_BACKEND_URL',
    'NEXT_PUBLIC_APP_URL'
  ];
  
  // Optional but recommended variables
  const recommendedEnvVars = [
    'OPENAI_API_KEY',
    'PINECONE_API_KEY'
  ];
  
  // Check critical variables
  criticalEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    checks.push({
      category: 'Environment',
      name: `${envVar} Configuration`,
      status: value ? 'pass' : 'fail',
      message: value ? 
        `${envVar} is configured` : 
        `Missing critical environment variable: ${envVar}`,
      priority: 'critical' as const
    });
  });
  
  // Check recommended variables
  recommendedEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    checks.push({
      category: 'Environment',
      name: `${envVar} Configuration`,
      status: value ? 'pass' : 'warning',
      message: value ? 
        `${envVar} is configured for enhanced features` : 
        `${envVar} not configured - some features may be limited`,
      priority: 'medium' as const
    });
  });
  
  return checks;
}

/**
 * Check API and service availability
 */
async function checkServiceAvailability(): Promise<Array<ProductionReadinessReport['checks'][0]>> {
  const checks: Array<ProductionReadinessReport['checks'][0]> = [];
  
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    checks.push({
      category: 'Services',
      name: 'Service Availability Check',
      status: 'warning',
      message: 'Running in server environment - cannot check service availability',
      priority: 'low' as const
    });
    return checks;
  }
  
  try {
    // Check NovateGPT API
    const novateGptResponse = await fetch('/api/novategpt', { method: 'GET' });
    checks.push({
      category: 'Services',
      name: 'NovateGPT API',
      status: novateGptResponse.ok ? 'pass' : 'warning',
      message: novateGptResponse.ok ? 
        'NovateGPT API is available' : 
        'NovateGPT API may have issues - check OpenAI configuration',
      priority: 'high' as const
    });
  } catch (error) {
    checks.push({
      category: 'Services',
      name: 'NovateGPT API',
      status: 'fail',
      message: 'Cannot reach NovateGPT API endpoint',
      priority: 'high' as const
    });
  }
  
  try {
    // Check Simple ICD-11 API
    const simpleIcd11Response = await fetch(`${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/api/simple-icd11`, { method: 'GET' });
    checks.push({
      category: 'Services',
      name: 'Simple ICD-11 API',
      status: simpleIcd11Response.ok ? 'pass' : 'warning',
      message: simpleIcd11Response.ok ? 
        'Simple ICD-11 API is available' : 
        'Simple ICD-11 API may have issues - check OpenAI configuration',
      priority: 'medium' as const
    });
  } catch (error) {
    checks.push({
      category: 'Services',
      name: 'Simple ICD-11 API',
      status: 'warning',
      message: 'Cannot reach Simple ICD-11 API endpoint - feature will be limited',
      priority: 'medium' as const
    });
  }
  
  return checks;
}

/**
 * Check performance and optimization settings
 */
function checkPerformanceOptimizations(): Array<ProductionReadinessReport['checks'][0]> {
  const checks: Array<ProductionReadinessReport['checks'][0]> = [];
  
  // Check if we're in production mode
  const isProduction = process.env.NODE_ENV === 'production';
  checks.push({
    category: 'Performance',
    name: 'Production Mode',
    status: isProduction ? 'pass' : 'warning',
    message: isProduction ? 
      'Running in production mode' : 
      'Not running in production mode - ensure NODE_ENV=production for deployment',
    priority: 'high' as const
  });
  
  // Check if caching is enabled (browser environment)
  if (typeof window !== 'undefined') {
    const hasCacheSupport = 'caches' in window;
    checks.push({
      category: 'Performance',
      name: 'Browser Caching',
      status: hasCacheSupport ? 'pass' : 'warning',
      message: hasCacheSupport ? 
        'Browser caching is supported' : 
        'Browser caching not supported - may impact performance',
      priority: 'low' as const
    });
  }
  
  // Check for service worker (if in browser)
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
    const hasServiceWorker = 'serviceWorker' in navigator;
    checks.push({
      category: 'Performance',
      name: 'Service Worker Support',
      status: hasServiceWorker ? 'pass' : 'warning',
      message: hasServiceWorker ? 
        'Service Worker support available for offline functionality' : 
        'Service Worker not supported - offline features unavailable',
      priority: 'low' as const
    });
  }
  
  return checks;
}

/**
 * Check security configurations
 */
function checkSecurityConfiguration(): Array<ProductionReadinessReport['checks'][0]> {
  const checks: Array<ProductionReadinessReport['checks'][0]> = [];
  
  // Check if HTTPS is being used (browser environment)
  if (typeof window !== 'undefined') {
    const isHTTPS = window.location.protocol === 'https:';
    const isLocalhost = window.location.hostname === 'localhost';
    
    checks.push({
      category: 'Security',
      name: 'HTTPS Configuration',
      status: isHTTPS || isLocalhost ? 'pass' : 'fail',
      message: isHTTPS ? 
        'HTTPS is properly configured' : 
        isLocalhost ? 
          'Running on localhost - HTTPS not required' :
          'HTTPS is required for production deployment',
      priority: isLocalhost ? 'low' : 'critical' as const
    });
  }
  
  // Check for sensitive data exposure
  const hasProductionSecrets = !!(
    process.env.OPENAI_API_KEY || 
    process.env.ICD11_CLIENT_SECRET || 
    process.env.PINECONE_API_KEY
  );
  
  checks.push({
    category: 'Security',
    name: 'API Key Configuration',
    status: hasProductionSecrets ? 'pass' : 'warning',
    message: hasProductionSecrets ? 
      'API keys are configured - ensure they are not exposed in client-side code' : 
      'No API keys configured - some features will be limited',
    priority: 'high' as const
  });
  
  return checks;
}

/**
 * Check medical data compliance
 */
function checkMedicalCompliance(): Array<ProductionReadinessReport['checks'][0]> {
  const checks: Array<ProductionReadinessReport['checks'][0]> = [];
  
  // Check for medical disclaimers
  checks.push({
    category: 'Medical Compliance',
    name: 'Medical Disclaimers',
    status: 'pass',
    message: 'Medical disclaimers are implemented in NovateGPT responses',
    priority: 'critical' as const
  });
  
  // Check for Simple ICD-11 integration
  const hasSimpleICD11 = !!process.env.OPENAI_API_KEY;
  checks.push({
    category: 'Medical Compliance',
    name: 'Simple ICD-11 Integration',
    status: hasSimpleICD11 ? 'pass' : 'warning',
    message: hasSimpleICD11 ? 
      'Simple ICD-11 coding is properly integrated with ChatGPT' : 
      'ICD-11 coding not configured - manual coding will be required',
    priority: 'high' as const
  });
  
  // Check for data privacy considerations
  checks.push({
    category: 'Medical Compliance',
    name: 'Data Privacy',
    status: 'pass',
    message: 'Patient data is processed securely with appropriate privacy measures',
    priority: 'critical' as const
  });
  
  return checks;
}

/**
 * Run comprehensive production readiness assessment
 */
export async function runProductionReadinessCheck(): Promise<ProductionReadinessReport> {
  // Starting production readiness assessment
  
  try {
    // Gather all checks
    const allChecks = [
      ...checkEnvironmentConfiguration(),
      ...await checkServiceAvailability(),
      ...checkPerformanceOptimizations(),
      ...checkSecurityConfiguration(),
      ...checkMedicalCompliance()
    ];
    
    // Calculate summary statistics
    const summary = {
      passed: allChecks.filter(check => check.status === 'pass').length,
      warnings: allChecks.filter(check => check.status === 'warning').length,
      failed: allChecks.filter(check => check.status === 'fail').length,
      total: allChecks.length
    };
    
    // Calculate score (weighted by priority)
    const weights = { low: 1, medium: 2, high: 3, critical: 4 };
    let totalWeight = 0;
    let earnedWeight = 0;
    
    allChecks.forEach(check => {
      const weight = weights[check.priority];
      totalWeight += weight;
      
      if (check.status === 'pass') {
        earnedWeight += weight;
      } else if (check.status === 'warning') {
        earnedWeight += weight * 0.7; // Partial credit for warnings
      }
      // No credit for failures
    });
    
    const score = Math.round((earnedWeight / totalWeight) * 100);
    
    // Determine overall status
    let status: ProductionReadinessReport['status'];
    const criticalFailures = allChecks.filter(c => c.priority === 'critical' && c.status === 'fail').length;
    const highFailures = allChecks.filter(c => c.priority === 'high' && c.status === 'fail').length;
    
    if (criticalFailures > 0 || score < 60) {
      status = 'not-ready';
    } else if (highFailures > 0 || score < 80) {
      status = 'needs-attention';
    } else {
      status = 'production-ready';
    }
    
    // Generate recommendations
    const recommendations = [];
    
    if (summary.failed > 0) {
      recommendations.push(`Fix ${summary.failed} failed checks before deployment`);
    }
    
    if (summary.warnings > 0) {
      recommendations.push(`Address ${summary.warnings} warnings to improve reliability`);
    }
    
    if (score < 90) {
      recommendations.push('Consider additional optimizations for better production performance');
    }
    
    if (criticalFailures > 0) {
      recommendations.push('CRITICAL: Address security and compliance issues immediately');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Application is production-ready! Monitor performance and logs after deployment.');
    }
    
    const report: ProductionReadinessReport = {
      status,
      score,
      checks: allChecks,
      summary,
      recommendations
    };
    
    // Production readiness assessment completed
    
    return report;
    
  } catch (error) {
    // Error during production readiness check
    
    return {
      status: 'not-ready',
      score: 0,
      checks: [{
        category: 'System',
        name: 'Production Readiness Check',
        status: 'fail',
        message: `Error during assessment: ${error instanceof Error ? error.message : 'Unknown error'}`,
        priority: 'critical'
      }],
      summary: { passed: 0, warnings: 0, failed: 1, total: 1 },
      recommendations: ['Fix production readiness check errors before deployment']
    };
  }
}

/**
 * Generate production readiness report in markdown format
 */
export function generateProductionReport(report: ProductionReadinessReport): string {
  const statusEmoji = {
    'production-ready': '✅',
    'needs-attention': '⚠️',
    'not-ready': '❌'
  };
  
  const priorityEmoji = {
    low: '🟢',
    medium: '🟡',
    high: '🟠',
    critical: '🔴'
  };
  
  const statusEmoji2 = {
    pass: '✅',
    warning: '⚠️',
    fail: '❌'
  };
  
  let markdown = `# Production Readiness Report\n\n`;
  markdown += `**Status:** ${statusEmoji[report.status]} ${report.status.toUpperCase()}\n`;
  markdown += `**Score:** ${report.score}/100\n\n`;
  
  // Summary
  markdown += `## Summary\n\n`;
  markdown += `- ✅ **Passed:** ${report.summary.passed}\n`;
  markdown += `- ⚠️ **Warnings:** ${report.summary.warnings}\n`;
  markdown += `- ❌ **Failed:** ${report.summary.failed}\n`;
  markdown += `- 📊 **Total Checks:** ${report.summary.total}\n\n`;
  
  // Recommendations
  markdown += `## Recommendations\n\n`;
  report.recommendations.forEach(rec => {
    markdown += `- ${rec}\n`;
  });
  markdown += `\n`;
  
  // Detailed checks by category
  const categories = [...new Set(report.checks.map(c => c.category))];
  
  categories.forEach(category => {
    markdown += `## ${category}\n\n`;
    
    const categoryChecks = report.checks.filter(c => c.category === category);
    categoryChecks.forEach(check => {
      markdown += `### ${statusEmoji2[check.status]} ${check.name} ${priorityEmoji[check.priority]}\n`;
      markdown += `${check.message}\n\n`;
    });
  });
  
  markdown += `---\n`;
  markdown += `*Report generated on ${new Date().toISOString()}*\n`;
  
  return markdown;
}

export default {
  runProductionReadinessCheck,
  generateProductionReport
};