# Ritmo Claro API

API backend para gestionar hábitos de bienestar de los participantes de Ritmo Claro, con autenticación JWT, permisos por rol y propiedad, y persistencia en PostgreSQL.

> Estado: **Parte 9 — repositorio reproducible y Docker.** La API expone los ocho endpoints del contrato con validación, contrato de error uniforme, Helmet y Swagger en `/docs`, y se puede ejecutar en local o en un contenedor. El modelo está en [docs/modelo.md](docs/modelo.md), las variables en [.env.example](.env.example) y los resultados de las pruebas en [docs/pruebas.md](docs/pruebas.md). El despliegue público se agrega en la Parte 10.

## Problema, actores y valor del MVP

Ritmo Claro acompaña a equipos remotos en la creación de hábitos de bienestar (leer, hacer pausas activas, meditar). Hoy esos hábitos se registran en formularios y hojas compartidas, lo que produce correos duplicados, estados escritos de formas distintas y un riesgo real de privacidad: cualquier persona podría consultar o modificar información ajena. Además, el sistema solo funciona en el equipo de quien lo desarrolla y no tiene un contrato documentado para integrarlo con una futura aplicación web.

Hay tres actores. El **visitante** solo puede crear una cuenta o iniciar sesión. El participante con rol **USUARIO** crea, consulta, edita y elimina únicamente sus propios hábitos. El personal de soporte con rol **ADMIN** administra sus propios hábitos y, además, consulta el listado global para atender casos. El MVP aporta valor porque reemplaza las hojas compartidas por una API que identifica a cada persona, aísla sus datos, garantiza email único y estados/frecuencias normalizados, rechaza entradas inválidas con errores consistentes y publica su contrato en Swagger para que la futura app web pueda integrarse.

## Historias de usuario

Cada historia indica actor, acción y un resultado que se puede comprobar con una petición HTTP.

| ID | Actor | Acción | Resultado verificable |
|----|-------|--------|-----------------------|
| HU-01 | Visitante | Se registra con nombre, email y password válidos. | `201` con `id`, `nombre`, `email`, `rol: USUARIO` y `creadoEn`; la respuesta no contiene `password` ni `passwordHash`. |
| HU-02 | Visitante | Intenta registrarse con un email que ya existe. | `409` con el contrato de error; no se crea una segunda cuenta. |
| HU-03 | Visitante | Intenta registrarse enviando `rol: ADMIN` en el body. | `400`; no se crea la cuenta. |
| HU-04 | Visitante | Inicia sesión con email y password correctos. | `200` con `access_token`; el JWT contiene `sub`, `email`, `rol` y una expiración de una hora. |
| HU-05 | Visitante | Inicia sesión con un email inexistente o con una password incorrecta. | `401` con el mismo mensaje genérico en ambos casos; no revela si el email existe. |
| HU-06 | USUARIO | Crea un hábito con nombre y, opcionalmente, descripción y frecuencia. | `201`; el hábito queda asociado al `usuarioId` del token, con `estado: ACTIVO` y `frecuencia: DIARIA` si no la envió. |
| HU-07 | USUARIO | Lista sus hábitos. | `200` con solo los hábitos cuyo `usuarioId` es el suyo; nunca aparecen hábitos de otra persona. |
| HU-08 | USUARIO | Consulta uno de sus hábitos por id. | `200` con el hábito; `404` si el id es un UUID que no existe y `400` si no tiene formato UUID. |
| HU-09 | USUARIO | Cambia solo el estado de un hábito propio a `PAUSADO`. | `200`; `estado` cambia y los demás campos conservan su valor. |
| HU-10 | USUARIO | Elimina uno de sus hábitos y luego lo vuelve a consultar. | `204` al eliminar y `404` en la consulta posterior. |
| HU-11 | USUARIO | Intenta consultar, editar o eliminar un hábito de otra persona. | `403` en cada intento; el hábito no cambia. |
| HU-12 | USUARIO | Llama a `GET /habitos/admin/todos`. | `403`. |
| HU-13 | ADMIN | Consulta el listado global de hábitos. | `200` con los hábitos de todas las personas y sin `passwordHash` ni otros datos sensibles. |
| HU-14 | ADMIN | Crea, lista, edita y elimina sus propios hábitos. | Mismos resultados que HU-06 a HU-10. |
| HU-15 | ADMIN | Intenta editar un hábito ajeno por `PATCH /habitos/:id`. | `403`; ADMIN solo consulta hábitos ajenos por la ruta global (ver [decisiones](docs/decisiones.md)). |
| HU-16 | Cualquier actor sin token | Llama a cualquier ruta `/habitos`. | `401`. |

## Matriz de endpoints y permisos

Las rutas `/habitos` exigen un JWT válido; si falta o está vencido o alterado, la respuesta es `401`. La columna "Observado" registra las pruebas con curl de las Partes 4 a 6 con usuario A, usuario B y un ADMIN. En la Parte 7 se comprobaron además los `400` por validación (nombre corto, email inválido, enum inventado, longitudes, `rol` o `usuarioId` en el body, JSON mal formado) y el `500` genérico con PostgreSQL detenido.

| Método y ruta | Acceso | Actor autorizado | Resultado esperado | Rechazos esperados | Observado (local, 2026-10-08) |
|---------------|--------|------------------|--------------------|--------------------|-------------------------------|
| `POST /auth/register` | Público | Visitante | `201`: cuenta creada con rol `USUARIO` y email normalizado, sin `passwordHash`. No acepta `rol`. | `400` datos inválidos o campos no permitidos · `409` email repetido (sin distinguir mayúsculas) | `201` · `409` (igual y con otras mayúsculas) |
| `POST /auth/login` | Público | Visitante con cuenta | `200` con `access_token` (JWT con `sub`, `email`, `rol` y expiración de 1 h). | `400` datos con formato inválido · `401` credenciales inválidas (mensaje genérico) | `200` · `401` (email inexistente y contraseña incorrecta) |
| `POST /habitos` | Con sesión | USUARIO, ADMIN | `201`: hábito creado con `usuarioId` tomado del token, `estado: ACTIVO` y `frecuencia: DIARIA` si no se envía. | `400` · `401` | `201` (USUARIO y ADMIN) |
| `GET /habitos` | Con sesión | USUARIO, ADMIN | `200`: solo los hábitos propios. | `401` | `200` solo propios (A, B y ADMIN) · `401` sin token y con token alterado |
| `GET /habitos/:id` | Dueño | Dueño del hábito | `200`: el hábito. | `400` id sin formato UUID · `401` · `403` ajeno · `404` inexistente | `200` dueño · `403` B · `403` ADMIN · `404` · `400` |
| `PATCH /habitos/:id` | Dueño | Dueño del hábito | `200`: actualiza solo los campos enviados. | `400` datos inválidos, body vacío o id sin formato UUID · `401` · `403` ajeno · `404` inexistente | `200` dueño · `403` B · `403` ADMIN · `400` body vacío |
| `DELETE /habitos/:id` | Dueño | Dueño del hábito | `204` sin cuerpo; eliminación física. | `400` id sin formato UUID · `401` · `403` ajeno · `404` inexistente | `204` dueño, luego `404` · `403` B · `403` ADMIN |
| `GET /habitos/admin/todos` | ADMIN | ADMIN | `200`: todos los hábitos, sin datos sensibles. | `401` · `403` si el rol es USUARIO | `200` ADMIN, sin `passwordHash` ni `email` · `403` USUARIO · `403` token emitido antes de promover · `401` sin token |

## Contrato de error

Toda respuesta de error tiene esta forma:

```json
{
  "statusCode": 404,
  "timestamp": "2026-10-08T12:00:00.000Z",
  "path": "/habitos/0b8f6c1e-3d2a-4f7b-9c5e-1a2b3c4d5e6f",
  "message": "Hábito no encontrado"
}
```

| Código | Cuándo |
|--------|--------|
| `400` | Datos inválidos, campos no permitidos en el body, `PATCH` con body vacío o id sin formato UUID. |
| `401` | Falta una identidad válida (sin token, token alterado o vencido, credenciales inválidas). |
| `403` | Hay identidad, pero no permiso (recurso ajeno o rol insuficiente). |
| `404` | El recurso no existe. |
| `409` | Conflicto, por ejemplo email repetido. |
| `500` | Fallo inesperado; mensaje genérico, el detalle solo queda en los logs del servidor. |

Ninguna respuesta incluye contraseñas, `passwordHash`, `JWT_SECRET`, `DATABASE_URL`, stack traces ni detalles internos.

## Criterios de aceptación

Los criterios usan usuario A, usuario B (ambos `USUARIO`) y un `ADMIN`. "Contrato de error" significa la forma descrita arriba.

### Registro

**Positivos**
- CA-REG-01: nombre de al menos 2 caracteres, email válido no registrado y password de al menos 8 caracteres → `201`, `rol: USUARIO`, sin `password` ni `passwordHash` en la respuesta.
- CA-REG-02: la contraseña se guarda como hash bcrypt; en la base nunca aparece en texto plano.
- CA-REG-03: registro con el email `" Ana@Ejemplo.com "` → `201`; el email se guarda y se devuelve como `ana@ejemplo.com`.

**Negativos**
- CA-REG-04: email ya registrado → `409` con contrato de error.
- CA-REG-05: email ya registrado escrito con otras mayúsculas o con espacios (`ANA@ejemplo.com` cuando existe `ana@ejemplo.com`) → `409`.
- CA-REG-06: email con formato inválido, nombre de menos de 2 caracteres o password de menos de 8 → `400` con un mensaje comprensible.
- CA-REG-07: body con `rol` (cualquier valor) u otro campo no permitido → `400`; no se crea la cuenta.
- CA-REG-08: falta un campo obligatorio → `400`.

### Login

**Positivos**
- CA-LOG-01: credenciales correctas → `200` con `access_token`; el payload decodificado contiene `sub`, `email`, `rol`, `iat` y `exp` (expiración de 1 h) y nada más sensible.
- CA-LOG-02: email registrado escrito con otras mayúsculas o con espacios, más la password correcta → `200` con `access_token`.

**Negativos**
- CA-LOG-03: email no registrado → `401` con mensaje genérico.
- CA-LOG-04: password incorrecta → `401` con el mismo mensaje que CA-LOG-03.
- CA-LOG-05: email con formato inválido o campos faltantes → `400`.
- CA-LOG-06: un token con la firma alterada o vencido, usado en una ruta protegida → `401`.

### CRUD de hábitos

**Positivos**
- CA-CRUD-01: `POST /habitos` con nombre de 3 a 120 caracteres, descripción opcional de hasta 500 y frecuencia opcional → `201`; `usuarioId` es el `sub` del token, `estado` es `ACTIVO` y `frecuencia` es la enviada o `DIARIA` si se omitió.
- CA-CRUD-02: `GET /habitos` → `200` con la lista propia, incluido el hábito recién creado.
- CA-CRUD-03: `GET /habitos/:id` de un hábito propio → `200`.
- CA-CRUD-04: `PATCH /habitos/:id` con un solo campo → `200`; ese campo cambia y los demás conservan su valor.
- CA-CRUD-05: `DELETE /habitos/:id` de un hábito propio → `204`; un `GET` posterior al mismo id → `404`.
- CA-CRUD-06: después de reiniciar la aplicación, los hábitos creados siguen disponibles.

**Negativos**
- CA-CRUD-07: cualquier ruta `/habitos` sin token → `401`.
- CA-CRUD-08: nombre de menos de 3 o más de 120 caracteres, descripción de más de 500, o `estado`/`frecuencia` fuera de sus enums → `400`.
- CA-CRUD-09: body con `usuarioId`, `id`, `creadoEn` u otro campo no permitido → `400`.
- CA-CRUD-10: `GET`, `PATCH` o `DELETE` sobre un UUID válido que no existe → `404`.
- CA-CRUD-11: `GET`, `PATCH` o `DELETE` sobre un id sin formato UUID (por ejemplo `/habitos/abc`) → `400`.
- CA-CRUD-12: `PATCH /habitos/:id` con body vacío (`{}`) → `400` con el mensaje `"Envía al menos un campo para actualizar"`.

### Propiedad

**Positivos**
- CA-PRO-01: A crea un hábito; A lo consulta, edita y elimina con éxito.
- CA-PRO-02: `GET /habitos` de A y de B devuelve listas disjuntas.

**Negativos**
- CA-PRO-03: B hace `GET /habitos/:id` sobre el hábito de A → `403`.
- CA-PRO-04: B hace `PATCH /habitos/:id` sobre el hábito de A → `403`; el hábito de A no cambia.
- CA-PRO-05: B hace `DELETE /habitos/:id` sobre el hábito de A → `403`; el hábito sigue existiendo.
- CA-PRO-06: ADMIN hace `GET`, `PATCH` o `DELETE` sobre `/habitos/:id` del hábito de A → `403`.

### Rol

**Positivos**
- CA-ROL-01: ADMIN llama a `GET /habitos/admin/todos` → `200` con los hábitos de A, B y los propios, sin `passwordHash`.
- CA-ROL-02: el rol ADMIN se asigna solo con el script interno documentado; después de asignarlo, la persona debe volver a iniciar sesión para obtener un token con el rol nuevo.

**Negativos**
- CA-ROL-03: USUARIO llama a `GET /habitos/admin/todos` → `403`.
- CA-ROL-04: sin token, `GET /habitos/admin/todos` → `401`.
- CA-ROL-05: ninguna ruta de la API permite asignar o cambiar el rol; enviar `rol` en registro → `400`.
- CA-ROL-06: un token emitido antes del cambio de rol conserva el rol anterior hasta que vence.

## Instalación y ejecución local

### Requisitos

- Node.js 24 (LTS) y npm 11.
- PostgreSQL con una base vacía para el proyecto (por ejemplo `ritmo_claro`).

### Pasos

```bash
git clone https://github.com/Twenbe/ritmo_claro_api.git
cd ritmo_claro_api
npm ci                      # instala exactamente lo que fija package-lock.json
cp .env.example .env        # luego reemplaza los valores ficticios de .env
npx prisma migrate deploy   # crea las tablas aplicando prisma/migrations
npx prisma generate         # genera el cliente en src/generated/prisma
npm run start:dev           # API en http://localhost:<PORT>, Swagger en /docs
```

### Variables de entorno

Se leen del entorno o de `.env` (que nunca se versiona). [.env.example](.env.example) es el contrato público, con valores ficticios y una explicación de cada variable.

| Variable | Obligatoria | Uso |
|----------|-------------|-----|
| `DATABASE_URL` | Sí | Cadena de conexión a PostgreSQL que usan la app y Prisma. |
| `JWT_SECRET` | Sí | Secreto para firmar y verificar los JWT. Largo, aleatorio y distinto en cada entorno. |
| `PORT` | No (3000) | Puerto HTTP. En Render lo inyecta la plataforma. |

La app no arranca si falta `DATABASE_URL` o `JWT_SECRET`, ni si la base no responde. El log nombra la variable o el código de error, nunca su valor.

### Migraciones

- `npx prisma migrate deploy`: aplica las migraciones pendientes de `prisma/migrations`. Es lo que se usa en un entorno nuevo, en el contenedor y en producción.
- `npx prisma migrate dev --name <nombre>`: solo en desarrollo, cuando cambia `prisma/schema.prisma`. Crea una migración nueva, que se versiona en Git.
- `npx prisma generate`: genera el cliente TypeScript. No toca la base; `npm run build` lo ejecuta automáticamente antes de compilar.

### Build y ejecución en modo producción

```bash
npm run build        # prisma generate + nest build -> dist/
npm run start:prod   # node dist/main
```

## Docker

El [Dockerfile](Dockerfile) es multi-stage sobre `node:24-slim`:

1. **build**: `npm ci`, `prisma generate` y `nest build`.
2. **prod-deps**: `npm ci --omit=dev` (incluye el CLI de Prisma y su motor de migraciones).
3. **final**: copia solo `node_modules` de producción, `dist/`, `prisma/`, `prisma.config.ts` y `package.json`, y se ejecuta con el usuario `node`.

Al arrancar, el contenedor ejecuta `prisma migrate deploy` y luego `node dist/main.js`, que escucha en `0.0.0.0` y en el `PORT` del entorno. [.dockerignore](.dockerignore) excluye `.env` (y sus variantes), `.git`, `node_modules`, `dist`, `src/generated`, los logs y el PDF del taller, así que la imagen no contiene secretos: la configuración se pasa al ejecutar.

```bash
docker build -t ritmo-claro-api .
```

### Ejecutar contra un PostgreSQL instalado en tu computador

Dentro del contenedor, `localhost` es el propio contenedor, no tu computador. Por eso la `DATABASE_URL` de tu `.env` (con `localhost`) no llega a tu PostgreSQL. Docker Desktop (Windows y macOS) ofrece el nombre `host.docker.internal`, que apunta a tu computador.

No hace falta modificar `.env`: `-e` tiene prioridad sobre `--env-file`, así que basta con sobrescribir `DATABASE_URL` (con tu usuario y clave reales en lugar de los marcadores) y fijar el puerto para que coincida con `-p`:

```bash
docker run --rm -p 3000:3000 --env-file .env   -e PORT=3000   -e DATABASE_URL="postgresql://USUARIO_DB:CLAVE_DB@host.docker.internal:5432/ritmo_claro?schema=public"   ritmo-claro-api
```

- Si prefieres no escribir la clave en la terminal (queda en el historial), crea un `.env.docker` con la misma `DATABASE_URL` usando `host.docker.internal` y úsalo con `--env-file .env.docker`. `.gitignore` y `.dockerignore` ignoran cualquier `.env.*`.
- En Linux sin Docker Desktop, agrega `--add-host=host.docker.internal:host-gateway`.
- Si el contenedor no conecta (`ECONNREFUSED` o "no pg_hba.conf entry" en el log de arranque), revisa que PostgreSQL acepte conexiones de la red de Docker (`listen_addresses` en `postgresql.conf` y una regla en `pg_hba.conf`).

Para comprobar que la imagen no contiene `.env`:

```bash
docker run --rm --entrypoint ls ritmo-claro-api -la /app   # no debe aparecer .env
```

## Documentación interactiva (Swagger)

Con la API en marcha (`npm run start:dev`), abre `http://localhost:<PORT>/docs` (`PORT` sale de tu `.env`; por defecto 3000). El documento OpenAPI en JSON está en `/docs-json`.

- Las operaciones están agrupadas en **auth** (rutas públicas) y **habitos** (requieren JWT, con candado).
- Cada operación muestra el body que recibe, el esquema de su respuesta y sus códigos (201/200/204, 400, 401, 403, 404, 409). Todos los errores usan el esquema `ErrorRespuestaDto`: `{ statusCode, timestamp, path, message }`.
- `Rol`, `EstadoHabito` y `Frecuencia` aparecen como enums, con sus valores exactos.

### Probar rutas protegidas con Authorize

1. En **auth → POST /auth/register**, pulsa *Try it out* y crea una cuenta con datos ficticios (o usa una existente).
2. En **POST /auth/login**, envía email y password y copia el valor de `access_token` (sin comillas).
3. Pulsa **Authorize** (arriba a la derecha), pega el token en *Value* (sin escribir "Bearer") y confirma. Los candados se cierran.
4. Ejecuta las rutas de **habitos**. El token dura 1 hora; cuando venza, repite el login y vuelve a autorizar.
5. Para la ruta `GET /habitos/admin/todos` necesitas el token de una cuenta ADMIN (ver [Asignar el rol ADMIN](#asignar-el-rol-admin)), obtenido **después** de promoverla.

## Pruebas manuales con Postman

La colección [`postman/Ritmo-Claro.postman_collection.json`](postman/Ritmo-Claro.postman_collection.json) (formato v2.1) tiene una petición por cada caso de la matriz de la página 16 del taller, nombrada con el status esperado, y tests que comprueban el status y el contrato de error. Usa solo cuentas ficticias: `usuario.a@ejemplo.com`, `usuario.b@ejemplo.com` y `admin.soporte@ejemplo.com`.

1. En Postman: **Import** → selecciona el archivo de la colección.
2. En la colección, pestaña **Variables**, asigna `baseUrl` (por ejemplo `http://localhost:3000`, sin barra final). Deja vacías `tokenA`, `tokenB`, `tokenAdmin` y `habitoId`: los scripts de login y de creación las llenan solos.
3. Ejecuta la carpeta **00 · Preparación**. La primera vez, promueve la cuenta ADMIN y repite *Login ADMIN*:
   ```bash
   npm run build
   npm run admin:promover -- admin.soporte@ejemplo.com
   ```
4. Ejecuta la carpeta **01 · Matriz de pruebas** con el *Collection Runner*, en orden. Al final, la última petición vacía los tokens y `habitoId`.
5. Para el caso de producción, cambia `baseUrl` a la URL pública y repite ambas carpetas.

Antes de exportar o compartir la colección, confirma que las variables de token están vacías. Los resultados observados en local están en [docs/pruebas.md](docs/pruebas.md).

## Asignar el rol ADMIN

El rol ADMIN nunca se asigna por la API (D-04). Para promover una cuenta ya registrada se usa el script interno `admin:promover`, que usa la `DATABASE_URL` del entorno (o del archivo `.env`):

```bash
npm run build                                   # el script usa el cliente Prisma compilado en dist/
npm run admin:promover -- persona@ejemplo.com
```

- El email se normaliza (trim y minúsculas), igual que en el registro.
- Si la cuenta no existe, el script termina con código 1. Si ya es ADMIN, no hace cambios.
- **Después de promover, la persona debe volver a hacer login.** El rol viaja dentro del JWT: el token emitido antes del cambio conserva el rol `USUARIO` hasta que vence (1 h) y la ruta administrativa le sigue respondiendo `403`.
- Para producción se ejecuta igual, con la `DATABASE_URL` de producción en el entorno de quien opera el script.

## Decisiones

Las decisiones sobre 403, 404, eliminación, asignación de ADMIN, campos no permitidos, código del login, normalización del email, valores iniciales, formato UUID del id y PATCH vacío están en [docs/decisiones.md](docs/decisiones.md).
