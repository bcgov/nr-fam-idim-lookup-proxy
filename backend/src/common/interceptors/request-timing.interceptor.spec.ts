import {
    CallHandler,
    ExecutionContext,
    Logger,
} from '@nestjs/common';
import { lastValueFrom, of, throwError } from 'rxjs';
import {
    REQUEST_TIMING_OPERATION,
    RequestTimingInterceptor,
} from './request-timing.interceptor';

class DummyController {
    searchIdirUsers(): void {
        return;
    }
}

function createExecutionContext(): ExecutionContext {
    const controllerClass = DummyController;
    const handler = controllerClass.prototype.searchIdirUsers;

    return {
        getClass: () => controllerClass,
        getHandler: () => handler,
    } as unknown as ExecutionContext;
}

describe('RequestTimingInterceptor', () => {
    let interceptor: RequestTimingInterceptor;
    let loggerLogSpy: jest.SpyInstance;
    let loggerWarnSpy: jest.SpyInstance;

    beforeEach(() => {
        interceptor = new RequestTimingInterceptor();
        loggerLogSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
        loggerWarnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    });

    afterEach(() => {
        loggerLogSpy.mockRestore();
        loggerWarnSpy.mockRestore();
    });

    it('should log completion duration for successful execution', async () => {
        const context = createExecutionContext();
        const handler = context.getHandler();
        Reflect.defineMetadata(REQUEST_TIMING_OPERATION, 'searchIdirUsers controller request', handler);

        const callHandler: CallHandler = {
            handle: () => of({ ok: true }),
        };

        const result = await lastValueFrom(interceptor.intercept(context, callHandler));

        expect(result).toEqual({ ok: true });
        expect(
            loggerLogSpy.mock.calls.some(
                ([message]) =>
                    typeof message === 'string' &&
                    message.includes('searchIdirUsers controller request completed in '),
            ),
        ).toBe(true);
    });

    it('should log failure duration when execution throws', async () => {
        const context = createExecutionContext();
        const handler = context.getHandler();
        Reflect.defineMetadata(REQUEST_TIMING_OPERATION, 'searchIdirUsers controller request', handler);

        const callHandler: CallHandler = {
            handle: () => throwError(() => new Error('boom')),
        };

        await expect(lastValueFrom(interceptor.intercept(context, callHandler))).rejects.toThrow('boom');
        expect(
            loggerWarnSpy.mock.calls.some(
                ([message]) =>
                    typeof message === 'string' &&
                    message.includes('searchIdirUsers controller request failed in '),
            ),
        ).toBe(true);
    });
});