import { NextRequest, NextResponse } from 'next/server';
import { AudioQueueService } from '@/lib/services/AudioQueueService';
import { logger } from '@/lib/logger';

// GET /api/audio-queue/stats - Get queue statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const organizationId = searchParams.get('organizationId');
    
    logger.info(`Getting queue stats for user: ${userId}, organization: ${organizationId}`);
    
    const stats = await AudioQueueService.getQueueStats(userId || undefined, organizationId || undefined);
    
    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Failed to get queue statistics:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get queue statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
