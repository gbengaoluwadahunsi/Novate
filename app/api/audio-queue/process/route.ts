import { NextRequest, NextResponse } from 'next/server';
// import { AudioQueueService } from '@/lib/services/AudioQueueService';
import { logger } from '@/lib/logger';

// POST /api/audio-queue/process - Process next item in queue
export async function POST() {
  return Response.json({ message: 'Audio queue service temporarily disabled' });
}

// GET /api/audio-queue/process - Check if there are items to process
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const organizationId = searchParams.get('organizationId');
    
    logger.info(`Checking queue status for user: ${userId}, organization: ${organizationId}`);
    
    // const nextItem = await AudioQueueService.getNextItem(userId || undefined, organizationId || undefined);
    
    return NextResponse.json({
      success: true,
      hasItems: false, // Placeholder, as AudioQueueService is disabled
      itemCount: 0,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Failed to check queue status:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check queue status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
