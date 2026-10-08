import {
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
import { UsuarioActual } from '../auth/usuario-actual.decorator';
import type { UsuarioAutenticado } from '../auth/jwt.strategy';
import { HabitosService } from './habitos.service';
import { CrearHabitoDto } from './dto/crear-habito.dto';
import { ActualizarHabitoDto } from './dto/actualizar-habito.dto';

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

  @Get(':id')
  obtenerUno(@Param('id', ParseUUIDPipe) id: string) {
    return this.habitosService.obtenerUno(id);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarHabitoDto,
  ) {
    return this.habitosService.actualizar(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminar(@Param('id', ParseUUIDPipe) id: string) {
    return this.habitosService.eliminar(id);
  }
}
