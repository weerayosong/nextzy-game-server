import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    let finalMessage = 'เกิดข้อผิดพลาดบางอย่างกับระบบ';

    // ตรวจสอบชนิดข้อมูล
    if (typeof exceptionResponse === 'string') {
      finalMessage = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      // แปลงเป็น object ที่มีโครงสร้างชัดเจน แทนการใช้ any
      const errObj = exceptionResponse as Record<string, unknown>;
      const msg = errObj.message;

      if (Array.isArray(msg) && msg.length > 0) {
        finalMessage = String(msg[0]);
      } else if (typeof msg === 'string') {
        finalMessage = msg;
      }
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: finalMessage,
    });
  }
}
