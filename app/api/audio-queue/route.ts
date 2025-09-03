import { NextRequest, NextResponse } from 'next/server';
// import { AudioQueueService } from '@/lib/services/AudioQueueService';
import { logger } from '@/lib/logger';

// GET /api/audio-queue - Get user's audio queue
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const organizationId = searchParams.get('organizationId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    logger.info(`Getting audio queue for user: ${userId}`);
    
    // const queue = await AudioQueueService.getUserQueue(userId, organizationId || undefined);
    
    return NextResponse.json({
      success: true,
      // queue,
      // count: queue.length
      message: 'Audio queue service temporarily disabled'
    });
    
  } catch (error) {
    logger.error('Failed to get audio queue:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get audio queue',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/audio-queue - Add audio file to queue
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      organizationId,
      filename,
      originalName,
      fileSize,
      fileType,
      audioUrl,
      language,
      priority,
      patientInfo,
      medicalContext
    } = body;
    
    // Validate required fields
    if (!userId || !filename || !originalName || !fileSize || !fileType || !audioUrl) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          required: ['userId', 'filename', 'originalName', 'fileSize', 'fileType', 'audioUrl']
        },
        { status: 400 }
      );
    }
    
    logger.info(`Adding audio file to queue: ${filename} for user: ${userId}`);
    
    // const queueItem = await AudioQueueService.addToQueue({
    //   userId,
    //   organizationId,
    //   filename,
    //   originalName,
    //   fileSize,
    //   fileType,
    //   audioUrl,
    //   language: language || 'en-US',
    //   priority,
    //   patientInfo,
    //   medicalContext
    // });
    
    return NextResponse.json({
      success: true,
      message: 'Audio file added to queue successfully',
      // queueItem: {
      //   id: queueItem._id,
      //   filename: queueItem.filename,
      //   status: queueItem.status,
      //   priority: queueItem.priority,
      //   position: queueItem.position,
      //   createdAt: queueItem.createdAt
      // }
      message: 'Audio queue service temporarily disabled'
    }, { status: 201 });
    
  } catch (error) {
    logger.error('Failed to add audio file to queue:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add audio file to queue',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
