import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Passport responde "Unauthorized" en inglés; se reemplaza por un mensaje
  // en español que no distingue entre token ausente, alterado o vencido.
  handleRequest<TUser>(err: unknown, user: TUser | false): TUser {
    if (err || !user) {
      throw new UnauthorizedException(
        'No autenticado: el token falta, no es válido o expiró',
      );
    }
    return user;
  }
}
