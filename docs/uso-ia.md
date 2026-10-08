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
