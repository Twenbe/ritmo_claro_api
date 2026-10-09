import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorRespuestaDto } from '../common/dto/error-respuesta.dto';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsuarioRespuestaDto } from './dto/usuario-respuesta.dto';
import { TokenRespuestaDto } from './dto/token-respuesta.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Crear una cuenta',
    description:
      'Ruta pública. El servidor asigna siempre el rol USUARIO; enviar rol u otro campo no declarado responde 400.',
  })
  @ApiCreatedResponse({
    description: 'Cuenta creada (sin passwordHash)',
    type: UsuarioRespuestaDto,
  })
  @ApiBadRequestResponse({
    description: 'Datos inválidos o campos no permitidos',
    type: ErrorRespuestaDto,
  })
  @ApiConflictResponse({
    description: 'El email ya está registrado (sin distinguir mayúsculas)',
    type: ErrorRespuestaDto,
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Ruta pública. Entrega un JWT válido por 1 hora para usar con el botón Authorize.',
  })
  @ApiOkResponse({
    description: 'Credenciales válidas',
    type: TokenRespuestaDto,
  })
  @ApiBadRequestResponse({
    description: 'Datos con formato inválido',
    type: ErrorRespuestaDto,
  })
  @ApiUnauthorizedResponse({
    description:
      'Credenciales inválidas (mismo mensaje si el email no existe o la contraseña falla)',
    type: ErrorRespuestaDto,
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
