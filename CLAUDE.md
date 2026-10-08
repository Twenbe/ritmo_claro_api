# CLAUDE.md — Ritmo Claro API

Proyecto del taller evaluativo "Ritmo Claro API" (módulos 2 y 3). El enunciado completo está en `docs/taller.pdf` (excluido de Git). Se construye en diez partes: una parte por sesión y un commit por parte.

## Reglas permanentes

1. **Stack**: Node LTS, NestJS 11, Prisma 7 con PostgreSQL (cliente generado en `src/generated/prisma`), `@nestjs/config`, JWT, Passport, bcrypt, class-validator, class-transformer, `@nestjs/swagger` y Helmet. No agregar librerías ni entidades fuera del alcance del taller.
2. **Nombres de dominio en español** según el contrato: `Usuario`, `Habito`, `usuarioId`, rol `USUARIO`/`ADMIN`, estado `ACTIVO`/`PAUSADO`/`ARCHIVADO`, frecuencia `DIARIA`/`SEMANAL`/`MENSUAL`.
3. **Reglas no negociables** (página 3 del taller):
   - `usuarioId` se obtiene del JWT; nunca se acepta desde el body.
   - Privacidad: un usuario no consulta, edita ni elimina hábitos de otra persona.
   - El registro siempre crea `USUARIO`; la ruta global exige `ADMIN`.
   - `DATABASE_URL` y `JWT_SECRET` quedan fuera del código y del repositorio.
   - Las respuestas de error no exponen contraseñas, secretos, stack traces ni detalles internos.
4. **Trabajar solo la parte pedida**; no adelantar las siguientes.
5. **Al terminar cada parte**: verificar que compila (`npm run build` cuando exista) y hacer un solo commit con el mensaje `feat(parte-N): <resumen>`. No hacer push salvo petición expresa.
6. **Nunca** escribir en archivos, commits ni en el chat valores reales de `.env`, tokens o contraseñas reales. El archivo `.env` lo crea el usuario.
7. **Después del commit**, explicar en español y sin relleno: archivos tocados y responsabilidad de cada uno, cómo fluye la lógica, cómo probarlo manualmente y qué preguntas de la sustentación (página 19) quedan respondidas con esa parte.
8. **Mantener `docs/uso-ia.md`** con una entrada por parte: fecha, prompt recibido y resumen de lo generado.

## Referencias del proyecto

- Requisitos, historias, matriz de endpoints y criterios de aceptación: `README.md`.
- Decisiones de alcance y permisos: `docs/decisiones.md`.
- Contrato de error: toda respuesta de error expone `statusCode`, `timestamp`, `path` y `message` (400, 401, 403, 404, 409 y 500 genérico).

## Partes del taller

1. Requisitos, permisos y criterios de aceptación.
2. Proyecto NestJS y arquitectura modular.
3. Modelo Prisma, migración y persistencia PostgreSQL.
4. Registro, login, bcrypt, JWT y Passport.
5. CRUD REST de hábitos conectado a la base de datos.
6. Propiedad de recursos, roles y ruta administrativa.
7. Validaciones, errores estructurados y seguridad básica.
8. Swagger, accesibilidad documental y pruebas manuales.
9. Repositorio reproducible y contenedor Docker.
10. Base en la nube, despliegue y prueba pública.
