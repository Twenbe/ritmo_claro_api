import {
  IsEnum,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import { EstadoHabito, Frecuencia } from '../../generated/prisma/client';

export class CrearHabitoDto {
  @IsString({ message: 'El nombre debe ser un texto' })
  @Length(3, 120, {
    message: 'El nombre debe tener entre 3 y 120 caracteres',
  })
  nombre!: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  @MaxLength(500, {
    message: 'La descripción no puede superar 500 caracteres',
  })
  descripcion?: string;

  @IsOptional()
  @IsEnum(EstadoHabito, {
    message: `El estado debe ser uno de: ${Object.values(EstadoHabito).join(', ')}`,
  })
  estado?: EstadoHabito;

  @IsOptional()
  @IsEnum(Frecuencia, {
    message: `La frecuencia debe ser una de: ${Object.values(Frecuencia).join(', ')}`,
  })
  frecuencia?: Frecuencia;
}
