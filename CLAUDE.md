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
5. **Al terminar cada parte**: verificar que compila (`npm run build` cuando exista) y hacer un solo commit con el mensaje `feat(parte-N): <resumen>`. Después del commit, confirmar con `git ls-files` que no se suben `.env` ni `docs/taller.pdf` y hacer push de `main` a `origin` (https://github.com/Twenbe/ritmo_claro_api.git).
6. **Nunca** escribir en archivos, commits ni en el chat valores reales de `.env`, tokens o contraseñas reales. El archivo `.env` lo crea el usuario.
7. **Después del commit**, explicar en español y sin relleno: archivos tocados y responsabilidad de cada uno, cómo fluye la lógica, cómo probarlo manualmente y qué preguntas de la sustentación (página 19) quedan respondidas con esa parte.
8. **Mantener `docs/uso-ia.md`** con una entrada por parte: fecha, prompt recibido y resumen de lo generado.
9. **Antes de implementar cada parte**, consultar la guía de clase correspondiente y los proyectos de clase del espacio de trabajo que están fuera de `Modulo_3/ritmo_claro_api` (incluidas las clases 1 a 4 del módulo 3). Usarlos solo como referencia, sin modificarlos. Seguir sus convenciones (configuración de Prisma 7, estructura de auth, guards, filtro de errores, Dockerfile) siempre que no contradigan el taller. Las guías tienen algunos errores: si algo no funciona o contradice el taller o la documentación oficial, avisar y explicar la diferencia en vez de copiarlo. No copiar el contenido de las guías al repositorio.

   Guía por parte:
   - Parte 2: https://anamariaalvaradom.github.io/Dev_JavaScript_Viernes_Apoyos_Visuales/docs/M2-C1-spa.html
   - Parte 3: https://anamariaalvaradom.github.io/Dev_JavaScript_Viernes_Apoyos_Visuales/docs/clase-02-modelado-prisma-postgresql-v2.html
   - Parte 4: https://anamariaalvaradom.github.io/Dev_JavaScript_Viernes_Apoyos_Visuales/docs/M3/Clase1/M3C1-autenticacion-registro-jwt.html
   - Parte 5: https://anamariaalvaradom.github.io/Dev_JavaScript_Viernes_Apoyos_Visuales/docs/Clase3_Modulo2.html, https://anamariaalvaradom.github.io/Dev_JavaScript_Viernes_Apoyos_Visuales/docs/clase4M2.html y https://anamariaalvaradom.github.io/Dev_JavaScript_Viernes_Apoyos_Visuales/docs/Repaso-Finanzas-API-SPA.html
   - Parte 6: https://anamariaalvaradom.github.io/Dev_JavaScript_Viernes_Apoyos_Visuales/docs/M3/Clase2/DevSenior_M3C2_RBAC.html
   - Partes 7 y 8: https://anamariaalvaradom.github.io/Dev_JavaScript_Viernes_Apoyos_Visuales/docs/M3/Clase3/index.html
   - Partes 9 y 10: https://anamariaalvaradom.github.io/Dev_JavaScript_Viernes_Apoyos_Visuales/docs/M3/Clase4/M3C4-deploy-docker-produccion.html

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
