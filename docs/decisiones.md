# Decisiones de alcance y permisos

Registro de decisiones del proyecto Ritmo Claro API. Cada decisión indica qué se decidió, por qué, y cómo se comprueba.

## D-01. Un id inexistente responde 404

**Decisión.** `GET`, `PATCH` y `DELETE` sobre `/habitos/:id` responden `404` cuando no existe ningún hábito con ese id, sin importar quién haga la petición.

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

**Comprobación.** CA-REG-05, CA-CRUD-09 y HU-03.

## Puntos abiertos

El contrato no los fija. Se resuelven en la parte indicada y se registran aquí como decisión cuando se tomen.

| Punto | Propuesta | Parte |
|-------|-----------|-------|
| Código de éxito del login (`200` o `201`). | `200`: el login no crea un recurso. | 4 |
| ¿El email distingue mayúsculas? (`Ana@x.com` frente a `ana@x.com`). | Normalizar a minúsculas antes de guardar y de comparar, para evitar los correos duplicados que describe el caso. | 4 |
| Valor inicial de `frecuencia` y si es obligatoria al crear. | `estado` inicia en `ACTIVO`. Para `frecuencia`, decidir entre obligatoria o valor inicial `DIARIA`. | 3 y 5 |
| Tipo de id y respuesta ante un id con formato inválido (por ejemplo `/habitos/abc`). | Si el id es numérico o UUID, un formato inválido responde `400`, no `404`. | 3 y 5 |
| `PATCH` con body vacío. | Responder `400` o devolver el hábito sin cambios. | 5 |
