# Decisiones de alcance y permisos

Registro de decisiones del proyecto Ritmo Claro API. Cada decisión indica qué se decidió, por qué, y cómo se comprueba.

## D-01. Un id inexistente responde 404

**Decisión.** `GET`, `PATCH` y `DELETE` sobre `/habitos/:id` responden `404` cuando el id es un UUID válido pero no existe ningún hábito con él, sin importar quién haga la petición. Un id que no es UUID responde `400` (ver D-09).

**Justificación.** El contrato reserva `404` para "el recurso no existe". La existencia se evalúa antes que la propiedad: si no hay hábito, no hay dueño contra el cual comparar.

**Comprobación.** CA-CRUD-10 y CA-CRUD-05 en el README.

## D-02. Un hábito ajeno responde 403, también para ADMIN

**Decisión.** Si el hábito existe pero su `usuarioId` no coincide con el `sub` del token, `GET`, `PATCH` y `DELETE` sobre `/habitos/:id` responden `403`. La regla aplica también a ADMIN: ADMIN administra solo sus propios hábitos por `/habitos/:id` y consulta los de los demás exclusivamente por `GET /habitos/admin/todos`.

**Justificación.** El contrato define `403` como "existe identidad pero no permiso", que es justo este caso. El MVP le da a ADMIN permiso de *consulta* global, no de edición ni eliminación de datos ajenos; abrir `/habitos/:id` a ADMIN ampliaría su privilegio más allá del contrato y rompería la regla de privacidad. Mantener una sola regla de propiedad para todas las rutas por id también hace más simple probarla.

**Orden de evaluación.** Primero autenticación (`401`), luego validación de la entrada (`400`), luego existencia (`404`) y por último propiedad (`403`).

**Comprobación.** CA-PRO-03 a CA-PRO-06.

## D-03. La eliminación es física y responde 204

**Decisión.** `DELETE /habitos/:id` borra la fila de la base de datos y responde `204` sin cuerpo. Una consulta posterior al mismo id responde `404`.

**Justificación.** El contrato pide "elimina un hábito propio" y la matriz de pruebas espera "éxito al borrar y 404 después". El estado `ARCHIVADO` ya cubre el caso de conservar un hábito sin usarlo, así que no hace falta un borrado lógico con un campo adicional fuera del modelo. `204` indica éxito sin contenido que devolver.

**Comprobación.** CA-CRUD-05.

## D-04. El rol ADMIN se asigna con un script interno, nunca por API

**Decisión.** Ninguna ruta de la API permite elegir o cambiar el rol. El registro siempre crea `USUARIO`. Para convertir una cuenta existente en ADMIN se usa un script interno, versionado y documentado en el README, que un operador ejecuta contra la base con las variables de entorno del entorno correspondiente. El script se implementa en la parte que corresponda; esta parte solo fija la regla.

**Justificación.** El contrato prohíbe una ruta pública para elegir o cambiar el rol, y la rúbrica penaliza los "roles confiados al cliente". Un script fuera del flujo HTTP exige acceso a la infraestructura, no solo una cuenta, y deja el procedimiento escrito y repetible.

**Consecuencia.** El rol viaja dentro del JWT. Un token emitido antes del cambio conserva el rol anterior hasta que vence (1 hora); para usar el rol nuevo, la persona debe iniciar sesión otra vez.

**Comprobación.** CA-ROL-02, CA-ROL-05 y CA-ROL-06.

## D-05. Los campos no permitidos en el body se rechazan con 400

**Decisión.** Cualquier campo que el DTO de la operación no declare (por ejemplo `rol` en el registro, o `usuarioId`, `id` o `creadoEn` en los hábitos) produce `400`. No se ignora en silencio.

**Justificación.** Ignorar en silencio un `rol: ADMIN` o un `usuarioId` ajeno esconde el intento y deja al cliente creyendo que el campo se aplicó. Rechazarlo hace visible el error de integración y deja una evidencia comprobable de que "ninguna entrada permite elegir rol o usuarioId". La identidad del dueño sale siempre del JWT.

**Comprobación.** CA-REG-07, CA-CRUD-09 y HU-03.

## D-06. El login exitoso responde 200

**Decisión.** `POST /auth/login` con credenciales válidas responde `200` con `access_token`.

**Justificación.** El login no crea un recurso: verifica credenciales y emite un token. `201 Created` sería engañoso para el cliente.

**Comprobación.** CA-LOG-01 y CA-LOG-02.

## D-07. El email no distingue mayúsculas

**Decisión.** En el registro y en el login, el email se normaliza con `trim` y minúsculas antes de guardarlo o compararlo. `Ana@Ejemplo.com ` y `ana@ejemplo.com` son la misma cuenta.

**Justificación.** El caso describe "correos duplicados" como uno de los problemas actuales. Sin normalizar, la restricción de email único dejaría pasar la misma dirección escrita con otras mayúsculas o con espacios, y una persona podría no lograr iniciar sesión por cómo escribió su correo.

**Comprobación.** CA-REG-03, CA-REG-05 y CA-LOG-02.

## D-08. Valores iniciales: estado ACTIVO y frecuencia DIARIA

**Decisión.** Un hábito nuevo nace con `estado: ACTIVO`. Si no se envía `frecuencia` al crearlo, toma el valor `DIARIA`. Ambos valores iniciales se definen en el modelo de datos.

**Justificación.** Un hábito recién creado está en uso, así que `ACTIVO` es su estado natural. `DIARIA` es la frecuencia más común en los ejemplos del caso (leer, pausas activas, meditar) y permite crear un hábito enviando solo el nombre. Definirlos en el modelo garantiza el mismo valor aunque cambie la capa HTTP.

**Comprobación.** CA-CRUD-01.

## D-09. Un id sin formato UUID responde 400

**Decisión.** El id de `Habito` es un UUID. En `/habitos/:id`, un id que no tiene formato UUID responde `400` (validado con `ParseUUIDPipe` antes de llegar al service). Un UUID válido que no existe responde `404` (D-01).

**Justificación.** Un valor que ni siquiera tiene la forma de un id es una entrada inválida, no un recurso ausente, y el contrato asigna `400` a los datos inválidos. Rechazarlo en la capa HTTP evita una consulta innecesaria a la base y un posible error interno de Prisma ante un formato inesperado.

**Comprobación.** CA-CRUD-10 y CA-CRUD-11.

## D-10. Un PATCH con body vacío responde 400

**Decisión.** `PATCH /habitos/:id` con un body sin campos responde `400` con el mensaje `"Envía al menos un campo para actualizar"`. Se evalúa como validación de la entrada, es decir, antes de la existencia y de la propiedad (orden de D-02).

**Justificación.** Un PATCH vacío no expresa ningún cambio. Responder `200` haría creer al cliente que actualizó algo, cuando lo más probable es un error de integración. El mensaje explícito le dice qué corregir.

**Comprobación.** CA-CRUD-12.
