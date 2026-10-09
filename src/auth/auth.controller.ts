import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RespuestaError } from '../common/swagger/respuesta-error.decorator';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsuarioRespuestaDto } from './dto/usuario-respuesta.dto';
import { TokenRespuestaDto } from './dto/token-respuesta.dto';

const JSON_INVALIDO = 'El cuerpo de la petición no es un JSON válido';

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
  @RespuestaError(
    400,
    'Datos inválidos, campos no permitidos o JSON mal formado',
    {
      nombreCorto: {
        resumen: 'Nombre de menos de 2 caracteres',
        path: '/auth/register',
        message: ['El nombre debe tener al menos 2 caracteres'],
      },
      emailInvalido: {
        resumen: 'Email con formato inválido',
        path: '/auth/register',
        message: ['El email no tiene un formato válido'],
      },
      passwordCorta: {
        resumen: 'Contraseña de menos de 8 caracteres',
        path: '/auth/register',
        message: ['La contraseña debe tener al menos 8 caracteres'],
      },
      campoRol: {
        resumen: 'Se envió el campo rol',
        path: '/auth/register',
        message: ['El campo rol no está permitido'],
      },
      jsonInvalido: {
        resumen: 'JSON mal formado',
        path: '/auth/register',
        message: JSON_INVALIDO,
      },
    },
  )
  @RespuestaError(
    409,
    'El email ya está registrado (sin distinguir mayúsculas)',
    {
      emailRepetido: {
        resumen: 'Email ya registrado',
        path: '/auth/register',
        message: 'El email ya está registrado',
      },
    },
  )
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
  @RespuestaError(400, 'Datos con formato inválido o JSON mal formado', {
    emailInvalido: {
      resumen: 'Email con formato inválido',
      path: '/auth/login',
      message: ['El email no tiene un formato válido'],
    },
    jsonInvalido: {
      resumen: 'JSON mal formado',
      path: '/auth/login',
      message: JSON_INVALIDO,
    },
  })
  @RespuestaError(
    401,
    'Credenciales inválidas (mismo mensaje si el email no existe o la contraseña falla)',
    {
      credencialesInvalidas: {
        resumen: 'Email inexistente o contraseña incorrecta',
        path: '/auth/login',
        message: 'Credenciales inválidas',
      },
    },
  )
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
