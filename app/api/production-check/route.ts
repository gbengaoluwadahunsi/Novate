import { NextResponse } from 'next/server';
import { runProductionReadinessCheck, generateProductionReport } from '@/lib/production-ready-utils';
import { detectDuplicateNotes, cleanupDuplicateNotes, generateDatabaseHealthReport } from '@/lib/database-cleanup';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    logger.info('🔍 Starting comprehensive production readiness check...');
    
    // Run production readiness assessment
    const productionReport = await runProductionReadinessCheck();
    
    // Run database health check
    const databaseReport = await generateDatabaseHealthReport();
    
    // Generate comprehensive report
    const fullReport = {
      production: productionReport,
      database: databaseReport,
      timestamp: new Date().toISOString(),
      summary: {
        overallStatus: productionReport.status === 'production-ready' && databaseReport.status === 'healthy' ? 
          'ready' : 
          productionReport.status === 'not-ready' || databaseReport.status === 'critical' ? 
            'not-ready' : 
            'needs-attention',
        productionScore: productionReport.score,
        databaseHealth: databaseReport.status,
        totalChecks: productionReport.summary.total,
        criticalIssues: productionReport.checks.filter(c => c.priority === 'critical' && c.status === 'fail').length,
        duplicateNotes: databaseReport.summary.duplicatesFound
      }
    };
    
    logger.info('✅ Production readiness check completed:', fullReport.summary);
    
    return NextResponse.json({
      success: true,
      report: fullReport
    });
    
  } catch (error) {
    logger.error('❌ Error during production readiness check:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to run production readiness check',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { action } = await request.json();
    
    if (action === 'cleanup-database') {
      logger.info('🧹 Starting database cleanup...');
      
      // Run database cleanup
      const cleanupResult = await cleanupDuplicateNotes({ dryRun: false });
      
      return NextResponse.json({
        success: true,
        cleanup: cleanupResult
      });
      
    } else if (action === 'generate-report') {
      logger.info('📄 Generating production report...');
      
      const productionReport = await runProductionReadinessCheck();
      const databaseReport = await generateDatabaseHealthReport();
      
      const markdownReport = generateProductionReport(productionReport);
      
      return NextResponse.json({
        success: true,
        report: {
          markdown: markdownReport,
          production: productionReport,
          database: databaseReport
        }
      });
      
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "cleanup-database" or "generate-report"' },
        { status: 400 }
      );
    }
    
  } catch (error) {
    logger.error('❌ Error during production action:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to execute production action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}