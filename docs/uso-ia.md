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
