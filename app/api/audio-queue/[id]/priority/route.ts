import { NextRequest, NextResponse } from 'next/server';
import { AudioQueueService } from '@/lib/services/AudioQueueService';
import { logger } from '@/lib/logger';

// PUT /api/audio-queue/[id]/priority - Update queue item priority
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { priority } = body;
    
    if (!priority || !['urgent', 'high', 'normal', 'low'].includes(priority)) {
      return NextResponse.json(
        { 
          error: 'Invalid priority value',
          validPriorities: ['urgent', 'high', 'normal', 'low']
        },
        { status: 400 }
      );
    }
    
    logger.info(`Updating priority for queue item: ${id} to ${priority}`);
    
    const queueItem = await AudioQueueService.updatePriority(id, priority);
    
    return NextResponse.json({
      success: true,
      message: 'Priority updated successfully',
      queueItem: {
        id: queueItem._id,
        filename: queueItem.filename,
        status: queueItem.status,
        priority: queueItem.priority,
        position: queueItem.position,
        updatedAt: queueItem.updatedAt
      }
    });
    
  } catch (error) {
    logger.error('Failed to update queue item priority:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update priority',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
