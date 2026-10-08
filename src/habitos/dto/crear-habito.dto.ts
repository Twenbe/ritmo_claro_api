import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EstadoHabito, Frecuencia } from '../../generated/prisma/client';

export class CrearHabitoDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsEnum(EstadoHabito)
  estado?: EstadoHabito;

  @IsOptional()
  @IsEnum(Frecuencia)
  frecuencia?: Frecuencia;
}
