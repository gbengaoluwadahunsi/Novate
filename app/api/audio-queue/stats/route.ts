import { NextRequest, NextResponse } from 'next/server';
// import { AudioQueueService } from '@/lib/services/AudioQueueService';
import { logger } from '@/lib/logger';

// GET /api/audio-queue/stats - Get queue statistics
export async function GET() {
  return Response.json({ message: 'Audio queue service temporarily disabled' });
}
