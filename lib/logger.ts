// Production-ready logging system
// Automatically disables console logs in production

interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  data?: any;
  stack?: string;
}

class Logger {
  private isDevelopment: boolean;
  private logs: LogEntry[] = [];
  private maxLogs = 100; // Keep only last 100 logs in memory

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private createLogEntry(level: LogEntry['level'], message: string, data?: any, error?: Error): LogEntry {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      stack: error?.stack
    };

    // Store in memory (for debugging if needed)
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    return entry;
  }

  debug(message: string, data?: any) {
    const entry = this.createLogEntry('debug', message, data);
    
    // Only log to console in development
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${entry.timestamp}: ${entry.message}`, data || '');
    }
  }

  info(message: string, data?: any) {
    const entry = this.createLogEntry('info', message, data);
    
    // Only log to console in development
    if (this.isDevelopment) {
      console.log(`[INFO] ${entry.timestamp}: ${entry.message}`, data || '');
    }
  }

  warn(message: string, data?: any) {
    const entry = this.createLogEntry('warn', message, data);
    
    // Always log warnings (but can be configured)
    if (this.isDevelopment) {
      console.warn(`[WARN] ${entry.timestamp}: ${entry.message}`, data || '');
    }
  }

  error(message: string, error?: Error | any, data?: any) {
    const entry = this.createLogEntry('error', message, data, error instanceof Error ? error : undefined);
    
    // Always log errors
    console.error(`[ERROR] ${entry.timestamp}: ${entry.message}`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      data
    });

    // In production, you might want to send errors to a monitoring service
    if (!this.isDevelopment && typeof window !== 'undefined') {
      // TODO: Send to error monitoring service (Sentry, LogRocket, etc.)
      // this.sendToMonitoringService(entry);
    }
  }

  // Get recent logs for debugging
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Clear stored logs
  clearLogs() {
    this.logs = [];
  }

  // Production-safe console methods that are automatically disabled
  prodLog(message: string, data?: any) {
    if (this.isDevelopment) {
      console.log(message, data);
    }
  }

  prodWarn(message: string, data?: any) {
    if (this.isDevelopment) {
      console.warn(message, data);
    }
  }

  prodError(message: string, error?: any) {
    // Always log errors, but format appropriately for production
    if (this.isDevelopment) {
      console.error(message, error);
    } else {
      console.error(message); // Don't expose sensitive error details in production
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience methods for easy migration
export const log = {
  debug: (message: string, data?: any) => logger.debug(message, data),
  info: (message: string, data?: any) => logger.info(message, data),
  warn: (message: string, data?: any) => logger.warn(message, data),
  error: (message: string, error?: any, data?: any) => logger.error(message, error, data),
  
  // Production-safe methods (automatically disabled in production)
  dev: (message: string, data?: any) => logger.prodLog(message, data),
  devWarn: (message: string, data?: any) => logger.prodWarn(message, data),
  devError: (message: string, error?: any) => logger.prodError(message, error),
};

// For backward compatibility
export default logger; 