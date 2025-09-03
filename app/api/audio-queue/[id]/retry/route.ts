import { NextRequest, NextResponse } from 'next/server';
// import { AudioQueueService } from '@/lib/services/AudioQueueService';
import { logger } from '@/lib/logger';

// POST /api/audio-queue/[id]/retry - Retry failed queue item
export async function POST() {
  return Response.json({ message: 'Audio queue service temporarily disabled' });
}
