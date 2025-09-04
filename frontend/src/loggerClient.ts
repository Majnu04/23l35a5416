// frontend/src/loggerClient.ts
// Note: In a real implementation, you'd need to configure this properly
// For now, this is a stub that follows the logging middleware pattern

export type Level = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

// Stub implementation for frontend logging
export async function logInfo(pkg: string, message: string, meta?: Record<string, any>) {
  // In production, this would use the logging middleware
  console.log(`[INFO] ${pkg}: ${message}`, meta);
}

export async function logError(pkg: string, message: string, meta?: Record<string, any>) {
  // In production, this would use the logging middleware
  console.error(`[ERROR] ${pkg}: ${message}`, meta);
}

export async function logWarn(pkg: string, message: string, meta?: Record<string, any>) {
  // In production, this would use the logging middleware
  console.warn(`[WARN] ${pkg}: ${message}`, meta);
}

export async function logDebug(pkg: string, message: string, meta?: Record<string, any>) {
  // In production, this would use the logging middleware
  console.debug(`[DEBUG] ${pkg}: ${message}`, meta);
}
