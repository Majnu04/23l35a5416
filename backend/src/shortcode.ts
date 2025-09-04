// backend/src/shortcode.ts
import { logDebug, logWarn } from './loggerClient';

export function generateShortcode(length: number = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  logDebug('utils', 'Generated new shortcode', { 
    shortcode: result, 
    length 
  });
  
  return result;
}

export function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string);
    logDebug('utils', 'URL validation successful', { 
      url: string,
      protocol: url.protocol,
      hostname: url.hostname 
    });
    return true;
  } catch (error) {
    logWarn('utils', 'URL validation failed', { 
      url: string,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return false;
  }
}

export function isValidShortcode(shortcode: string): boolean {
  const isValid = /^[A-Za-z0-9]{3,10}$/.test(shortcode);
  
  if (isValid) {
    logDebug('utils', 'Shortcode validation successful', { shortcode });
  } else {
    logWarn('utils', 'Shortcode validation failed', { 
      shortcode,
      reason: 'Must be 3-10 alphanumeric characters'
    });
  }
  
  return isValid;
}
