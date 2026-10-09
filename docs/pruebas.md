# Registro de pruebas manuales

Matriz de pruebas obligatorias del taller (página 16), con un usuario A, un usuario B (ambos `USUARIO`) y un `ADMIN` promovido con `npm run admin:promover`. Todas las cuentas y contraseñas son ficticias. Ninguna fila incluye tokens, contraseñas reales ni cadenas de conexión.

- **Entorno local:** API compilada (`node dist/main`) contra PostgreSQL local, peticiones con `curl`, 2026-10-08.
- **Resultado:** "Cumple" si el status observado coincide con el esperado y también se cumple la condición indicada.
- **Evidencia:** columna reservada para las capturas. Cada captura debe mostrar el status HTTP y el cuerpo en texto, no solo colores.
- La misma matriz está en la colección [`postman/Ritmo-Claro.postman_collection.json`](../postman/Ritmo-Claro.postman_collection.json), con una petición por caso nombrada con el status esperado.

| Caso | Entorno | Fecha | Entrada resumida | Status esperado | Status observado | Resultado | Evidencia |
|------|---------|-------|------------------|-----------------|------------------|-----------|-----------|
| Registro válido | Local | 2026-10-08 | `POST /auth/register` con nombre, email nuevo y password de 8+ | 201 | 201 | Cumple — sin passwordHash, rol USUARIO | |
| Email repetido | Local | 2026-10-08 | `POST /auth/register` con un email ya registrado | 409 | 409 | Cumple — contrato de error | |
| Login válido | Local | 2026-10-08 | `POST /auth/login` con credenciales correctas | 200 | 200 | Cumple — JWT con sub, email, rol y exp de 1 h | |
| Login inválido | Local | 2026-10-08 | `POST /auth/login` con password incorrecta | 401 | 401 | Cumple — mensaje genérico | |
| Entrada inválida (nombre corto) | Local | 2026-10-08 | `POST /auth/register` con nombre de 1 carácter | 400 | 400 | Cumple — mensaje comprensible | |
| Entrada inválida (enum) | Local | 2026-10-08 | `POST /habitos` con frecuencia ANUAL | 400 | 400 | Cumple — lista los valores válidos | |
| Sin autenticación | Local | 2026-10-08 | `GET /habitos` sin token | 401 | 401 | Cumple | |
| Crear | Local | 2026-10-08 | `POST /habitos` (A) con nombre y descripción | 201 | 201 | Cumple — ACTIVO y DIARIA por defecto | |
| Listar | Local | 2026-10-08 | `GET /habitos` (A) | 200 | 200 | Cumple — incluye el hábito creado | |
| Actualización parcial | Local | 2026-10-08 | `PATCH /habitos/:id` (A) solo con estado PAUSADO | 200 | 200 | Cumple — los demás campos se conservan | |
| Recurso inexistente | Local | 2026-10-08 | `GET /habitos/:id` con un UUID que no existe | 404 | 404 | Cumple | |
| Propiedad (ver) | Local | 2026-10-08 | B: `GET /habitos/:id` del hábito de A | 403 | 403 | Cumple | |
| Propiedad (editar) | Local | 2026-10-08 | B: `PATCH /habitos/:id` del hábito de A | 403 | 403 | Cumple | |
| Propiedad (borrar) | Local | 2026-10-08 | B: `DELETE /habitos/:id` del hábito de A | 403 | 403 | Cumple — el hábito de A sigue existiendo | |
| RBAC | Local | 2026-10-08 | USUARIO: `GET /habitos/admin/todos` | 403 | 403 | Cumple | |
| Ruta administrativa | Local | 2026-10-08 | ADMIN: `GET /habitos/admin/todos` | 200 | 200 | Cumple — sin passwordHash ni email | |
| Eliminación | Local | 2026-10-08 | A: `DELETE /habitos/:id` de su hábito | 204 | 204 | Cumple — sin cuerpo | |
| Eliminación (consulta posterior) | Local | 2026-10-08 | A: `GET /habitos/:id` del hábito eliminado | 404 | 404 | Cumple | |
| Producción | Producción | — | Repetir registro, login, creación y permisos en la URL pública | Mismo contrato que en local | Pendiente | Pendiente (Parte 10) | |
