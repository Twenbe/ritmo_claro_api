# Uso de IA

Registro del apoyo de IA (Claude Code) en el taller. Hay una entrada por parte con la fecha, el prompt utilizado y un resumen de lo generado.

---

## Parte 1 — Requisitos, permisos y criterios de aceptación

**Fecha:** 2026-10-08

**Prompt:**

```text
Lee completo docs/taller.pdf. Es el enunciado del taller "Ritmo Claro API", que vamos a construir por partes: una parte por sesión y un commit por parte.

Primero inicializa git y crea CLAUDE.md en la raíz con estas reglas permanentes:
1. Stack: Node LTS, NestJS 11, Prisma 7 con PostgreSQL (cliente generado en src/generated/prisma), @nestjs/config, JWT, Passport, bcrypt, class-validator, class-transformer, @nestjs/swagger y Helmet. No agregues librerías ni entidades fuera del alcance del taller.
2. Nombres de dominio en español según el contrato: Usuario, Habito, usuarioId, rol USUARIO/ADMIN, estado ACTIVO/PAUSADO/ARCHIVADO, frecuencia DIARIA/SEMANAL/MENSUAL.
3. Reglas no negociables del taller (página 3): usuarioId sale del JWT, privacidad entre usuarios, registro siempre crea USUARIO, secretos fuera del código y errores sin detalles internos.
4. Trabaja solo la parte que te pida y no adelantes las siguientes.
5. Al terminar cada parte, verifica que compila (npm run build cuando exista) y haz un solo commit con el mensaje "feat(parte-N): <resumen>". No hagas push salvo que te lo pida.
6. Nunca escribas en archivos, commits ni en el chat valores reales de .env, tokens o contraseñas reales. El archivo .env lo creo yo.
7. Después del commit, explícame en español y sin relleno qué archivos tocaste y la responsabilidad de cada uno, cómo fluye la lógica, cómo lo pruebo yo mismo y qué preguntas de la sustentación (página 19) quedan respondidas con esta parte.
8. Mantén docs/uso-ia.md con una entrada por parte que incluya la fecha, el prompt que te di y un resumen de lo que generaste.

Crea .gitignore con docs/taller.pdf, .env, node_modules, dist y logs.

Luego haz la Parte 1 del taller, sin código:
- README.md con el problema, los actores y el valor del MVP (máximo dos párrafos), al menos ocho historias de usuario repartidas entre visitante, USUARIO y ADMIN, cada una con actor, acción y resultado verificable, la matriz de los ocho endpoints con actor autorizado y resultado esperado, y criterios de aceptación positivos y negativos para registro, login, CRUD, propiedad y rol.
- docs/decisiones.md con estas decisiones y una justificación breve de cada una. Un id inexistente da 404. Un hábito que existe pero es de otra persona da 403, también para ADMIN en las rutas /habitos/:id, porque ADMIN solo administra sus propios hábitos y consulta los demás por /habitos/admin/todos. La eliminación es física, responde 204 y la consulta posterior da 404. El rol ADMIN se asigna con un script interno documentado, nunca por API. Los campos no permitidos en el body (como rol o usuarioId) se rechazan con 400.

Commit al final.
```

**Resumen de lo generado:**

- Repositorio git inicializado en la rama `main`.
- `.gitignore` con `docs/taller.pdf`, `.env`, `node_modules`, `dist` y logs.
- `CLAUDE.md` con las ocho reglas permanentes y la lista de las diez partes.
- `README.md` con el problema, los actores y el valor del MVP en dos párrafos; 16 historias de usuario (5 de visitante, 7 de USUARIO, 3 de ADMIN y 1 sin token); la matriz de los ocho endpoints con acceso, actor, resultado y rechazos; el contrato de error, y criterios de aceptación positivos y negativos para registro, login, CRUD, propiedad y rol.
- `docs/decisiones.md` con las cinco decisiones pedidas (D-01 a D-05), cada una con justificación y criterio de comprobación, el orden de evaluación 401 → 400 → 404 → 403, y una tabla de puntos abiertos que el contrato no fija (código del login, mayúsculas en el email, valor inicial de frecuencia, formato del id y PATCH vacío), con la parte en que se resuelve cada uno.
- No se generó código.

---

## Parte 1 (ajuste) — Cierre de decisiones abiertas y guías de clase

**Fecha:** 2026-10-08

**Prompt:**

```text
Antes de la Parte 2, ajusta la documentación de la Parte 1:

1. Agrega a CLAUDE.md esta regla 9:
9. Antes de implementar cada parte, consulta la guía de clase correspondiente y los proyectos de clase que están abiertos en este espacio de trabajo, fuera de Modulo_3/ritmo_claro_api. Úsalos solo como referencia, sin modificarlos(igual puedes ver todas las clases que tuvimos de la 1 a la 4 del modulo 3). Sigue sus convenciones (configuración de Prisma 7, estructura de auth, guards, filtro de errores, Dockerfile) siempre que no contradigan el taller. Las guías tienen algunos errores: si algo no funciona o contradice el taller o la documentación oficial, avísame y explícame la diferencia en vez de copiarlo. No copies el contenido de las guías al repositorio.
   Guía por parte:
   - Parte 2: https://anamariaalvaradom.github.io/Dev_JavaScript_Viernes_Apoyos_Visuales/docs/M2-C1-spa.html
   - Parte 3: https://anamariaalvaradom.github.io/Dev_JavaScript_Viernes_Apoyos_Visuales/docs/clase-02-modelado-prisma-postgresql-v2.html
   - Parte 4: https://anamariaalvaradom.github.io/Dev_JavaScript_Viernes_Apoyos_Visuales/docs/M3/Clase1/M3C1-autenticacion-registro-jwt.html
   - Parte 5: https://anamariaalvaradom.github.io/Dev_JavaScript_Viernes_Apoyos_Visuales/docs/Clase3_Modulo2.html, https://anamariaalvaradom.github.io/Dev_JavaScript_Viernes_Apoyos_Visuales/docs/clase4M2.html y https://anamariaalvaradom.github.io/Dev_JavaScript_Viernes_Apoyos_Visuales/docs/Repaso-Finanzas-API-SPA.html
   - Parte 6: https://anamariaalvaradom.github.io/Dev_JavaScript_Viernes_Apoyos_Visuales/docs/M3/Clase2/DevSenior_M3C2_RBAC.html
   - Partes 7 y 8: https://anamariaalvaradom.github.io/Dev_JavaScript_Viernes_Apoyos_Visuales/docs/M3/Clase3/index.html
   - Partes 9 y 10: https://anamariaalvaradom.github.io/Dev_JavaScript_Viernes_Apoyos_Visuales/docs/M3/Clase4/M3C4-deploy-docker-produccion.html

2. Cierra los puntos abiertos de docs/decisiones.md con estas decisiones y una justificación breve de cada una:
   - El login exitoso responde 200, porque no crea un recurso.
   - El email no distingue mayúsculas. Se normaliza con trim y minúsculas en registro y login antes de guardar o comparar.
   - frecuencia tiene como valor inicial DIARIA y estado tiene ACTIVO.
   - Un id que no tiene formato UUID responde 400 (ParseUUIDPipe). Un UUID válido que no existe responde 404.
   - Un PATCH con body vacío responde 400 con el mensaje "Envía al menos un campo para actualizar".

3. Actualiza el README para que coincida (quita el asterisco del login y ajusta los criterios de aceptación afectados), elimina la tabla de puntos abiertos y agrega la entrada correspondiente en docs/uso-ia.md.

Commit con el mensaje "docs(parte-1): cierra decisiones abiertas y agrega guías de clase".
```

**Resumen de lo generado:**

- `CLAUDE.md`: regla 9, que pide consultar la guía de clase y los proyectos de clase antes de cada parte, solo como referencia, e incluye la lista de guías por parte.
- `docs/decisiones.md`: se eliminó la tabla de puntos abiertos y se agregaron D-06 (login 200), D-07 (email normalizado con trim y minúsculas), D-08 (valores iniciales `ACTIVO` y `DIARIA`), D-09 (id sin formato UUID → 400 con `ParseUUIDPipe`) y D-10 (PATCH vacío → 400 con mensaje fijo), cada una con justificación y criterios de comprobación. D-01 ahora distingue el UUID inexistente del formato inválido.
- `README.md`:
  - Matriz: login con `200` y sin asterisco; rechazos `400` por formato UUID y por body vacío en las rutas por id.
  - HU-04, HU-06 y HU-08 actualizadas.
  - Contrato de error: casos nuevos de `400` y ejemplo de `path` con un UUID.
  - Criterios: renumerados los de registro (CA-REG-01 a 08) y login (CA-LOG-01 a 06) para incluir la normalización del email; nuevos CA-CRUD-11 (UUID inválido) y CA-CRUD-12 (PATCH vacío); ajustado CA-CRUD-01 por los valores iniciales.

---

## Parte 2 — Proyecto NestJS y arquitectura modular

**Fecha:** 2026-10-08

**Prompt:**

```text
Trabaja solo en Modulo_3/ritmo_claro_api: lee primero su CLAUDE.md y ejecuta todos los comandos dentro de esa carpeta.

Parte 2 del taller, según CLAUDE.md y docs/taller.pdf.

1. Muéstrame node --version y npm --version.
2. Genera el proyecto con @nestjs/cli@11 usando npm y sin git propio. Como la carpeta ya tiene README.md, docs/, CLAUDE.md y .gitignore, genéralo de forma que no los pierdas: conserva mi README y fusiona los .gitignore.
3. Instala @nestjs/config, Prisma 7 con su driver adapter de PostgreSQL según la documentación oficial de Prisma 7, @nestjs/jwt, @nestjs/passport, passport, passport-jwt, bcrypt, class-validator, class-transformer, @nestjs/swagger y helmet, con los tipos necesarios. Usa bcrypt, no bcryptjs.
4. Crea los módulos prisma, auth y habitos con sus controllers y services donde correspondan, y las carpetas dto. PrismaModule será global y solo tendrá service por ahora.
5. Importa ConfigModule como global y los módulos funcionales en AppModule. main.ts queda solo como punto de configuración global y lee PORT del entorno con 3000 por defecto.
6. Arranca con npm run start:dev, confirma que responde y muéstrame el árbol de src.

Commit al final.
```

**Resumen de lo generado:**

- Versiones: Node v24.18.0 y npm 11.16.0.
- Proyecto generado con `npx @nestjs/cli@11 new ritmo-claro-api --package-manager npm --skip-git --skip-install` en una carpeta temporal y copiado sin sobrescribir `README.md`, `CLAUDE.md`, `docs/` ni `.gitignore`. Con `--skip-git` Nest no genera `.gitignore`, así que se fusionaron las reglas propias con el `.gitignore` estándar de Nest que usan los proyectos de clase.
- Dependencias:
  - Producción: `@nestjs/config@4`, `@nestjs/jwt@11`, `@nestjs/passport@11`, `@nestjs/swagger@11`, `passport`, `passport-jwt`, `bcrypt`, `class-validator`, `class-transformer`, `helmet`, `@prisma/client@7`, `@prisma/adapter-pg@7`, `pg` y `dotenv`.
  - Desarrollo: `prisma@7`, `@types/pg`, `@types/bcrypt` y `@types/passport-jwt`.
  - Los `@nestjs/*` se fijaron a versiones mayores compatibles con Nest 11, porque `@nestjs/swagger@latest` (12.x) exige Nest 12.
  - `dotenv` y `@types/pg` vienen de la guía oficial de Prisma 7; `prisma.config.ts` los necesita en la Parte 3.
- Módulos generados con el CLI (`--no-spec`): `prisma` (global, solo service exportado), `auth` y `habitos` (module, controller y service), más las carpetas `dto` con `.gitkeep`.
- `AppModule` importa `ConfigModule.forRoot({ isGlobal: true })` y los tres módulos. `main.ts` lee `PORT` con `ConfigService` y usa 3000 por defecto.
- Verificación: lint sin advertencias, `npm run build` correcto, test unitario de la plantilla en verde y `npm run start:dev` con `GET /` → 200.

---

## Parte 3 — Modelo Prisma, migración y persistencia PostgreSQL

**Fecha:** 2026-10-08

**Prompt:**

```text
Trabaja solo en Modulo_3/ritmo_claro_api: lee primero su CLAUDE.md y ejecuta todos los comandos dentro de esa carpeta.

Parte 3 del taller, según CLAUDE.md y docs/taller.pdf.

1. Inicializa Prisma 7 para PostgreSQL con prisma.config.ts y el cliente generado en src/generated/prisma. Verifica en la guía de clase y en la documentación de Prisma 7 la configuración correcta del generador y del adapter de PostgreSQL, y que el cliente compile con NestJS en CommonJS.
2. Modela según el contrato de la página 4 y docs/decisiones.md:
   - Usuario con id uuid autogenerado, nombre, email único, passwordHash, rol (enum Rol, default USUARIO) y creadoEn.
   - Habito con id uuid, nombre VarChar(120), descripcion opcional VarChar(500), estado (enum EstadoHabito, default ACTIVO), frecuencia (enum Frecuencia, default DIARIA), usuarioId con FK a Usuario y borrado en cascada, creadoEn e índice por usuarioId.
3. Crea .env.example con DATABASE_URL, JWT_SECRET y PORT con valores ficticios. El archivo .env ya lo creé yo con mis valores reales: no lo modifiques ni muestres su contenido. Solo verifica que defina las tres variables.
4. Ejecuta npx prisma format, npx prisma migrate dev --name modelo_inicial y npx prisma generate contra mi base local ritmo_claro.
5. Implementa PrismaService con el adapter, conexión en onModuleInit y desconexión al cerrar, exportado desde el PrismaModule global.
6. Agrega src/generated a .gitignore y asegúrate de que npm run build regenere el cliente. prisma/migrations sí va en git.
7. Crea docs/modelo.md con un diagrama Mermaid de la relación, señalando la clave primaria y la foránea.
8. Dime cómo verificar en Prisma Studio las tablas, el email único y los enums, y cómo comprobar que los datos persisten al reiniciar.

Commit al final.
```

**Resumen de lo generado:**

- Se contrastaron la guía de clase, el proyecto de clase y la documentación oficial de Prisma 7.
  - Generador `prisma-client` con `output = "../src/generated/prisma"` y `moduleFormat = "cjs"`.
  - Datasource sin `url`: la URL va en `prisma.config.ts`, que la lee de `DATABASE_URL` con `dotenv/config`.
  - `prisma init` 7.10 genera `prisma7.config.ts` y además crea `.env`, `.gitignore` y carpetas de skills para agentes. Por eso se ejecutó en una carpeta temporal y solo se trajo su contenido.
  - Se usa `prisma.config.ts`, como piden el taller y la clase. El CLI 7.10 lo sigue cargando cuando no existe `prisma7.config.ts`.
- `prisma/schema.prisma` con los enums `Rol`, `EstadoHabito` y `Frecuencia` y los modelos `Usuario` (`@@map("usuarios")`) y `Habito` (`@@map("habitos")`): ids UUID, `email` único, `VarChar(120)` y `VarChar(500)`, valores iniciales `USUARIO`, `ACTIVO` y `DIARIA`, FK `usuarioId` con `onDelete: Cascade` e índice por `usuarioId`.
- Migración `20261008201005_modelo_inicial` aplicada en la base local `ritmo_claro`, y cliente generado.
- `.env.example` con valores ficticios. `.env` no se leyó ni se modificó: solo se comprobó que define las tres variables y se comparó su hash antes y después.
- `PrismaService` extiende `PrismaClient` con el adapter `PrismaPg`. Toma la URL con `ConfigService.getOrThrow('DATABASE_URL')`, conecta en `onModuleInit` y desconecta en `onModuleDestroy`; `main.ts` llama a `app.enableShutdownHooks()` para que la desconexión también ocurra con SIGTERM o Ctrl+C.
- `.gitignore` ignora `/src/generated` y `eslint.config.mjs` lo excluye del lint (el código generado no se edita a mano); el script `prebuild` (`prisma generate`) regenera el cliente en cada `npm run build`.
- Corrección necesaria: `prisma.config.ts` se excluyó en `tsconfig.build.json`. Si no, `tsc` lo compilaba y movía la salida a `dist/src/main.js`, y `start:prod` (`node dist/main`) dejaba de funcionar.
- `docs/modelo.md` con un diagrama Mermaid (PK, FK, UK) y una tabla de claves y restricciones.
- Verificación:
  - build desde cero (sin cliente ni `dist`);
  - `node dist/main` arranca y `GET /` → 200;
  - consulta real con el cliente CJS compilado (`usuario.count` y `habito.count`);
  - `prisma migrate status` reporta el esquema al día.

---

## Parte 4 — Registro, login, bcrypt, JWT y Passport

**Fecha:** 2026-10-08

**Prompt:**

```text
Trabaja solo en Modulo_3/ritmo_claro_api: lee primero su CLAUDE.md y ejecuta todos los comandos dentro de esa carpeta.

Parte 4 del taller, según CLAUDE.md y docs/taller.pdf.

1. RegisterDto con nombre, email y password, y LoginDto con email y password. Ninguno acepta rol. Las reglas completas de validación van en la Parte 7, pero deja ya los decoradores básicos.
2. AuthService.register normaliza el email (trim y minúsculas), responde 409 si ya existe (verificando antes y también capturando el error de unicidad de Prisma), guarda solo el hash con bcrypt (10 rondas) y devuelve 201 con id, nombre, email, rol y creadoEn, nunca passwordHash.
3. AuthService.login normaliza el email igual y responde 401 con el mensaje genérico "Credenciales inválidas" tanto si el email no existe como si la contraseña falla. Si son correctas, devuelve 200 con { access_token }.
4. El JWT lleva sub, email y rol, expira en 1 hora y se firma con JWT_SECRET leído con ConfigService (JwtModule.registerAsync). Si JWT_SECRET falta, la app no debe arrancar.
5. Crea jwt.strategy.ts (devuelve { id, email, rol } desde el payload), jwt-auth.guard.ts y el decorador @UsuarioActual() en usuario-actual.decorator.ts.
6. No agregues rutas fuera del contrato. Las pruebas de token ausente o alterado las haremos contra /habitos en la Parte 5.
7. Prueba con curl el registro válido, el email duplicado (también con mayúsculas distintas), el login válido y la contraseña incorrecta, y muéstrame los status obtenidos. Explícame qué contiene el token decodificado sin mostrar el secreto.

Commit al final.
```

**Resumen de lo generado:**

- Referencia: la guía de clase y `Clase3/finanzas-api`. Se siguió su estructura, con estas diferencias:
  - `JwtModule.registerAsync` con `ConfigService`, en lugar de `register` con `process.env`: este último puede leer el secreto antes de que se cargue `.env`.
  - El error de configuración no se lanza como `UnauthorizedException`.
  - Se normaliza el email y se captura el `P2002` de Prisma.
  - `@HttpCode(200)` en el login.
  - El registro devuelve también `rol` y `creadoEn`.
- `RegisterDto` y `LoginDto` con decoradores básicos (`IsString`, `IsNotEmpty`, `IsEmail`), sin `rol`. Todavía no actúan: el `ValidationPipe` global llega en la Parte 7.
- `AuthService`:
  - `register` normaliza el email (trim y minúsculas), verifica si ya existe → 409, guarda `bcrypt.hash` con 10 rondas y captura `P2002` → 409. Devuelve `id`, `nombre`, `email`, `rol` y `creadoEn` con `select`.
  - `login` normaliza el email y responde 401 "Credenciales inválidas" en ambos casos de fallo. Firma `{ sub, email, rol }`.
- `AuthController`: `POST /auth/register` (201) y `POST /auth/login` (`@HttpCode(200)`).
- `AuthModule`: `PassportModule`, `JwtModule.registerAsync` (secreto con `getOrThrow`, `expiresIn: '1h'`) y `JwtStrategy`.
- `jwt.strategy.ts` (Bearer, `ignoreExpiration: false`, devuelve `{ id, email, rol }`, exporta los tipos `JwtPayload` y `UsuarioAutenticado`), `jwt-auth.guard.ts` y `usuario-actual.decorator.ts`.
- `AppModule`: `ConfigModule` valida al arrancar que `DATABASE_URL` y `JWT_SECRET` existan y no estén vacías. `getOrThrow` solo detecta `undefined`, no la cadena vacía.
- Pruebas con curl (puerto de prueba 3999):
  - registro válido → 201 sin `passwordHash`;
  - duplicado → 409; duplicado con otras mayúsculas → 409;
  - `rol: ADMIN` en el body → 201 con rol `USUARIO` (el rechazo con 400 llega en la Parte 7);
  - contraseña incorrecta → 401; email inexistente → 401 con el mismo mensaje;
  - login válido con otras mayúsculas → 200 con `access_token`.
- Otras verificaciones:
  - el payload decodificado contiene `sub`, `email`, `rol`, `iat` y `exp`, con `exp - iat` = 1 h;
  - 5 registros simultáneos con el mismo email → un 201 y cuatro 409, sin errores 500;
  - en la base solo hay hashes `$2b$10$` de 60 caracteres;
  - con `JWT_SECRET` vacía la app no arranca ("Falta la variable de entorno JWT_SECRET").
- Los usuarios de prueba se eliminaron de la base local al terminar.

---

## Parte 5 — CRUD de hábitos

**Fecha:** 2026-10-08

**Prompt:**

```text
Trabaja solo en Modulo_3/ritmo_claro_api: lee primero su CLAUDE.md y ejecuta todos los comandos dentro de esa carpeta.

Parte 5 del taller, según CLAUDE.md y docs/taller.pdf.

1. crear-habito.dto.ts con nombre, descripcion opcional, estado opcional y frecuencia opcional, usando los enums del cliente generado. actualizar-habito.dto.ts con PartialType de @nestjs/swagger. Ninguno acepta id, usuarioId ni creadoEn.
2. Protege todo HabitosController con JwtAuthGuard y obtén el usuario con @UsuarioActual().
3. Implementa POST /habitos (201, dueño tomado del token), GET /habitos (solo los propios), GET /habitos/:id, PATCH /habitos/:id (solo los campos enviados) y DELETE /habitos/:id (204). Valida :id con ParseUUIDPipe.
4. Por ahora el id inexistente responde 404. La verificación de propiedad con 403 va en la Parte 6.
5. Un PATCH con body vacío responde 400 con "Envía al menos un campo para actualizar", antes de consultar la base, según D-10.
6. Todas las consultas Prisma van en HabitosService. El controller solo maneja HTTP y nunca incluye datos del usuario dueño en la respuesta.
7. Prueba con curl la secuencia completa: sin token (401), token alterado (401), crear, listar, consultar, PATCH de un solo campo verificando que los demás se conservan, PATCH vacío (400), id con formato inválido (400), eliminar y volver a consultar (404). Confirma los defaults de estado y frecuencia. Muéstrame los status.

Commit al final.
```

**Resumen de lo generado:**

- Referencias: las guías `Clase3_Modulo2`, `clase4M2` y `Repaso-Finanzas-API-SPA`, y `Clase3/finanzas-api`. Diferencias:
  - `PartialType` de `@nestjs/swagger` en lugar de `@nestjs/mapped-types`.
  - `DELETE` con 204 (D-03) en lugar de 200.
  - Campos copiados uno a uno en lugar de `data: dto`: sin whitelist, el body completo llegaría a Prisma.
  - Verificación de existencia antes de `update` y `delete` (404) en lugar de dejar que `P2025` dé 500.
  - Se detectó un bug en la guía `clase4M2`: el `remove` de categorías borra en el modelo `transaccion`.
- `CrearHabitoDto` (nombre, y opcionales descripcion, estado y frecuencia, con `IsEnum` sobre los enums del cliente generado) y `ActualizarHabitoDto` (`PartialType`). Ninguno declara `id`, `usuarioId` ni `creadoEn`.
- `HabitosService` concentra todas las consultas Prisma:
  - Un `select` fijo (`CAMPOS_HABITO`) que nunca incluye datos del usuario dueño.
  - `crear` toma el dueño del token y copia los campos permitidos uno a uno.
  - `listarPropios` filtra por `usuarioId`.
  - `obtenerUno` responde 404 si el id no existe.
  - `actualizar` responde 400 con D-10 antes de consultar la base; también cubre el body `undefined` de Express 5 y un body que solo trae campos no permitidos. Luego verifica existencia y actualiza solo los campos definidos.
  - `eliminar` verifica existencia y borra físicamente.
- `HabitosController`: `@UseGuards(JwtAuthGuard)` a nivel de clase, `@UsuarioActual()`, `ParseUUIDPipe` en `:id` y `@HttpCode(204)` en `DELETE`. No consulta Prisma.
- Pruebas con curl (puerto de prueba 3999), sin errores 500 en el log:
  - sin token → 401; token alterado → 401;
  - POST → 201 con `estado: ACTIVO` y `frecuencia: DIARIA` por defecto y `usuarioId` igual al `sub`;
  - POST con un `usuarioId` falso → se ignora y se usa el del token;
  - GET lista → 200 solo con hábitos propios; GET por id → 200;
  - PATCH de `estado` → 200 y los demás campos se conservan;
  - PATCH `{}`, sin body o solo con `usuarioId` → 400;
  - `/habitos/abc` → 400; UUID inexistente → 404;
  - DELETE → 204 sin cuerpo, y la consulta posterior → 404.
- Hueco documentado hasta la Parte 6: un segundo usuario obtiene 200 al leer por id un hábito ajeno; su listado sí está aislado.
- Los usuarios de prueba (y sus hábitos, por cascada) se eliminaron de la base local.

---

## Parte 6 — Roles, propiedad y ruta administrativa

**Fecha:** 2026-10-08

**Prompt:**

```text
Trabaja solo en Modulo_3/ritmo_claro_api: lee primero su CLAUDE.md y ejecuta todos los comandos dentro de esa carpeta.

Parte 6 del taller, según CLAUDE.md y docs/taller.pdf.

1. En HabitosService, antes de entregar, editar o eliminar por id: si no existe responde 404, si existe y su usuarioId no coincide con el del token responde 403 con un mensaje genérico. Aplica igual para ADMIN, según docs/decisiones.md.
2. Crea roles.decorator.ts (@Roles con el enum Rol) y roles.guard.ts, que usa Reflector, se ejecuta después de JwtAuthGuard y responde 403 si el rol no está permitido.
3. Agrega GET /habitos/admin/todos con JwtAuthGuard, RolesGuard y @Roles(ADMIN), declarado antes de las rutas con :id. Usa un select explícito: los campos del hábito y del usuario solo id y nombre. passwordHash nunca sale.
4. Crea un script npm "admin:promover" que reciba un email y cambie su rol a ADMIN usando la DATABASE_URL del entorno. Documenta en README que, tras promover, hay que volver a hacer login porque el token anterior conserva el rol viejo.
5. Prueba con curl con el usuario A, el usuario B y un ADMIN promovido con el script. A crea un hábito, B intenta verlo, editarlo y borrarlo (403 en cada caso), USUARIO llama la ruta admin (403), ADMIN la llama (200) y sin token (401). Muéstrame una tabla con los status observados y actualiza la matriz de permisos del README con esos códigos.

Commit al final.
```

**Resumen de lo generado:**

- Referencias: la guía `DevSenior_M3C2_RBAC` y `Clase3/finanzas-api`.
  - Se mantuvo `Reflector.createDecorator<Rol[]>()`, que se usa como `@Roles([Rol.ADMIN])`.
  - El guard usa `getAllAndOverride` (método y clase) en lugar de `get` (solo método).
  - El listado admin usa un `select` con solo `id` y `nombre` del dueño; la clase hace `include` con `email`.
  - La clase no tiene un script de promoción.
- `roles.decorator.ts` y `roles.guard.ts`: el guard lee la metadata con `Reflector`, deja pasar si la ruta no declara roles y responde 403 con un mensaje genérico si el rol del token no está permitido.
- `HabitosService`:
  - `obtenerUno`, `actualizar` y `eliminar` reciben el `usuarioId` del token y comprueban primero la existencia (404) y luego la propiedad (403 "No tienes permiso para acceder a este hábito"), también para ADMIN (D-02). D-10 sigue evaluándose antes de consultar la base.
  - `listarTodos` usa un `select` explícito con los campos del hábito más `usuario: { id, nombre }`.
- `HabitosController`: `GET /habitos/admin/todos` con `@UseGuards(RolesGuard)` y `@Roles([Rol.ADMIN])`, declarada antes de las rutas con `:id`. `JwtAuthGuard` está a nivel de clase y por eso se ejecuta primero.
- `scripts/promover-admin.js` y el script npm `admin:promover`:
  - JavaScript plano con el cliente Prisma compilado en `dist/`. No usa `ts-node`, porque el cliente generado importa archivos `.js` que son `.ts`. Así también funciona dentro de la imagen Docker.
  - Normaliza el email, termina con código 1 si la cuenta no existe, no hace cambios si ya es ADMIN y nunca imprime la cadena de conexión.
- README:
  - La matriz tiene una columna "Observado (local, 2026-10-08)".
  - Nueva sección "Asignar el rol ADMIN", que advierte que hay que volver a iniciar sesión.
  - D-04 en `decisiones.md` apunta al script.
- Pruebas con curl (puerto de prueba 3999), sin errores 500:
  - A: 200 al ver su hábito, 200 al editarlo y 204 al eliminarlo.
  - B sobre el hábito de A: ver, editar y borrar → 403 en cada caso; UUID inexistente → 404.
  - ADMIN sobre el hábito de A por `/habitos/:id`: ver, editar y borrar → 403. El hábito quedó intacto.
  - USUARIO en `admin/todos` → 403; token emitido antes de promover → 403; ADMIN → 200 con los hábitos de las tres personas, sin `passwordHash` ni `email`; sin token → 401.
- Los usuarios de prueba se eliminaron de la base local.

---

## Parte 7 — Validación, errores estructurados y seguridad básica

**Fecha:** 2026-10-08

**Prompt:**

```text
Trabaja solo en Modulo_3/ritmo_claro_api: lee primero su CLAUDE.md y ejecuta todos los comandos dentro de esa carpeta.

Parte 7 del taller, según CLAUDE.md y docs/taller.pdf.

1. Validación de registro: nombre mínimo 2 caracteres, email válido y password mínimo 8. Validación de hábitos: nombre entre 3 y 120, descripcion opcional hasta 500 y enums válidos. Mensajes en español y comprensibles.
2. ValidationPipe global con whitelist, transform y forbidNonWhitelisted. Confirma que docs/decisiones.md documenta que enviar rol o usuarioId produce 400.
3. Crea http-exception.filter.ts global que responda siempre { statusCode, timestamp, path, message }:
   - HttpException conserva su status y mensaje (los errores de validación como lista legible).
   - El error de unicidad de Prisma da 409 y el de registro no encontrado da 404.
   - Cualquier otro error da 500 con "Error interno del servidor" y registra el detalle completo solo con Logger.
   - El 401 de Passport sale en español dentro del mismo contrato.
4. Activa Helmet en main.ts.
5. Prueba con curl y muéstrame las respuestas de: nombre corto, email inválido, enum inventado, campo rol en el registro, JSON mal formado, PATCH vacío (400), sin token (401), hábito ajeno (403), id inexistente (404) y email repetido (409). Para el 500, detén el servicio de PostgreSQL, haz una petición y muéstrame que la respuesta es genérica mientras el log conserva el diagnóstico. Luego dime cómo volver a iniciar el servicio. No dejes código de prueba en el repositorio.
6. Confirma que ninguna respuesta incluye stack, passwordHash, JWT_SECRET ni DATABASE_URL.

Commit al final.
```

(Durante la sesión: "Listo, PostgreSQL está detenido". El servicio lo detuvo el usuario, porque la sesión de la IA no tiene privilegios de administrador.)

**Resumen de lo generado:**

- Referencias: la guía `M3/Clase3` y `Clase3/finanzas-api`. Diferencias:
  - Un solo filtro con `Logger` en lugar de dos filtros (general y Prisma) con `console.error`.
  - Se agregó `forbidNonWhitelisted` (D-05).
  - Se tradujeron los mensajes que la clase deja en inglés.
- DTO con mensajes en español:
  - Registro: nombre ≥ 2 caracteres, email válido y password ≥ 8.
  - Login: email válido y password obligatoria.
  - Hábito: nombre de 3 a 120 caracteres, descripción ≤ 500 y enums que listan sus valores válidos.
- `main.ts`: Helmet, `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`, `exceptionFactory`) y el filtro global.
- `src/common/validacion.ts`: aplana los errores de class-validator en una lista y traduce "property X should not exist" a "El campo X no está permitido".
- `src/common/filters/http-exception.filter.ts` (`@Catch()`), siempre con `{ statusCode, timestamp, path, message }`:
  - Una `HttpException` conserva su status y mensaje.
  - Prisma `P2002` → 409 y `P2025` → 404.
  - Lo demás → 500 "Error interno del servidor", registrado con `Logger` incluyendo el código del error (por ejemplo `[ECONNREFUSED]`, que el stack de Prisma no muestra).
  - Traduce dos mensajes de Nest en inglés: el JSON mal formado (Nest convierte el `SyntaxError` en un `BadRequestException` con el texto de V8) y "Cannot GET /x".
- `JwtAuthGuard.handleRequest`: el 401 de Passport sale en español.
- `ParseUUIDPipe` con el mensaje "El id debe ser un UUID válido".
- Pruebas con curl (puerto de prueba 3999):
  - nombre corto, email inválido, enums inventados, `rol` o `usuarioId` en el body, longitudes, POST sin body, id `abc` y JSON mal formado → 400 en español;
  - PATCH vacío → 400; sin token o token alterado → 401; hábito ajeno → 403; id inexistente → 404; ruta inexistente → 404; email repetido → 409;
  - Helmet envía sus cabeceras.
- Revisión de 23 respuestas de error: sin stack, sin `passwordHash`, sin los nombres ni los valores reales de `JWT_SECRET` y `DATABASE_URL` (comparados sin imprimirlos), y todas con exactamente las 4 claves del contrato.
- 500 con PostgreSQL detenido: la respuesta es genérica y el log conserva la ruta, el tipo, el código `ECONNREFUSED`, la consulta y el stack.
- Hallazgo: con `PrismaPg`, `$connect()` no abre una conexión real, así que la app arranca aunque la base esté caída. Esto corrige lo explicado en la Parte 3.
