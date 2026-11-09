# ==============================================================================
# Dockerfile Oficial para Backend (API REST y Background Worker)
# Backend API REST y Background Worker
# Base: Deno 2.9.7 Alpine
# ==============================================================================

FROM denoland/deno:2.9.7

# Directorio de trabajo
WORKDIR /app

# Copiar manifiesto de dependencias, lockfile y configuraciones
COPY deno.json deno.lock* drizzle.config.ts ./

# Copiar el codigo fuente completo
COPY src/ ./src/
COPY scripts/ ./scripts/

# Pre-compilar y verificar tipos en el build para garantizar cero errores
RUN deno check src/**/*.ts scripts/**/*.ts

# Puerto expuesto por el servidor HTTP
EXPOSE 8000

# Comando por defecto (Servidor HTTP con Hono)
CMD ["deno", "run", "--allow-net", "--allow-env", "--allow-read", "--allow-write", "src/interfaz/http/main.ts"]
