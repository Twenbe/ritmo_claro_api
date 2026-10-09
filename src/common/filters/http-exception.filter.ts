import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Prisma } from '../../generated/prisma/client';

type ErrorTraducido = { status: number; message: string | string[] };

const ERRORES_PRISMA: Record<string, ErrorTraducido> = {
  P2002: {
    status: HttpStatus.CONFLICT,
    message: 'Ya existe un registro con ese valor único',
  },
  P2025: { status: HttpStatus.NOT_FOUND, message: 'Recurso no encontrado' },
};

const ERROR_INTERNO: ErrorTraducido = {
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  message: 'Error interno del servidor',
};

// Contrato único de error: { statusCode, timestamp, path, message }.
// Lo inesperado responde 500 genérico y el detalle queda solo en el log.
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { status, message } = this.traducir(exception, request);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }

  private traducir(exception: unknown, request: Request): ErrorTraducido {
    if (exception instanceof HttpException) {
      return { status: exception.getStatus(), message: mensajeHttp(exception) };
    }

    if (
      exception instanceof Prisma.PrismaClientKnownRequestError &&
      exception.code in ERRORES_PRISMA
    ) {
      return ERRORES_PRISMA[exception.code];
    }

    // El código (p. ej. ECONNREFUSED o P1001) no aparece en el stack de Prisma.
    const { code } = (exception ?? {}) as { code?: unknown };
    const codigo =
      typeof code === 'string' || typeof code === 'number' ? code : undefined;
    const tipo = exception instanceof Error ? exception.name : typeof exception;
    this.logger.error(
      `${request.method} ${request.url} -> ${tipo}${codigo ? ` [${String(codigo)}]` : ''}`,
      exception instanceof Error ? exception.stack : String(exception),
    );
    return ERROR_INTERNO;
  }
}

function mensajeHttp(exception: HttpException): string | string[] {
  // JSON mal formado: Nest convierte el SyntaxError del parser en un
  // BadRequestException con el texto de V8 (en inglés y con la posición).
  if (
    exception instanceof BadRequestException &&
    /\bJSON\b/.test(exception.message)
  ) {
    return 'El cuerpo de la petición no es un JSON válido';
  }

  // Ruta inexistente: Nest responde "Cannot GET /x" en inglés.
  if (
    exception instanceof NotFoundException &&
    exception.message.startsWith('Cannot ')
  ) {
    return 'Ruta no encontrada';
  }

  const cuerpo = exception.getResponse();
  if (typeof cuerpo === 'string') {
    return cuerpo;
  }
  const { message } = cuerpo as { message?: string | string[] };
  return message ?? exception.message;
}
