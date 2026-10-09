import { ApiProperty } from '@nestjs/swagger';

// Contrato de error que produce HttpExceptionFilter (solo documentación).
export class ErrorRespuestaDto {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({ example: '2026-10-08T12:00:00.000Z', format: 'date-time' })
  timestamp!: string;

  @ApiProperty({ example: '/habitos' })
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
      },
    ],
  })
  message!: string | string[];
}
