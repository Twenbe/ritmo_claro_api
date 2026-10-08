import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from './roles.decorator';
import { UsuarioAutenticado } from './jwt.strategy';

// Debe ejecutarse después de JwtAuthGuard, que deja request.user con el rol del token.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesPermitidos = this.reflector.getAllAndOverride(Roles, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!rolesPermitidos) {
      return true;
    }

    const { user } = context
      .switchToHttp()
      .getRequest<{ user?: UsuarioAutenticado }>();
    if (!user || !rolesPermitidos.includes(user.rol)) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a este recurso',
      );
    }
    return true;
  }
}
