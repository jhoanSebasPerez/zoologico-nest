import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {

    handleRequest(err: Error | null, user: any, info: any): any {
        if (err || !user) {
            let errorMessage = 'Unauthorized access. Please provide a valid token.';

            if (info && info.name === 'TokenExpiredError') {
                errorMessage = 'Token has expired. Please login again.';
            }

            if (info && info.name === 'JsonWebTokenError') {
                errorMessage = 'Invalid token. Please provide a valid JWT.';
            }

            throw new UnauthorizedException(errorMessage);
        }

        return user;
    }
}