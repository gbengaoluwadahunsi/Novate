import { NextRequest, NextResponse } from 'next/server';
// import { AudioQueueService } from '@/lib/services/AudioQueueService';
import { logger } from '@/lib/logger';

// GET /api/audio-queue/[id] - Get specific queue item
export async function GET() {
  return Response.json({ message: 'Audio queue service temporarily disabled' });
}

// PUT /api/audio-queue/[id] - Update queue item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, priority, additionalData } = body;
    
    if (!status && !priority && !additionalData) {
      return NextResponse.json(
        { error: 'No update data provided' },
        { status: 400 }
      );
    }
    
    logger.info(`Updating queue item: ${id}`);
    
    let queueItem;
    
    if (status) {
      // queueItem = await AudioQueueService.updateStatus(id, status, additionalData);
    } else if (priority) {
      // queueItem = await AudioQueueService.updatePriority(id, priority);
    }
    
    if (!queueItem) {
      return NextResponse.json(
        { error: 'Failed to update queue item' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Queue item updated successfully',
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
    logger.error('Failed to update queue item:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update queue item',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/audio-queue/[id] - Remove item from queue
export async function DELETE() {
  return Response.json({ message: 'Audio queue service temporarily disabled' });
}
