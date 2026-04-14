import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
    Logger,
} from '@nestjs/common';
import { Observable, catchError, finalize, throwError } from 'rxjs';
import { formatElapsedDuration } from '../util';

export const REQUEST_TIMING_OPERATION = 'request-timing:operation';

/**
 * Interceptor that logs the elapsed time for controller method execution.
 * Logs completion or failure with duration using the Nest logger.
 */
@Injectable()
export class RequestTimingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(RequestTimingInterceptor.name);

    /**
     * @param context Provides details about the current request, including handler and class.
     * @param next Gives access to the route handler and its response stream.
     */
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const startedAt = process.hrtime.bigint();
        const className = context.getClass().name;
        const handlerName = context.getHandler().name;
        const operationName: string =
            Reflect.getMetadata(REQUEST_TIMING_OPERATION, context.getHandler()) ??
            `${className}.${handlerName} request`;

        let hasFailed = false;

        return next.handle().pipe(
            catchError((error) => {
                hasFailed = true;
                return throwError(() => error);
            }),
            finalize(() => {
                const elapsedMilliseconds = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
                const elapsed = formatElapsedDuration(elapsedMilliseconds);
                if (hasFailed) {
                    this.logger.warn(`${operationName} failed in ${elapsed}`);
                    return;
                }

                this.logger.log(`${operationName} completed in ${elapsed}`);
            }),
        );
    }
}