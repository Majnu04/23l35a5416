"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = void 0;
// Conditional import for fetch - use node-fetch in Node.js, global fetch in browsers
let fetchFunction;
if (typeof window !== 'undefined') {
    // Browser environment - use global fetch
    fetchFunction = window.fetch.bind(window);
}
else {
    // Node.js environment - use node-fetch
    const nodeFetch = require('node-fetch');
    fetchFunction = nodeFetch;
}
const ALLOWED = {
    stack: ['backend', 'frontend'],
    level: ['debug', 'info', 'warn', 'error', 'fatal'],
    backendPackages: [
        'cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service',
    ],
    frontendPackages: ['api', 'component', 'hook', 'page', 'state', 'style'],
    both: ['auth', 'config', 'middleware', 'utils']
};
let token = null;
let tokenExpiry = 0;
async function obtainToken(authUrl, authBody) {
    try {
        const res = await fetchFunction(authUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(authBody)
        });
        const data = await res.json();
        if (data && data.access_token) {
            token = data.access_token;
            // expires_in may be seconds or timestamp; here we assume seconds
            tokenExpiry = Date.now() + ((data.expires_in || 3600) * 1000);
            return token;
        }
    }
    catch (e) {
        // fail silently (do not block app) — store token null
        return null;
    }
}
function isAllowedPackage(pkg, stack) {
    if (ALLOWED.both.includes(pkg))
        return true;
    if (stack === 'backend')
        return ALLOWED.backendPackages.includes(pkg);
    return ALLOWED.frontendPackages.includes(pkg);
}
async function Log(stack, level, pkg, message, meta, opts) {
    // Validate enums
    if (!ALLOWED.stack.includes(stack))
        throw new Error('invalid stack');
    if (!ALLOWED.level.includes(level))
        throw new Error('invalid level');
    if (!isAllowedPackage(pkg, stack))
        throw new Error('invalid package for stack');
    const logPayload = { stack, level, package: pkg, message };
    if (meta)
        logPayload.meta = meta;
    const logUrl = opts?.logUrl || 'http://20.244.56.144/evaluation-service/logs';
    // Get token if missing or expired
    if ((!token || Date.now() > tokenExpiry) && opts?.authUrl && opts?.authBody) {
        await obtainToken(opts.authUrl, opts.authBody);
    }
    const headers = { 'Content-Type': 'application/json' };
    if (token)
        headers['Authorization'] = `Bearer ${token}`;
    try {
        await fetchFunction(logUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(logPayload)
        });
    }
    catch (e) {
        // noop: (as per requirement, do not block app)
    }
}
exports.Log = Log;
//# sourceMappingURL=index.js.map