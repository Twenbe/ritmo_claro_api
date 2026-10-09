import { ApiResponse } from '@nestjs/swagger';
import { ErrorRespuestaDto } from '../dto/error-respuesta.dto';

// Id de ejemplo para las rutas /habitos/:id en la documentación.
export const UUID_EJEMPLO = '0b8f6c1e-3d2a-4f7b-9c5e-1a2b3c4d5e6f';

type EjemploError = {
  resumen: string;
  path: string;
  message: string | string[];
};

// Documenta una respuesta de error con ejemplos propios de la operación:
// mismo statusCode, path de la ruta y mensaje real que devuelve la API.
export function RespuestaError(
  status: number,
  descripcion: string,
  ejemplos: Record<string, EjemploError>,
) {
  return ApiResponse({
    status,
    description: descripcion,
    type: ErrorRespuestaDto,
    examples: Object.fromEntries(
      Object.entries(ejemplos).map(([clave, { resumen, path, message }]) => [
        clave,
        {
          summary: resumen,
          value: {
            statusCode: status,
            timestamp: '2026-10-08T12:00:00.000Z',
            path,
            message,
          },
        },
      ]),
    ),
  });
}
