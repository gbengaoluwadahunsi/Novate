// Production-ready logger utility
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  data?: any
  timestamp: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'

  private formatMessage(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true
    
    // In production, only log warnings and errors
    if (this.isProduction) {
      return level === 'warn' || level === 'error'
    }
    
    return true
  }

  debug(message: string, data?: any) {
    if (this.shouldLog('debug')) {
      const entry = this.formatMessage('debug', message, data)
      console.log(`[DEBUG] ${entry.timestamp}: ${entry.message}`, data || '')
    }
  }

  info(message: string, data?: any) {
    if (this.shouldLog('info')) {
      const entry = this.formatMessage('info', message, data)
      console.log(`[INFO] ${entry.timestamp}: ${entry.message}`, data || '')
    }
  }

  warn(message: string, data?: any) {
    if (this.shouldLog('warn')) {
      const entry = this.formatMessage('warn', message, data)
      console.warn(`[WARN] ${entry.timestamp}: ${entry.message}`, data || '')
    }
  }

  error(message: string, error?: any) {
    if (this.shouldLog('error')) {
      const entry = this.formatMessage('error', message, error)
      console.error(`[ERROR] ${entry.timestamp}: ${entry.message}`, error || '')
      
      // In production, you might want to send this to an error reporting service
      // Example: Sentry.captureException(error, { extra: { message } })
    }
  }
}

export const logger = new Logger() 