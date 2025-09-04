export type Stack = 'backend' | 'frontend';
export type Level = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export declare function Log(stack: Stack, level: Level, pkg: string, message: string, meta?: Record<string, any>, opts?: {
    authUrl?: string;
    authBody?: any;
    logUrl?: string;
}): Promise<void>;
//# sourceMappingURL=index.d.ts.map