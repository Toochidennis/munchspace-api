import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';

type ErrorResponse =
  | string
  | string[]
  | {
      message?: string | string[];
      error?: string;
      statusCode?: number;
    };

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    const isHttpException = exception instanceof HttpException;

    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    let error: ErrorResponse = 'Internal server error';

    if (isHttpException) {
      const res = exception.getResponse();

      if (typeof res === 'string') {
        error = res;
      } else if (typeof res === 'object' && res !== null) {
        const body = res as {
          message?: string | string[];
          error?: string;
          statusCode?: number;
        };
        error = body.message ?? body;
      }
    }

    response.status(status).send({
      success: false,
      statusCode: status,
      error,
    });
  }
}
