import { ApiProperty } from '@nestjs/swagger';
import { Rol } from '../../generated/prisma/client';

// Respuesta de POST /auth/register (solo documentación). Nunca incluye passwordHash.
export class UsuarioRespuestaDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Ana Pérez' })
  nombre!: string;

  @ApiProperty({ example: 'ana@ejemplo.com' })
  email!: string;

  @ApiProperty({ enum: Rol, enumName: 'Rol', example: Rol.USUARIO })
  rol!: Rol;

  @ApiProperty({ format: 'date-time' })
  creadoEn!: Date;
}
