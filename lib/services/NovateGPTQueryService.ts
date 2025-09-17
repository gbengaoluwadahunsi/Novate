import { logger } from '@/lib/logger';

// For now, we'll implement a simple in-memory tracking system
// This can be replaced with proper database integration later
const queryTracking = new Map<string, {
  queriesUsed: number;
  lastReset: Date;
}>();

// Simple query limit tracking without database dependency
const getQueryUsage = (userId: string): number => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const userData = queryTracking.get(userId);
  if (!userData || userData.lastReset < startOfMonth) {
    // Reset for new month
    queryTracking.set(userId, {
      queriesUsed: 0,
      lastReset: startOfMonth
    });
    return 0;
  }
  
  return userData.queriesUsed;
};

const incrementQueryUsage = (userId: string): void => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const userData = queryTracking.get(userId);
  if (!userData || userData.lastReset < startOfMonth) {
    queryTracking.set(userId, {
      queriesUsed: 1,
      lastReset: startOfMonth
    });
  } else {
    userData.queriesUsed += 1;
  }
};

export interface QueryLimitInfo {
  canMakeQuery: boolean;
  queriesUsed: number;
  queriesLimit: number;
  remainingQueries: number;
  resetDate?: Date;
  subscriptionType: 'PAID' | 'FREE_TRIAL' | 'ADMIN_UNLIMITED' | 'NONE';
  needsUpgrade: boolean;
}

export interface CreateQueryRequest {
  userId: string;
  organizationId?: string;
  query: string;
  response: string;
  tokensUsed: number;
  model: string;
  processingTime: number;
  hasMedicalContext: boolean;
  conversationHistory?: any[];
  medicalContext?: any;
}

export class NovateGPTQueryService {
  /**
   * Get query limits based on subscription status
   */
  static getQueryLimits(subscriptionStatus: any): { limit: number; subscriptionType: string } {
    if (subscriptionStatus?.isAdminUnlimitedSubscriber) {
      return { limit: Infinity, subscriptionType: 'ADMIN_UNLIMITED' };
    }
    
    if (subscriptionStatus?.isPaidSubscriber) {
      return { limit: 1000, subscriptionType: 'PAID' }; // 1000 queries per month for paid users
    }
    
    if (subscriptionStatus?.isFreeSubscriber) {
      return { limit: 5, subscriptionType: 'FREE_TRIAL' }; // 5 queries for free trial users
    }
    
    return { limit: 3, subscriptionType: 'NONE' }; // 3 queries for non-subscribers
  }

  /**
   * Check if user can make a query based on their subscription and usage
   */
  static async checkQueryLimit(userId: string, subscriptionStatus: any): Promise<QueryLimitInfo> {
    try {
      const { limit, subscriptionType } = this.getQueryLimits(subscriptionStatus);
      
      // For unlimited users, always allow
      if (limit === Infinity) {
        return {
          canMakeQuery: true,
          queriesUsed: 0,
          queriesLimit: Infinity,
          remainingQueries: Infinity,
          subscriptionType: subscriptionType as any,
          needsUpgrade: false
        };
      }

      // Get current month's query count using in-memory tracking
      const queriesUsed = getQueryUsage(userId);
      const remainingQueries = Math.max(0, limit - queriesUsed);
      const canMakeQuery = remainingQueries > 0;
      const needsUpgrade = !canMakeQuery && subscriptionType !== 'PAID';

      // Calculate reset date (first day of next month)
      const resetDate = new Date();
      resetDate.setMonth(resetDate.getMonth() + 1);
      resetDate.setDate(1);
      resetDate.setHours(0, 0, 0, 0);

      return {
        canMakeQuery,
        queriesUsed,
        queriesLimit: limit,
        remainingQueries,
        resetDate,
        subscriptionType: subscriptionType as any,
        needsUpgrade
      };

    } catch (error) {
      logger.error('Error checking query limit:', error);
      // Default to allowing query if there's an error
      return {
        canMakeQuery: true,
        queriesUsed: 0,
        queriesLimit: 3,
        remainingQueries: 3,
        subscriptionType: 'NONE',
        needsUpgrade: false
      };
    }
  }

  /**
   * Create a new query record (in-memory tracking only for now)
   */
  static async createQuery(request: CreateQueryRequest): Promise<any> {
    try {
      // Increment query usage for the user
      incrementQueryUsage(request.userId);
      
      logger.info('NovateGPT query tracked:', {
        userId: request.userId,
        tokensUsed: request.tokensUsed,
        processingTime: request.processingTime,
        hasMedicalContext: request.hasMedicalContext
      });

      // Return a simple tracking record
      return {
        userId: request.userId,
        query: request.query,
        response: request.response,
        tokensUsed: request.tokensUsed,
        model: request.model,
        processingTime: request.processingTime,
        hasMedicalContext: request.hasMedicalContext,
        createdAt: new Date()
      };
    } catch (error) {
      logger.error('Error tracking NovateGPT query:', error);
      throw error;
    }
  }

  /**
   * Get user's query history (not available with in-memory tracking)
   */
  static async getUserQueryHistory(
    userId: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<{ queries: any[]; total: number; hasMore: boolean }> {
    // In-memory tracking doesn't store query history
    // This would need to be implemented with a proper database
    logger.warn('Query history not available with in-memory tracking');
    return { queries: [], total: 0, hasMore: false };
  }

  /**
   * Get query statistics for a user (limited with in-memory tracking)
   */
  static async getUserQueryStats(userId: string): Promise<{
    totalQueries: number;
    totalTokensUsed: number;
    averageProcessingTime: number;
    queriesThisMonth: number;
    queriesLastMonth: number;
  }> {
    try {
      const queriesThisMonth = getQueryUsage(userId);
      
      // In-memory tracking only provides current month data
      return {
        totalQueries: queriesThisMonth,
        totalTokensUsed: 0, // Not tracked in memory
        averageProcessingTime: 0, // Not tracked in memory
        queriesThisMonth,
        queriesLastMonth: 0 // Not available in memory
      };
    } catch (error) {
      logger.error('Error fetching user query stats:', error);
      return {
        totalQueries: 0,
        totalTokensUsed: 0,
        averageProcessingTime: 0,
        queriesThisMonth: 0,
        queriesLastMonth: 0
      };
    }
  }

  /**
   * Clean up old queries (in-memory tracking auto-resets monthly)
   */
  static async cleanupOldQueries(daysOld: number = 90): Promise<number> {
    try {
      // In-memory tracking automatically resets monthly
      // This method is kept for API compatibility
      logger.info('In-memory query tracking auto-resets monthly, no cleanup needed');
      return 0;
    } catch (error) {
      logger.error('Error in cleanup method:', error);
      return 0;
    }
  }
}
