import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { HabitosModule } from './habitos/habitos.module';

const VARIABLES_OBLIGATORIAS = ['DATABASE_URL', 'JWT_SECRET'];

// Falla al arrancar si falta una variable obligatoria o está vacía.
// El mensaje nombra la variable, nunca su valor.
function validarEntorno(config: Record<string, unknown>) {
  for (const nombre of VARIABLES_OBLIGATORIAS) {
    const valor = config[nombre];
    if (typeof valor !== 'string' || valor.trim() === '') {
      throw new Error(`Falta la variable de entorno ${nombre}`);
    }
  }
  return config;
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validarEntorno }),
    PrismaModule,
    AuthModule,
    HabitosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
