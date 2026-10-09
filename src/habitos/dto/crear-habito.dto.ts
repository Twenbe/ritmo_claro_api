import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import { EstadoHabito, Frecuencia } from '../../generated/prisma/client';

export class CrearHabitoDto {
  @ApiProperty({ example: 'Leer 20 minutos', minLength: 3, maxLength: 120 })
  @IsString({ message: 'El nombre debe ser un texto' })
  @Length(3, 120, {
    message: 'El nombre debe tener entre 3 y 120 caracteres',
  })
  nombre!: string;

  @ApiPropertyOptional({ example: 'Antes de dormir', maxLength: 500 })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  @MaxLength(500, {
    message: 'La descripción no puede superar 500 caracteres',
  })
  descripcion?: string;

  @ApiPropertyOptional({
    enum: EstadoHabito,
    enumName: 'EstadoHabito',
    description: 'Al crear, si se omite, el hábito inicia en ACTIVO',
  })
  @IsOptional()
  @IsEnum(EstadoHabito, {
    message: `El estado debe ser uno de: ${Object.values(EstadoHabito).join(', ')}`,
  })
  estado?: EstadoHabito;

  @ApiPropertyOptional({
    enum: Frecuencia,
    enumName: 'Frecuencia',
    description: 'Al crear, si se omite, el hábito inicia en DIARIA',
  })
  @IsOptional()
  @IsEnum(Frecuencia, {
    message: `La frecuencia debe ser una de: ${Object.values(Frecuencia).join(', ')}`,
  })
  frecuencia?: Frecuencia;
}
