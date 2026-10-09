import { BadRequestException, ValidationError } from '@nestjs/common';

// Convierte los errores de class-validator en una lista legible de mensajes.
// forbidNonWhitelisted genera "property X should not exist"; se traduce (D-05).
export function erroresDeValidacion(errores: ValidationError[]) {
  const mensajes = errores.flatMap((error) =>
    Object.entries(error.constraints ?? {}).map(([regla, mensaje]) =>
      regla === 'whitelistValidation'
        ? `El campo ${error.property} no está permitido`
        : mensaje,
    ),
  );
  return new BadRequestException(mensajes);
}
