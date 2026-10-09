import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UsuarioActual } from '../auth/usuario-actual.decorator';
import type { UsuarioAutenticado } from '../auth/jwt.strategy';
import { Rol } from '../generated/prisma/client';
import {
  RespuestaError,
  UUID_EJEMPLO,
} from '../common/swagger/respuesta-error.decorator';
import { HabitosService } from './habitos.service';
import { CrearHabitoDto } from './dto/crear-habito.dto';
import { ActualizarHabitoDto } from './dto/actualizar-habito.dto';
import {
  HabitoAdminRespuestaDto,
  HabitoRespuestaDto,
} from './dto/habito-respuesta.dto';

// D-09: un id sin formato UUID responde 400 antes de consultar la base.
const ID_UUID = new ParseUUIDPipe({
  exceptionFactory: () =>
    new BadRequestException('El id debe ser un UUID válido'),
});

// Ejemplos de error de Swagger: cada uno con el path de su ruta y el
// mensaje real que devuelve la API.
const RUTA_ID = `/habitos/${UUID_EJEMPLO}`;
const PARAM_ID = ApiParam({
  name: 'id',
  format: 'uuid',
  description: 'Id del hábito (UUID)',
});
const sinToken = (path: string) =>
  RespuestaError(401, 'Falta el token, no es válido o expiró', {
    sinToken: {
      resumen: 'Sin token, token alterado o vencido',
      path,
      message: 'No autenticado: el token falta, no es válido o expiró',
    },
  });
const ID_INVALIDO = {
  resumen: 'El id no tiene formato UUID',
  path: '/habitos/abc',
  message: 'El id debe ser un UUID válido',
};
const JSON_INVALIDO = (path: string) => ({
  resumen: 'JSON mal formado',
  path,
  message: 'El cuerpo de la petición no es un JSON válido',
});
const HABITO_AJENO = RespuestaError(
  403,
  'El hábito existe pero es de otra persona (también para ADMIN)',
  {
    habitoAjeno: {
      resumen: 'Hábito de otra persona',
      path: RUTA_ID,
      message: 'No tienes permiso para acceder a este hábito',
    },
  },
);
const HABITO_INEXISTENTE = RespuestaError(
  404,
  'No existe un hábito con ese id',
  {
    habitoInexistente: {
      resumen: 'UUID válido que no existe',
      path: RUTA_ID,
      message: 'Hábito no encontrado',
    },
  },
);

// JwtAuthGuard (clase) se ejecuta antes que RolesGuard (método).
@ApiTags('habitos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('habitos')
export class HabitosController {
  constructor(private readonly habitosService: HabitosService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear un hábito propio',
    description:
      'El dueño se toma del JWT. estado inicia en ACTIVO y frecuencia en DIARIA si no se envían. Enviar usuarioId u otro campo no declarado responde 400.',
  })
  @ApiCreatedResponse({
    description: 'Hábito creado',
    type: HabitoRespuestaDto,
  })
  @RespuestaError(
    400,
    'Datos inválidos, campos no permitidos o JSON mal formado',
    {
      nombreInvalido: {
        resumen: 'Nombre fuera de 3 a 120 caracteres',
        path: '/habitos',
        message: ['El nombre debe tener entre 3 y 120 caracteres'],
      },
      enumInvalido: {
        resumen: 'Frecuencia inexistente',
        path: '/habitos',
        message: ['La frecuencia debe ser una de: DIARIA, SEMANAL, MENSUAL'],
      },
      campoUsuarioId: {
        resumen: 'Se envió usuarioId',
        path: '/habitos',
        message: ['El campo usuarioId no está permitido'],
      },
      jsonInvalido: JSON_INVALIDO('/habitos'),
    },
  )
  @sinToken('/habitos')
  crear(
    @Body() dto: CrearHabitoDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ) {
    return this.habitosService.crear(dto, usuario.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar únicamente los hábitos propios' })
  @ApiOkResponse({
    description: 'Hábitos del usuario autenticado',
    type: [HabitoRespuestaDto],
  })
  @sinToken('/habitos')
  listarPropios(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.habitosService.listarPropios(usuario.id);
  }

  // Declarada antes de las rutas con :id.
  @Get('admin/todos')
  @UseGuards(RolesGuard)
  @Roles([Rol.ADMIN])
  @ApiOperation({
    summary: 'Listar los hábitos de todas las personas (solo ADMIN)',
    description:
      'Incluye solo id y nombre del dueño. Un token emitido antes de promover la cuenta conserva el rol anterior.',
  })
  @ApiOkResponse({
    description: 'Todos los hábitos',
    type: [HabitoAdminRespuestaDto],
  })
  @sinToken('/habitos/admin/todos')
  @RespuestaError(403, 'El rol del token no es ADMIN', {
    rolInsuficiente: {
      resumen: 'Token de una cuenta USUARIO',
      path: '/habitos/admin/todos',
      message: 'No tienes permiso para acceder a este recurso',
    },
  })
  listarTodos() {
    return this.habitosService.listarTodos();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un hábito propio' })
  @PARAM_ID
  @ApiOkResponse({ description: 'El hábito', type: HabitoRespuestaDto })
  @RespuestaError(400, 'El id no tiene formato UUID', {
    idInvalido: ID_INVALIDO,
  })
  @sinToken(RUTA_ID)
  @HABITO_AJENO
  @HABITO_INEXISTENTE
  obtenerUno(
    @Param('id', ID_UUID) id: string,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ) {
    return this.habitosService.obtenerUno(id, usuario.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar parcialmente un hábito propio',
    description:
      'Solo cambian los campos enviados. Un body vacío responde 400 "Envía al menos un campo para actualizar".',
  })
  @PARAM_ID
  @ApiOkResponse({
    description: 'Hábito actualizado',
    type: HabitoRespuestaDto,
  })
  @RespuestaError(
    400,
    'Datos inválidos, campos no permitidos, body vacío, JSON mal formado o id sin formato UUID',
    {
      bodyVacio: {
        resumen: 'Body vacío',
        path: RUTA_ID,
        message: 'Envía al menos un campo para actualizar',
      },
      enumInvalido: {
        resumen: 'Estado inexistente',
        path: RUTA_ID,
        message: ['El estado debe ser uno de: ACTIVO, PAUSADO, ARCHIVADO'],
      },
      campoUsuarioId: {
        resumen: 'Se envió usuarioId',
        path: RUTA_ID,
        message: ['El campo usuarioId no está permitido'],
      },
      jsonInvalido: JSON_INVALIDO(RUTA_ID),
      idInvalido: ID_INVALIDO,
    },
  )
  @sinToken(RUTA_ID)
  @HABITO_AJENO
  @HABITO_INEXISTENTE
  actualizar(
    @Param('id', ID_UUID) id: string,
    @Body() dto: ActualizarHabitoDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ) {
    return this.habitosService.actualizar(id, dto, usuario.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar un hábito propio',
    description:
      'Eliminación física: una consulta posterior al mismo id responde 404.',
  })
  @PARAM_ID
  @ApiNoContentResponse({ description: 'Hábito eliminado (sin cuerpo)' })
  @RespuestaError(400, 'El id no tiene formato UUID', {
    idInvalido: ID_INVALIDO,
  })
  @sinToken(RUTA_ID)
  @HABITO_AJENO
  @HABITO_INEXISTENTE
  eliminar(
    @Param('id', ID_UUID) id: string,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ) {
    return this.habitosService.eliminar(id, usuario.id);
  }
}
