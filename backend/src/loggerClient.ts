// backend/src/loggerClient.ts
import { Log } from '../../logging-middleware/src/index';

// Auth configuration for logging
const AUTH_CONFIG = {
  authUrl: 'http://20.244.56.144/evaluation-service/auth',
  authBody: {
    email: 'student@affordmed.com',
    name: 'Student Name',
    rollNo: 'YOUR_ROLL_NO',
    accessCode: 'ACCESS_CODE',
    clientID: 'CLIENT_ID', 
    clientSecret: 'CLIENT_SECRET'
  }
};

export async function logInfo(pkg: string, message: string, meta?: Record<string, any>) {
  await Log('backend', 'info', pkg, message, meta, AUTH_CONFIG);
}

export async function logError(pkg: string, message: string, meta?: Record<string, any>) {
  await Log('backend', 'error', pkg, message, meta, AUTH_CONFIG);
}

export async function logWarn(pkg: string, message: string, meta?: Record<string, any>) {
  await Log('backend', 'warn', pkg, message, meta, AUTH_CONFIG);
}

export async function logDebug(pkg: string, message: string, meta?: Record<string, any>) {
  await Log('backend', 'debug', pkg, message, meta, AUTH_CONFIG);
}
