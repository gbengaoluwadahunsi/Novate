import { AudioQueue, IAudioQueue } from '../models/AudioQueue';
import { logger } from '../logger';

export interface AddToQueueRequest {
  userId: string;
  organizationId?: string;
  filename: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  audioUrl: string;
  language?: string;
  priority?: 'urgent' | 'high' | 'normal' | 'low';
  patientInfo?: {
    name?: string;
    age?: number;
    gender?: string;
    patientId?: string;
  };
  medicalContext?: {
    chiefComplaint?: string;
    visitType?: 'consultation' | 'follow-up' | 'emergency' | 'routine';
    urgency?: 'immediate' | 'same-day' | 'next-day' | 'routine';
  };
}

export interface QueueItem {
  id: string;
  filename: string;
  originalName: string;
  status: string;
  priority: string;
  position: number;
  createdAt: Date;
  estimatedProcessingTime?: number;
  patientInfo?: any;
  medicalContext?: any;
  retryCount: number;
  lastError?: string;
}

export interface QueueStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  cancelled: number;
  averageProcessingTime: number;
  averageQueueTime: number;
}

export class AudioQueueService {
  /**
   * Add audio file to the processing queue
   */
  static async addToQueue(request: AddToQueueRequest): Promise<IAudioQueue> {
    try {
      logger.info(`Adding audio file to queue: ${request.filename} for user: ${request.userId}`);
      
      // Auto-assign priority based on medical context
      let priority = request.priority || 'normal';
      if (request.medicalContext?.urgency === 'immediate') {
        priority = 'urgent';
      } else if (request.medicalContext?.visitType === 'emergency') {
        priority = 'high';
      }
      
      const queueItem = new AudioQueue({
        ...request,
        priority,
        status: 'pending',
        retryCount: 0,
        maxRetries: 3
      });
      
      const savedItem = await queueItem.save();
      logger.info(`Audio file added to queue with ID: ${savedItem._id}`);
      
      return savedItem;
    } catch (error) {
      logger.error('Failed to add audio file to queue:', error);
      throw new Error(`Failed to add to queue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Get user's audio queue
   */
  static async getUserQueue(userId: string, organizationId?: string): Promise<QueueItem[]> {
    try {
      const query: any = { userId };
      if (organizationId) query.organizationId = organizationId;
      
      const queueItems = await AudioQueue.find(query)
        .sort({ priority: 1, position: 1, createdAt: 1 })
        .select('-audioUrl -transcriptionResult -errorDetails')
        .lean();
      
      return queueItems.map(item => ({
        id: item._id.toString(),
        filename: item.filename,
        originalName: item.originalName,
        status: item.status,
        priority: item.priority,
        position: item.position,
        createdAt: item.createdAt,
        estimatedProcessingTime: item.estimatedProcessingTime,
        patientInfo: item.patientInfo,
        medicalContext: item.medicalContext,
        retryCount: item.retryCount,
        lastError: item.lastError
      }));
    } catch (error) {
      logger.error('Failed to get user queue:', error);
      throw new Error(`Failed to get queue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Get next item to process from queue
   */
  static async getNextItem(userId?: string, organizationId?: string): Promise<IAudioQueue | null> {
    try {
      const nextItem = await AudioQueue.getNextItem(userId, organizationId);
      
      if (nextItem) {
        logger.info(`Next item to process: ${nextItem.filename} (ID: ${nextItem._id})`);
      } else {
        logger.info('No items in queue to process');
      }
      
      return nextItem;
    } catch (error) {
      logger.error('Failed to get next queue item:', error);
      throw new Error(`Failed to get next item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Update queue item status
   */
  static async updateStatus(
    itemId: string, 
    status: string, 
    additionalData?: any
  ): Promise<IAudioQueue> {
    try {
      const queueItem = await AudioQueue.findById(itemId);
      if (!queueItem) {
        throw new Error('Queue item not found');
      }
      
      await queueItem.updateStatus(status, additionalData);
      logger.info(`Updated queue item ${itemId} status to: ${status}`);
      
      return queueItem;
    } catch (error) {
      logger.error('Failed to update queue item status:', error);
      throw new Error(`Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Update item priority
   */
  static async updatePriority(
    itemId: string, 
    priority: 'urgent' | 'high' | 'normal' | 'low'
  ): Promise<IAudioQueue> {
    try {
      const queueItem = await AudioQueue.findById(itemId);
      if (!queueItem) {
        throw new Error('Queue item not found');
      }
      
      queueItem.priority = priority;
      await queueItem.save();
      
      logger.info(`Updated queue item ${itemId} priority to: ${priority}`);
      return queueItem;
    } catch (error) {
      logger.error('Failed to update queue item priority:', error);
      throw new Error(`Failed to update priority: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Remove item from queue
   */
  static async removeFromQueue(itemId: string): Promise<boolean> {
    try {
      const result = await AudioQueue.findByIdAndDelete(itemId);
      if (result) {
        logger.info(`Removed queue item: ${itemId}`);
        return true;
      } else {
        logger.warn(`Queue item not found for deletion: ${itemId}`);
        return false;
      }
    } catch (error) {
      logger.error('Failed to remove queue item:', error);
      throw new Error(`Failed to remove item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Retry failed item
   */
  static async retryItem(itemId: string): Promise<IAudioQueue> {
    try {
      const queueItem = await AudioQueue.findById(itemId);
      if (!queueItem) {
        throw new Error('Queue item not found');
      }
      
      if (queueItem.status !== 'failed') {
        throw new Error('Can only retry failed items');
      }
      
      await queueItem.retry();
      logger.info(`Retrying queue item: ${itemId}`);
      
      return queueItem;
    } catch (error) {
      logger.error('Failed to retry queue item:', error);
      throw new Error(`Failed to retry item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Get queue statistics
   */
  static async getQueueStats(userId?: string, organizationId?: string): Promise<QueueStats> {
    try {
      const query: any = {};
      if (userId) query.userId = userId;
      if (organizationId) query.organizationId = organizationId;
      
      const [total, pending, processing, completed, failed, cancelled] = await Promise.all([
        AudioQueue.countDocuments(query),
        AudioQueue.countDocuments({ ...query, status: 'pending' }),
        AudioQueue.countDocuments({ ...query, status: 'processing' }),
        AudioQueue.countDocuments({ ...query, status: 'completed' }),
        AudioQueue.countDocuments({ ...query, status: 'failed' }),
        AudioQueue.countDocuments({ ...query, status: 'cancelled' })
      ]);
      
      // Calculate average processing time for completed items
      const completedItems = await AudioQueue.find({ ...query, status: 'completed' })
        .select('startedAt completedAt')
        .lean();
      
      let averageProcessingTime = 0;
      if (completedItems.length > 0) {
        const totalTime = completedItems.reduce((sum, item) => {
          if (item.startedAt && item.completedAt) {
            return sum + (new Date(item.completedAt).getTime() - new Date(item.startedAt).getTime());
          }
          return sum;
        }, 0);
        averageProcessingTime = totalTime / completedItems.length;
      }
      
      // Calculate average queue time for completed items
      const totalQueueTime = completedItems.reduce((sum, item) => {
        return sum + (new Date(item.completedAt!).getTime() - new Date(item.createdAt).getTime());
      }, 0);
      const averageQueueTime = completedItems.length > 0 ? totalQueueTime / completedItems.length : 0;
      
      return {
        total,
        pending,
        processing,
        completed,
        failed,
        cancelled,
        averageProcessingTime,
        averageQueueTime
      };
    } catch (error) {
      logger.error('Failed to get queue statistics:', error);
      throw new Error(`Failed to get stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Clean up old completed/failed items
   */
  static async cleanupOldItems(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
      
      const result = await AudioQueue.deleteMany({
        status: { $in: ['completed', 'failed', 'cancelled'] },
        updatedAt: { $lt: cutoffDate }
      });
      
      logger.info(`Cleaned up ${result.deletedCount} old queue items`);
      return result.deletedCount || 0;
    } catch (error) {
      logger.error('Failed to cleanup old queue items:', error);
      throw new Error(`Failed to cleanup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Process next item in queue (for background workers)
   */
  static async processNextItem(userId?: string, organizationId?: string): Promise<IAudioQueue | null> {
    try {
      const nextItem = await this.getNextItem(userId, organizationId);
      if (!nextItem) {
        return null;
      }
      
      // Mark as processing
      await nextItem.updateStatus('processing');
      
      logger.info(`Started processing queue item: ${nextItem.filename}`);
      return nextItem;
    } catch (error) {
      logger.error('Failed to process next queue item:', error);
      throw new Error(`Failed to process item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Mark item as completed with results
   */
  static async markCompleted(
    itemId: string, 
    transcriptionResult: any, 
    noteId?: string,
    timeSaved?: number
  ): Promise<IAudioQueue> {
    try {
      const updateData: any = {
        transcriptionResult,
        timeSaved
      };
      
      if (noteId) {
        updateData.noteId = noteId;
      }
      
      const queueItem = await this.updateStatus(itemId, 'completed', updateData);
      logger.info(`Marked queue item as completed: ${itemId}`);
      
      return queueItem;
    } catch (error) {
      logger.error('Failed to mark queue item as completed:', error);
      throw new Error(`Failed to mark completed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Mark item as failed with error details
   */
  static async markFailed(
    itemId: string, 
    error: string, 
    errorDetails?: any
  ): Promise<IAudioQueue> {
    try {
      const updateData: any = {
        lastError: error,
        errorDetails
      };
      
      const queueItem = await this.updateStatus(itemId, 'failed', updateData);
      logger.info(`Marked queue item as failed: ${itemId} - ${error}`);
      
      return queueItem;
    } catch (error) {
      logger.error('Failed to mark queue item as failed:', error);
      throw new Error(`Failed to mark failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
