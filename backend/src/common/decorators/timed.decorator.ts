import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import {
    REQUEST_TIMING_OPERATION,
    RequestTimingInterceptor,
} from '../interceptors/request-timing.interceptor';

export function Timed(operationName?: string): MethodDecorator {
    if (!operationName) {
        return applyDecorators(UseInterceptors(RequestTimingInterceptor));
    }

    return applyDecorators(
        SetMetadata(REQUEST_TIMING_OPERATION, operationName),
        UseInterceptors(RequestTimingInterceptor),
    );
}