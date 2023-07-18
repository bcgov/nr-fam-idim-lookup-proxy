import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const key = this.extractApiKeyFromHeader(request);

        if (!key || key != process.env.API_KEY) {
            throw new UnauthorizedException();
        }

        return true;
    }

    private extractApiKeyFromHeader(request: Request): string | undefined {
        const key = request.header('x-api-key');
        return key as string;
    }
}
