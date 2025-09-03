import { NextRequest, NextResponse } from 'next/server';
import { AudioQueueService } from '@/lib/services/AudioQueueService';
import { logger } from '@/lib/logger';

// POST /api/audio-queue/cleanup - Clean up old queue items
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { daysOld = 30 } = body;
    
    if (typeof daysOld !== 'number' || daysOld < 1) {
      return NextResponse.json(
        { error: 'daysOld must be a positive number' },
        { status: 400 }
      );
    }
    
    logger.info(`Cleaning up queue items older than ${daysOld} days`);
    
    const cleanedCount = await AudioQueueService.cleanupOldItems(daysOld);
    
    return NextResponse.json({
      success: true,
      message: `Cleaned up ${cleanedCount} old queue items`,
      cleanedCount,
      daysOld,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Failed to cleanup old queue items:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to cleanup old queue items',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/audio-queue/cleanup - Get cleanup recommendations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const daysOld = parseInt(searchParams.get('daysOld') || '30');
    
    logger.info(`Getting cleanup recommendations for items older than ${daysOld} days`);
    
    // This would need to be implemented in the service
    // For now, return a placeholder response
    return NextResponse.json({
      success: true,
      message: 'Cleanup recommendations endpoint - to be implemented',
      daysOld,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Failed to get cleanup recommendations:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get cleanup recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
