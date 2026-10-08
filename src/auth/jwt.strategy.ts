import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Rol } from '../generated/prisma/client';

export type JwtPayload = { sub: string; email: string; rol: Rol };

export type UsuarioAutenticado = { id: string; email: string; rol: Rol };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): UsuarioAutenticado {
    return { id: payload.sub, email: payload.email, rol: payload.rol };
  }
}
