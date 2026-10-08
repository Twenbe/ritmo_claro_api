import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './jwt.strategy';

const RONDAS_BCRYPT = 10;
const EMAIL_REGISTRADO = 'El email ya está registrado';
const CREDENCIALES_INVALIDAS = 'Credenciales inválidas';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = normalizarEmail(dto.email);

    const existente = await this.prisma.usuario.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existente) {
      throw new ConflictException(EMAIL_REGISTRADO);
    }

    const passwordHash = await bcrypt.hash(dto.password, RONDAS_BCRYPT);

    try {
      return await this.prisma.usuario.create({
        data: { nombre: dto.nombre, email, passwordHash },
        select: {
          id: true,
          nombre: true,
          email: true,
          rol: true,
          creadoEn: true,
        },
      });
    } catch (error) {
      // Dos registros simultáneos pueden pasar la verificación previa;
      // la restricción única de la base decide y se traduce a 409.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(EMAIL_REGISTRADO);
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: normalizarEmail(dto.email) },
    });
    if (!usuario) {
      throw new UnauthorizedException(CREDENCIALES_INVALIDAS);
    }

    const passwordOk = await bcrypt.compare(dto.password, usuario.passwordHash);
    if (!passwordOk) {
      throw new UnauthorizedException(CREDENCIALES_INVALIDAS);
    }

    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    };
    return { access_token: await this.jwtService.signAsync(payload) };
  }
}

function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}
