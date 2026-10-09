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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UsuarioActual } from '../auth/usuario-actual.decorator';
import type { UsuarioAutenticado } from '../auth/jwt.strategy';
import { Rol } from '../generated/prisma/client';
import { HabitosService } from './habitos.service';
import { CrearHabitoDto } from './dto/crear-habito.dto';
import { ActualizarHabitoDto } from './dto/actualizar-habito.dto';

// D-09: un id sin formato UUID responde 400 antes de consultar la base.
const ID_UUID = new ParseUUIDPipe({
  exceptionFactory: () =>
    new BadRequestException('El id debe ser un UUID válido'),
});

// JwtAuthGuard (clase) se ejecuta antes que RolesGuard (método).
@UseGuards(JwtAuthGuard)
@Controller('habitos')
export class HabitosController {
  constructor(private readonly habitosService: HabitosService) {}

  @Post()
  crear(
    @Body() dto: CrearHabitoDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ) {
    return this.habitosService.crear(dto, usuario.id);
  }

  @Get()
  listarPropios(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.habitosService.listarPropios(usuario.id);
  }

  // Declarada antes de las rutas con :id.
  @Get('admin/todos')
  @UseGuards(RolesGuard)
  @Roles([Rol.ADMIN])
  listarTodos() {
    return this.habitosService.listarTodos();
  }

  @Get(':id')
  obtenerUno(
    @Param('id', ID_UUID) id: string,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ) {
    return this.habitosService.obtenerUno(id, usuario.id);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ID_UUID) id: string,
    @Body() dto: ActualizarHabitoDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ) {
    return this.habitosService.actualizar(id, dto, usuario.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminar(
    @Param('id', ID_UUID) id: string,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ) {
    return this.habitosService.eliminar(id, usuario.id);
  }
}
