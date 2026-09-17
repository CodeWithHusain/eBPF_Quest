/**
 * Structured Observability Logger
 * Outputs structured JSON logs in production, clean readable logs in dev.
 * Automatically scrubs sensitive keys (passwords, tokens, database URLs, auth cookies).
 */

const LOG_LEVELS = {
  DEBUG: 10,
  INFO: 20,
  WARN: 30,
  ERROR: 40,
};

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'secret',
  'authorization',
  'cookie',
  'sessiontoken',
  'database_url',
  'github_secret',
  'apikey',
  'credential',
]);

/**
 * Recursively scrub sensitive properties from objects
 */
export function sanitizeLogData(data) {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeLogData(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey) || lowerKey.includes('secret') || lowerKey.includes('password')) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeLogData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

class Logger {
  constructor(context = {}) {
    this.context = context;
    this.currentLevel = process.env.NODE_ENV === 'test' ? LOG_LEVELS.WARN : LOG_LEVELS.INFO;
  }

  child(additionalContext = {}) {
    return new Logger({
      ...this.context,
      ...additionalContext,
    });
  }

  _format(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const sanitizedMeta = sanitizeLogData(meta);
    const sanitizedContext = sanitizeLogData(this.context);

    return {
      timestamp,
      level,
      message,
      ...sanitizedContext,
      ...sanitizedMeta,
    };
  }

  _output(level, logPayload) {
    const isProd = process.env.NODE_ENV === 'production';
    if (isProd) {
      console.log(JSON.stringify(logPayload));
    } else {
      const prefix = `[${logPayload.timestamp}] [${logPayload.level}]`;
      const ctxStr = logPayload.requestId ? ` [req:${logPayload.requestId}]` : '';
      if (level === 'ERROR') {
        console.error(`${prefix}${ctxStr} ${logPayload.message}`, logPayload);
      } else if (level === 'WARN') {
        console.warn(`${prefix}${ctxStr} ${logPayload.message}`, logPayload);
      } else {
        console.log(`${prefix}${ctxStr} ${logPayload.message}`, logPayload);
      }
    }
  }

  debug(message, meta) {
    if (this.currentLevel <= LOG_LEVELS.DEBUG) {
      this._output('DEBUG', this._format('DEBUG', message, meta));
    }
  }

  info(message, meta) {
    if (this.currentLevel <= LOG_LEVELS.INFO) {
      this._output('INFO', this._format('INFO', message, meta));
    }
  }

  warn(message, meta) {
    if (this.currentLevel <= LOG_LEVELS.WARN) {
      this._output('WARN', this._format('WARN', message, meta));
    }
  }

  error(message, meta) {
    if (this.currentLevel <= LOG_LEVELS.ERROR) {
      this._output('ERROR', this._format('ERROR', message, meta));
    }
  }
}

export const logger = new Logger({ service: 'bpfquest' });
