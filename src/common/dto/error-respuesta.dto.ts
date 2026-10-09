import { ApiProperty } from '@nestjs/swagger';

// Contrato de error que produce HttpExceptionFilter (solo documentación).
// Los ejemplos de esta clase forman un caso real (404 en /habitos/:id); cada
// operación declara además sus propios ejemplos con RespuestaError.
export class ErrorRespuestaDto {
  @ApiProperty({ example: 404 })
  statusCode!: number;

  @ApiProperty({ example: '2026-10-08T12:00:00.000Z', format: 'date-time' })
  timestamp!: string;

  @ApiProperty({ example: '/habitos/0b8f6c1e-3d2a-4f7b-9c5e-1a2b3c4d5e6f' })
  path!: string;

  @ApiProperty({
    description:
      'Un mensaje, o una lista de mensajes cuando falla la validación de datos',
    oneOf: [
      { type: 'string', example: 'Hábito no encontrado' },
      {
        type: 'array',
        items: { type: 'string' },
        example: ['El nombre debe tener entre 3 y 120 caracteres'],
        description: 'Solo en errores 400 de validación',
      },
    ],
  })
  message!: string | string[];
}
