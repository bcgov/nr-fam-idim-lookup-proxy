export function toErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    if (typeof error === 'object' && error !== null) {
        try {
            return JSON.stringify(error);
        } catch {
            return '[unserializable error object]';
        }
    }

    return String(error);
}


export type ExecutionTimingLogger = {
    log: (message: string) => unknown;
    warn: (message: string) => unknown;
};

export function formatElapsedDuration(elapsedMilliseconds: number): string {
    if (elapsedMilliseconds < 1000) {
        return `${elapsedMilliseconds.toFixed(1)}ms`; // 123.4ms
    }
    return `${(elapsedMilliseconds / 1000).toFixed(2)}s`; // 1.23s
}

export async function withExecutionTiming<T>(
    logger: ExecutionTimingLogger,
    operationName: string,
    operation: () => Promise<T>,
): Promise<T> {
    const startedAt = process.hrtime.bigint();

    try {
        const result = await operation();
        const elapsedMilliseconds = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
        logger.log(`${operationName} completed in ${formatElapsedDuration(elapsedMilliseconds)}`);
        return result;
    } catch (error) {
        const elapsedMilliseconds = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
        logger.warn(`${operationName} failed in ${formatElapsedDuration(elapsedMilliseconds)}`);
        throw error;
    }
}
