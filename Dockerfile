# ---------- Etapa base: común a las demás ----------

# Node 24 (misma versión mayor que en local) sobre Debian slim (glibc), donde
# funcionan los binarios precompilados de bcrypt y el motor de Prisma.
FROM node:24-slim AS base

# Prisma detecta la versión de OpenSSL para elegir su motor; slim no trae el
# binario openssl. Se instala una vez aquí para que todas las etapas lo hereden.
RUN apt-get update -y \
 && apt-get install -y --no-install-recommends openssl \
 && rm -rf /var/lib/apt/lists/*

# Directorio de trabajo de todas las etapas.
WORKDIR /app


# ---------- Etapa build: compila la aplicación ----------

# Parte de la base para compilar con todas las dependencias (incluidas las de desarrollo).
FROM base AS build

# Primero solo los manifiestos: si no cambian, Docker reutiliza la capa de npm ci.
COPY package.json package-lock.json ./

# Instalación reproducible exactamente según package-lock.json.
RUN npm ci

# Después el código fuente (el .dockerignore excluye .env, node_modules, dist, etc.).
COPY . .

# prebuild ejecuta prisma generate (cliente en src/generated) y luego nest build compila a dist/.
RUN npm run build


# ---------- Etapa prod-deps: solo dependencias de producción ----------

# Etapa aparte para que la imagen final no lleve TypeScript, Jest, ESLint, etc.
FROM base AS prod-deps

# Los mismos manifiestos, para instalar las mismas versiones que en build.
COPY package.json package-lock.json ./

# Sin devDependencies. Incluye el CLI de Prisma (está en dependencies porque
# migrate deploy corre al arrancar) y su motor de migraciones para Linux.
RUN npm ci --omit=dev


# ---------- Etapa final: imagen que se ejecuta ----------

# Parte otra vez de la base limpia: solo se copia lo necesario para ejecutar.
FROM base AS final

# Modo producción para Node y las librerías que lo consultan.
ENV NODE_ENV=production

# Dependencias de producción ya instaladas en prod-deps.
COPY --from=prod-deps /app/node_modules ./node_modules

# Configuración que lee el CLI de Prisma: prisma.config.ts y el schema con sus migraciones.
COPY package.json prisma.config.ts ./
COPY prisma ./prisma

# Código compilado (incluye dist/generated/prisma) desde la etapa build.
COPY --from=build /app/dist ./dist

# Se ejecuta sin privilegios de root, con el usuario node que trae la imagen oficial.
USER node

# Documenta el puerto por defecto; la app escucha en el PORT del entorno.
EXPOSE 3000

# Al arrancar: aplica las migraciones pendientes y luego inicia la API.
# exec deja a node como PID 1 para que reciba SIGTERM y cierre la conexión a la base.
CMD ["sh", "-c", "npx --no-install prisma migrate deploy && exec node dist/main.js"]
