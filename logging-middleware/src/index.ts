
// Conditional import for fetch - use node-fetch in Node.js, global fetch in browsers
let fetchFunction: typeof fetch;

if (typeof window !== 'undefined') {
  // Browser environment - use global fetch
  fetchFunction = window.fetch.bind(window);
} else {
  // Node.js environment - use node-fetch
  const nodeFetch = require('node-fetch');
  fetchFunction = nodeFetch;
}

export type Stack = 'backend' | 'frontend';
export type Level = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

const ALLOWED = {
  stack: ['backend', 'frontend'],
  level: ['debug', 'info', 'warn', 'error', 'fatal'],
  backendPackages: [
    'cache','controller','cron_job','db','domain','handler','repository','route','service',
  ],
  frontendPackages: ['api','component','hook','page','state','style'],
  both: ['auth','config','middleware','utils']
};

let token: string | null = null;
let tokenExpiry = 0;

async function obtainToken(authUrl: string, authBody: any) {
  try {
    const res = await fetchFunction(authUrl, {
      method: 'POST', 
      headers: {'Content-Type':'application/json'}, 
      body: JSON.stringify(authBody)
    });
    const data = await res.json();
    if (data && data.access_token) {
      token = data.access_token;
      // expires_in may be seconds or timestamp; here we assume seconds
      tokenExpiry = Date.now() + ((data.expires_in || 3600) * 1000);
      return token;
    }
  } catch (e) {
    // fail silently (do not block app) — store token null
    return null;
  }
}

function isAllowedPackage(pkg: string, stack: Stack) {
  if (ALLOWED.both.includes(pkg)) return true;
  if (stack === 'backend') return ALLOWED.backendPackages.includes(pkg);
  return ALLOWED.frontendPackages.includes(pkg);
}

export async function Log(
  stack: Stack,
  level: Level,
  pkg: string,
  message: string,
  meta?: Record<string, any>,
  opts?: { authUrl?: string; authBody?: any; logUrl?: string }
) {
  // Validate enums
  if (!ALLOWED.stack.includes(stack)) throw new Error('invalid stack');
  if (!ALLOWED.level.includes(level)) throw new Error('invalid level');
  if (!isAllowedPackage(pkg, stack)) throw new Error('invalid package for stack');

  const logPayload: any = { stack, level, package: pkg, message };
  if (meta) logPayload.meta = meta;

  const logUrl = opts?.logUrl || 'http://20.244.56.144/evaluation-service/logs';

  // Get token if missing or expired
  if ((!token || Date.now() > tokenExpiry) && opts?.authUrl && opts?.authBody) {
    await obtainToken(opts.authUrl, opts.authBody);
  }

  const headers: any = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    await fetchFunction(logUrl, { 
      method: 'POST', 
      headers, 
      body: JSON.stringify(logPayload) 
    });
  } catch (e) {
    // noop: (as per requirement, do not block app)
  }
}
