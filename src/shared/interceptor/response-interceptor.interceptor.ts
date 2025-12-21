import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FastifyReply } from 'fastify';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<{
    success: boolean;
    statusCode: number;
    data: unknown;
  }> {
    return next.handle().pipe(
      map((data: unknown) => ({
        success: true,
        statusCode: _context.switchToHttp().getResponse<FastifyReply>()
          .statusCode,
        data,
      })),
    );
  }
}
