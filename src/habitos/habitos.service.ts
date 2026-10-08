import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearHabitoDto } from './dto/crear-habito.dto';
import { ActualizarHabitoDto } from './dto/actualizar-habito.dto';

// Campos que expone la API: nunca incluye datos del usuario dueño.
const CAMPOS_HABITO = {
  id: true,
  nombre: true,
  descripcion: true,
  estado: true,
  frecuencia: true,
  usuarioId: true,
  creadoEn: true,
} as const;

@Injectable()
export class HabitosService {
  constructor(private readonly prisma: PrismaService) {}

  // Los campos se copian uno a uno para que nada extra del body
  // (como usuarioId) llegue a Prisma; el dueño sale siempre del token.
  crear(dto: CrearHabitoDto, usuarioId: string) {
    return this.prisma.habito.create({
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        estado: dto.estado,
        frecuencia: dto.frecuencia,
        usuarioId,
      },
      select: CAMPOS_HABITO,
    });
  }

  listarPropios(usuarioId: string) {
    return this.prisma.habito.findMany({
      where: { usuarioId },
      select: CAMPOS_HABITO,
      orderBy: { creadoEn: 'desc' },
    });
  }

  async obtenerUno(id: string) {
    const habito = await this.prisma.habito.findUnique({
      where: { id },
      select: CAMPOS_HABITO,
    });
    if (!habito) {
      throw new NotFoundException('Hábito no encontrado');
    }
    return habito;
  }

  async actualizar(id: string, dto: ActualizarHabitoDto | undefined) {
    // Express 5 deja el body en undefined si la petición no trae cuerpo.
    const { nombre, descripcion, estado, frecuencia } = dto ?? {};
    // Prisma ignora los campos undefined: solo cambian los enviados.
    const cambios = { nombre, descripcion, estado, frecuencia };
    // D-10: es validación de entrada, así que va antes de consultar la base.
    if (Object.values(cambios).every((valor) => valor === undefined)) {
      throw new BadRequestException('Envía al menos un campo para actualizar');
    }

    await this.obtenerUno(id);
    return this.prisma.habito.update({
      where: { id },
      data: cambios,
      select: CAMPOS_HABITO,
    });
  }

  async eliminar(id: string) {
    await this.obtenerUno(id);
    await this.prisma.habito.delete({ where: { id } });
  }
}
