import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { erroresDeValidacion } from './common/validacion';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();

  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: erroresDeValidacion,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = app.get(ConfigService);
  await app.listen(config.get<number>('PORT') ?? 3000);
}

// Un fallo al arrancar (por ejemplo, base inalcanzable) termina el proceso
// con código 1 y un log legible, sin imprimir la cadena de conexión.
bootstrap().catch((error: unknown) => {
  new Logger('Bootstrap').error(
    'La aplicación no pudo arrancar',
    error instanceof Error ? error.stack : String(error),
  );
  process.exit(1);
});
