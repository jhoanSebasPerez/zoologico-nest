import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
    BadRequestException,
    UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errors: string[] = [];

        console.log(exception);

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const responseMessage = exception.getResponse()


            if (exception instanceof BadRequestException && Array.isArray(responseMessage['message'])) {
                message = 'Validation failed';
                errors = responseMessage['message'];
            }

            else if (exception instanceof UnauthorizedException) {
                message = 'Unauthorized';
                errors = [typeof responseMessage === 'string' ? responseMessage : responseMessage['message']];
            }

            else {
                message = typeof responseMessage === 'string' ? responseMessage : responseMessage['message'];
                errors = [message];
            }
        } else {
            errors = [message];
        }

        this.logger.error(`❌ Error: ${message}`, JSON.stringify(exception));

        response.status(status).json({
            statusCode: status,
            message,
            errors,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}