import { ApiProperty } from '@nestjs/swagger';

// Respuesta de POST /auth/login (solo documentación).
export class TokenRespuestaDto {
  @ApiProperty({
    description:
      'JWT firmado (HS256) con sub, email y rol; expira en 1 hora. Se envía como "Authorization: Bearer <token>".',
  })
  access_token!: string;
}
