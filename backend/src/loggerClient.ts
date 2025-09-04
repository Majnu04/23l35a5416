// backend/src/loggerClient.ts
import { Log } from '../../logging-middleware/src/index';

// Auth configuration for logging
const AUTH_CONFIG = {
  authUrl: 'http://20.244.56.144/evaluation-service/auth',
  authBody: {
    "email": "23l35a5416@gmail.com",
    "name": "nelam gowri sankar",
    "rollNo": "23l35a5416",
    "accessCode": "YzuJeU",
    "clientID": "82c72065-22e8-4bd4-a3e1-8b26d7713298",
    "clientSecret": "sxtVWfnVRGPVYJEA"
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

export async function logFatal(pkg: string, message: string, meta?: Record<string, any>) {
  await Log('backend', 'fatal', pkg, message, meta, AUTH_CONFIG);
}
