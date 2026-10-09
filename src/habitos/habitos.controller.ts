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
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UsuarioActual } from '../auth/usuario-actual.decorator';
import type { UsuarioAutenticado } from '../auth/jwt.strategy';
import { Rol } from '../generated/prisma/client';
import { ErrorRespuestaDto } from '../common/dto/error-respuesta.dto';
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

const PARAM_ID = ApiParam({
  name: 'id',
  format: 'uuid',
  description: 'Id del hábito (UUID)',
});
const RESPUESTA_ID_INVALIDO = ApiBadRequestResponse({
  description: 'El id no tiene formato UUID',
  type: ErrorRespuestaDto,
});
const RESPUESTA_AJENO = ApiForbiddenResponse({
  description: 'El hábito existe pero es de otra persona (también para ADMIN)',
  type: ErrorRespuestaDto,
});
const RESPUESTA_INEXISTENTE = ApiNotFoundResponse({
  description: 'No existe un hábito con ese id',
  type: ErrorRespuestaDto,
});

// JwtAuthGuard (clase) se ejecuta antes que RolesGuard (método).
@ApiTags('habitos')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Falta el token, no es válido o expiró',
  type: ErrorRespuestaDto,
})
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
  @ApiBadRequestResponse({
    description: 'Datos inválidos o campos no permitidos',
    type: ErrorRespuestaDto,
  })
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
  @ApiForbiddenResponse({
    description: 'El rol del token no es ADMIN',
    type: ErrorRespuestaDto,
  })
  listarTodos() {
    return this.habitosService.listarTodos();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un hábito propio' })
  @PARAM_ID
  @ApiOkResponse({ description: 'El hábito', type: HabitoRespuestaDto })
  @RESPUESTA_ID_INVALIDO
  @RESPUESTA_AJENO
  @RESPUESTA_INEXISTENTE
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
  @ApiBadRequestResponse({
    description:
      'Datos inválidos, campos no permitidos, body vacío o id sin formato UUID',
    type: ErrorRespuestaDto,
  })
  @RESPUESTA_AJENO
  @RESPUESTA_INEXISTENTE
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
  @RESPUESTA_ID_INVALIDO
  @RESPUESTA_AJENO
  @RESPUESTA_INEXISTENTE
  eliminar(
    @Param('id', ID_UUID) id: string,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ) {
    return this.habitosService.eliminar(id, usuario.id);
  }
}
