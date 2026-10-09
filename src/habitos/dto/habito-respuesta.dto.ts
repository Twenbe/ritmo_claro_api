import { ApiProperty } from '@nestjs/swagger';
import { EstadoHabito, Frecuencia } from '../../generated/prisma/client';

// Respuestas de /habitos (solo documentación). Reflejan los select del service.
export class HabitoRespuestaDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Leer 20 minutos' })
  nombre!: string;

  @ApiProperty({ example: 'Antes de dormir', nullable: true, type: String })
  descripcion!: string | null;

  @ApiProperty({
    enum: EstadoHabito,
    enumName: 'EstadoHabito',
    example: EstadoHabito.ACTIVO,
  })
  estado!: EstadoHabito;

  @ApiProperty({
    enum: Frecuencia,
    enumName: 'Frecuencia',
    example: Frecuencia.DIARIA,
  })
  frecuencia!: Frecuencia;

  @ApiProperty({ format: 'uuid', description: 'Dueño, tomado del JWT' })
  usuarioId!: string;

  @ApiProperty({ format: 'date-time' })
  creadoEn!: Date;
}

export class UsuarioResumenDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Ana Pérez' })
  nombre!: string;
}

export class HabitoAdminRespuestaDto extends HabitoRespuestaDto {
  @ApiProperty({
    type: UsuarioResumenDto,
    description: 'Solo id y nombre del dueño; nunca email ni passwordHash',
  })
  usuario!: UsuarioResumenDto;
}
