type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  userId?: string;
  connectionId?: string;
}

class WebSocketLogger {
  private static instance: WebSocketLogger;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;
  private isEnabled: boolean = process.env.NODE_ENV === 'development';

  private constructor() {}

  static getInstance(): WebSocketLogger {
    if (!WebSocketLogger.instance) {
      WebSocketLogger.instance = new WebSocketLogger();
    }
    return WebSocketLogger.instance;
  }

  private createLogEntry(level: LogLevel, message: string, data?: any, userId?: string, connectionId?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      userId,
      connectionId,
    };
  }

  private addLog(entry: LogEntry) {
    if (!this.isEnabled) return;

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const consoleMethod = entry.level === 'error' ? 'error' : entry.level === 'warn' ? 'warn' : 'log';
      console[consoleMethod](
        `[WebSocket ${entry.level.toUpperCase()}] ${entry.message}`,
        entry.data || '',
        entry.userId ? `(User: ${entry.userId})` : '',
        entry.connectionId ? `(Connection: ${entry.connectionId})` : ''
      );
    }
  }

  debug(message: string, data?: any, userId?: string, connectionId?: string) {
    this.addLog(this.createLogEntry('debug', message, data, userId, connectionId));
  }

  info(message: string, data?: any, userId?: string, connectionId?: string) {
    this.addLog(this.createLogEntry('info', message, data, userId, connectionId));
  }

  warn(message: string, data?: any, userId?: string, connectionId?: string) {
    this.addLog(this.createLogEntry('warn', message, data, userId, connectionId));
  }

  error(message: string, data?: any, userId?: string, connectionId?: string) {
    this.addLog(this.createLogEntry('error', message, data, userId, connectionId));
  }

  getLogs(level?: LogLevel, userId?: string, limit: number = 100): LogEntry[] {
    let filtered = this.logs;
    
    if (level) {
      filtered = filtered.filter(log => log.level === level);
    }
    
    if (userId) {
      filtered = filtered.filter(log => log.userId === userId);
    }
    
    return filtered.slice(0, limit);
  }

  clearLogs() {
    this.logs = [];
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }
}

export const wsLogger = WebSocketLogger.getInstance(); 