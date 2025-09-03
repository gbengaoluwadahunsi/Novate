import { NextRequest, NextResponse } from 'next/server';
import { AudioQueueService } from '@/lib/services/AudioQueueService';
import { logger } from '@/lib/logger';

// POST /api/audio-queue/process - Process next item in queue
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, organizationId } = body;
    
    logger.info(`Processing next queue item for user: ${userId}, organization: ${organizationId}`);
    
    const nextItem = await AudioQueueService.processNextItem(userId, organizationId);
    
    if (!nextItem) {
      return NextResponse.json({
        success: true,
        message: 'No items in queue to process',
        hasItems: false
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Next item retrieved for processing',
      hasItems: true,
      queueItem: {
        id: nextItem._id,
        filename: nextItem.filename,
        originalName: nextItem.originalName,
        status: nextItem.status,
        priority: nextItem.priority,
        position: nextItem.position,
        audioUrl: nextItem.audioUrl,
        language: nextItem.language,
        patientInfo: nextItem.patientInfo,
        medicalContext: nextItem.medicalContext,
        startedAt: nextItem.startedAt,
        createdAt: nextItem.createdAt
      }
    });
    
  } catch (error) {
    logger.error('Failed to process next queue item:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process next queue item',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/audio-queue/process - Check if there are items to process
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const organizationId = searchParams.get('organizationId');
    
    logger.info(`Checking queue status for user: ${userId}, organization: ${organizationId}`);
    
    const nextItem = await AudioQueueService.getNextItem(userId || undefined, organizationId || undefined);
    
    return NextResponse.json({
      success: true,
      hasItems: !!nextItem,
      itemCount: nextItem ? 1 : 0,
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
