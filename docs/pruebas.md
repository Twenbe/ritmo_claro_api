# Registro de pruebas manuales

Matriz de pruebas obligatorias del taller (página 16), con un usuario A, un usuario B (ambos `USUARIO`) y un `ADMIN` promovido con `npm run admin:promover`. Todas las cuentas y contraseñas son ficticias. Ninguna fila incluye tokens, contraseñas reales ni cadenas de conexión.

- **Entorno local:** API compilada (`node dist/main`) contra PostgreSQL local, peticiones con `curl`, 2026-10-08.
- **Entorno producción:** https://ritmo-claro-api.onrender.com (Render, imagen Docker) contra Supabase (Session Pooler), peticiones con `curl`, 2026-10-08. Cuentas ficticias `smoke.a`, `smoke.b` y `smoke.admin@ejemplo.com`, con contraseñas aleatorias que no están en el repositorio; `smoke.admin` se promovió con `npm run admin:promover` usando la `DATABASE_URL` de Supabase solo en una variable temporal de la terminal.
- **Nota sobre clientes en Windows:** `curl` en Git Bash envía los argumentos con la página de códigos de Windows, y los caracteres no ASCII llegan dañados (la `ó` se guardó como `U+FFFD`). La API conserva bien el UTF-8: se comprobó enviando el mismo texto con `fetch` de Node. Para textos con tildes, usa Postman, Swagger o `curl --data-binary @archivo.json`.
- **Resultado:** "Cumple" si el status observado coincide con el esperado y también se cumple la condición indicada.
- **Evidencia:** columna reservada para las capturas. Cada captura debe mostrar el status HTTP y el cuerpo en texto, no solo colores.
- La misma matriz está en la colección [`postman/Ritmo-Claro.postman_collection.json`](../postman/Ritmo-Claro.postman_collection.json), con una petición por caso nombrada con el status esperado.

| Caso | Entorno | Fecha | Entrada resumida | Status esperado | Status observado | Resultado | Evidencia |
|------|---------|-------|------------------|-----------------|------------------|-----------|-----------|
| Registro válido | Local | 2026-10-08 | `POST /auth/register` con nombre, email nuevo y password de 8+ | 201 | 201 | Cumple — sin passwordHash, rol USUARIO | Runner de Postman 2026-10-08, 48/48 aprobadas (documento de evidencias, Fig. 77) |
| Email repetido | Local | 2026-10-08 | `POST /auth/register` con un email ya registrado | 409 | 409 | Cumple — contrato de error | Runner de Postman 2026-10-08, 48/48 aprobadas (documento de evidencias, Fig. 77) |
| Login válido | Local | 2026-10-08 | `POST /auth/login` con credenciales correctas | 200 | 200 | Cumple — JWT con sub, email, rol y exp de 1 h | Runner de Postman 2026-10-08, 48/48 aprobadas (documento de evidencias, Fig. 77) |
| Login inválido | Local | 2026-10-08 | `POST /auth/login` con password incorrecta | 401 | 401 | Cumple — mensaje genérico | Runner de Postman 2026-10-08, 48/48 aprobadas (documento de evidencias, Fig. 77) |
| Entrada inválida (nombre corto) | Local | 2026-10-08 | `POST /auth/register` con nombre de 1 carácter | 400 | 400 | Cumple — mensaje comprensible | Runner de Postman 2026-10-08, 48/48 aprobadas (documento de evidencias, Fig. 77) |
| Entrada inválida (enum) | Local | 2026-10-08 | `POST /habitos` con frecuencia ANUAL | 400 | 400 | Cumple — lista los valores válidos | Runner de Postman 2026-10-08, 48/48 aprobadas (documento de evidencias, Fig. 77) |
| Sin autenticación | Local | 2026-10-08 | `GET /habitos` sin token | 401 | 401 | Cumple | Runner de Postman 2026-10-08, 48/48 aprobadas (documento de evidencias, Fig. 77) |
| Crear | Local | 2026-10-08 | `POST /habitos` (A) con nombre y descripción | 201 | 201 | Cumple — ACTIVO y DIARIA por defecto | Runner de Postman 2026-10-08, 48/48 aprobadas (documento de evidencias, Fig. 77) |
| Listar | Local | 2026-10-08 | `GET /habitos` (A) | 200 | 200 | Cumple — incluye el hábito creado | Runner de Postman 2026-10-08, 48/48 aprobadas (documento de evidencias, Fig. 77) |
| Actualización parcial | Local | 2026-10-08 | `PATCH /habitos/:id` (A) solo con estado PAUSADO | 200 | 200 | Cumple — los demás campos se conservan | Runner de Postman 2026-10-08, 48/48 aprobadas (documento de evidencias, Fig. 77) |
| Recurso inexistente | Local | 2026-10-08 | `GET /habitos/:id` con un UUID que no existe | 404 | 404 | Cumple | Runner de Postman 2026-10-08, 48/48 aprobadas (documento de evidencias, Fig. 77) |
| Propiedad (ver) | Local | 2026-10-08 | B: `GET /habitos/:id` del hábito de A | 403 | 403 | Cumple | Runner de Postman 2026-10-08, 48/48 aprobadas (documento de evidencias, Fig. 77) |
| Propiedad (editar) | Local | 2026-10-08 | B: `PATCH /habitos/:id` del hábito de A | 403 | 403 | Cumple | Runner de Postman 2026-10-08, 48/48 aprobadas (documento de evidencias, Fig. 77) |
| Propiedad (borrar) | Local | 2026-10-08 | B: `DELETE /habitos/:id` del hábito de A | 403 | 403 | Cumple — el hábito de A sigue existiendo | Runner de Postman 2026-10-08, 48/48 aprobadas (documento de evidencias, Fig. 77) |
| RBAC | Local | 2026-10-08 | USUARIO: `GET /habitos/admin/todos` | 403 | 403 | Cumple | Runner de Postman 2026-10-08, 48/48 aprobadas (documento de evidencias, Fig. 77) |
| Ruta administrativa | Local | 2026-10-08 | ADMIN: `GET /habitos/admin/todos` | 200 | 200 | Cumple — sin passwordHash ni email | Runner de Postman 2026-10-08, 48/48 aprobadas (documento de evidencias, Fig. 77) |
| Eliminación | Local | 2026-10-08 | A: `DELETE /habitos/:id` de su hábito | 204 | 204 | Cumple — sin cuerpo | Runner de Postman 2026-10-08, 48/48 aprobadas (documento de evidencias, Fig. 77) |
| Eliminación (consulta posterior) | Local | 2026-10-08 | A: `GET /habitos/:id` del hábito eliminado | 404 | 404 | Cumple | Runner de Postman 2026-10-08, 48/48 aprobadas (documento de evidencias, Fig. 77) |
| Swagger público | Producción | 2026-10-08 | `GET /docs` | 200 | 200 | Cumple — 8 rutas en /docs-json | |
| Registro válido | Producción | 2026-10-08 | `POST /auth/register` (cuenta ficticia smoke.a) | 201 | 201 | Cumple — sin passwordHash, rol USUARIO | |
| Email repetido | Producción | 2026-10-08 | `POST /auth/register` con smoke.a en mayúsculas | 409 | 409 | Cumple — contrato de error | |
| Login válido | Producción | 2026-10-08 | `POST /auth/login` (smoke.a) | 200 | 200 | Cumple — JWT con exp de 1 h | |
| Login inválido | Producción | 2026-10-08 | `POST /auth/login` con password incorrecta | 401 | 401 | Cumple — mensaje genérico | |
| Entrada inválida | Producción | 2026-10-08 | `POST /habitos` con frecuencia ANUAL | 400 | 400 | Cumple — mensaje en lista | |
| Sin autenticación | Producción | 2026-10-08 | `GET /habitos` sin token | 401 | 401 | Cumple | |
| Crear | Producción | 2026-10-08 | `POST /habitos` (smoke.a) | 201 | 201 | Cumple — ACTIVO y DIARIA por defecto | |
| Listar | Producción | 2026-10-08 | `GET /habitos` (smoke.a) | 200 | 200 | Cumple — incluye el hábito creado | |
| Actualización parcial | Producción | 2026-10-08 | `PATCH /habitos/:id` solo con estado | 200 | 200 | Cumple — los demás campos se conservan | |
| Recurso inexistente | Producción | 2026-10-08 | `GET /habitos/:id` con UUID inexistente | 404 | 404 | Cumple | |
| Propiedad (ver) | Producción | 2026-10-08 | smoke.b: `GET` del hábito de smoke.a | 403 | 403 | Cumple | |
| Propiedad (editar) | Producción | 2026-10-08 | smoke.b: `PATCH` del hábito de smoke.a | 403 | 403 | Cumple | |
| Propiedad (borrar) | Producción | 2026-10-08 | smoke.b: `DELETE` del hábito de smoke.a | 403 | 403 | Cumple | |
| RBAC | Producción | 2026-10-08 | USUARIO (smoke.a): `GET /habitos/admin/todos` | 403 | 403 | Cumple | |
| Ruta administrativa | Producción | 2026-10-08 | ADMIN (smoke.admin, promovido con el script): `GET /habitos/admin/todos` | 200 | 200 | Cumple — sin passwordHash ni email | |
| Eliminación | Producción | 2026-10-08 | smoke.a: `DELETE` de su hábito | 204 | 204 | Cumple — sin cuerpo | |
| Eliminación (consulta posterior) | Producción | 2026-10-08 | smoke.a: `GET` del hábito eliminado | 404 | 404 | Cumple | |
| Persistencia tras redeploy | Producción | 2026-10-08 | Redeploy con nueva contraseña de Supabase y nuevo JWT_SECRET; login de nuevo y `GET /habitos/:id` del hábito creado antes | 200 | 200 | Cumple — mismo id, nombre y estado PAUSADO; smoke.admin sigue ADMIN | |
