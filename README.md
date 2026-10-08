# Ritmo Claro API

API backend para gestionar hábitos de bienestar de los participantes de Ritmo Claro, con autenticación JWT, permisos por rol y propiedad, y persistencia en PostgreSQL.

> Estado: **Parte 1 — requisitos, permisos y criterios de aceptación.** Todavía no hay código; las secciones de instalación, variables, arquitectura, Docker y despliegue se agregan en las partes siguientes.

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

Las rutas `/habitos` exigen un JWT válido; si falta o está vencido o alterado, la respuesta es `401`.

| Método y ruta | Acceso | Actor autorizado | Resultado esperado | Rechazos esperados |
|---------------|--------|------------------|--------------------|--------------------|
| `POST /auth/register` | Público | Visitante | `201`: cuenta creada con rol `USUARIO` y email normalizado, sin `passwordHash`. No acepta `rol`. | `400` datos inválidos o campos no permitidos · `409` email repetido (sin distinguir mayúsculas) |
| `POST /auth/login` | Público | Visitante con cuenta | `200` con `access_token` (JWT con `sub`, `email`, `rol` y expiración de 1 h). | `400` datos con formato inválido · `401` credenciales inválidas (mensaje genérico) |
| `POST /habitos` | Con sesión | USUARIO, ADMIN | `201`: hábito creado con `usuarioId` tomado del token, `estado: ACTIVO` y `frecuencia: DIARIA` si no se envía. | `400` · `401` |
| `GET /habitos` | Con sesión | USUARIO, ADMIN | `200`: solo los hábitos propios. | `401` |
| `GET /habitos/:id` | Dueño | Dueño del hábito | `200`: el hábito. | `400` id sin formato UUID · `401` · `403` ajeno · `404` inexistente |
| `PATCH /habitos/:id` | Dueño | Dueño del hábito | `200`: actualiza solo los campos enviados. | `400` datos inválidos, body vacío o id sin formato UUID · `401` · `403` ajeno · `404` inexistente |
| `DELETE /habitos/:id` | Dueño | Dueño del hábito | `204` sin cuerpo; eliminación física. | `400` id sin formato UUID · `401` · `403` ajeno · `404` inexistente |
| `GET /habitos/admin/todos` | ADMIN | ADMIN | `200`: todos los hábitos, sin datos sensibles. | `401` · `403` si el rol es USUARIO |

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

## Decisiones

Las decisiones sobre 403, 404, eliminación, asignación de ADMIN, campos no permitidos, código del login, normalización del email, valores iniciales, formato UUID del id y PATCH vacío están en [docs/decisiones.md](docs/decisiones.md).
