import { NextRequest, NextResponse } from 'next/server';
import { AudioQueueService } from '@/lib/services/AudioQueueService';
import { logger } from '@/lib/logger';

// POST /api/audio-queue/[id]/retry - Retry failed queue item
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    logger.info(`Retrying failed queue item: ${id}`);
    
    const queueItem = await AudioQueueService.retryItem(id);
    
    return NextResponse.json({
      success: true,
      message: 'Queue item retry initiated successfully',
      queueItem: {
        id: queueItem._id,
        filename: queueItem.filename,
        status: queueItem.status,
        priority: queueItem.priority,
        position: queueItem.position,
        retryCount: queueItem.retryCount,
        updatedAt: queueItem.updatedAt
      }
    });
    
  } catch (error) {
    logger.error('Failed to retry queue item:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retry queue item',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
