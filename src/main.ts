import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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

  const documento = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Ritmo Claro API')
      .setDescription(
        'API de gestión de hábitos de bienestar. Registra una cuenta, inicia sesión y pega el access_token en Authorize para probar las rutas de /habitos. Todos los errores responden { statusCode, timestamp, path, message }.',
      )
      .setVersion('1.0.0')
      .addTag('auth', 'Registro e inicio de sesión (rutas públicas)')
      .addTag(
        'habitos',
        'Hábitos propios y listado administrativo (requiere JWT)',
      )
      .addBearerAuth()
      .build(),
  );
  SwaggerModule.setup('docs', app, documento);

  // 0.0.0.0: dentro de un contenedor la app debe aceptar conexiones de fuera,
  // no solo de su propio localhost. PORT lo define el entorno (Render lo inyecta).
  const config = app.get(ConfigService);
  await app.listen(config.get<number>('PORT') ?? 3000, '0.0.0.0');
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
