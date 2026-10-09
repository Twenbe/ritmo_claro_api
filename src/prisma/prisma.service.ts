import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(config: ConfigService) {
    super({
      adapter: new PrismaPg({
        connectionString: config.getOrThrow<string>('DATABASE_URL'),
      }),
    });
  }

  async onModuleInit() {
    await this.$connect();
    // Con el adapter PrismaPg, $connect() no abre una conexión real: el pool
    // conecta en la primera consulta. Esta consulta obliga a conectarse para
    // que la app no arranque si la base no responde.
    try {
      await this.$queryRaw`SELECT 1`;
    } catch (error) {
      const { code } = error as { code?: unknown };
      this.logger.error(
        `No se pudo conectar a la base de datos al arrancar [${typeof code === 'string' ? code : 'sin código'}]`,
      );
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
