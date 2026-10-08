import { Reflector } from '@nestjs/core';
import { Rol } from '../generated/prisma/client';

// Uso: @Roles([Rol.ADMIN]). Guarda los roles permitidos como metadata de la ruta.
export const Roles = Reflector.createDecorator<Rol[]>();
