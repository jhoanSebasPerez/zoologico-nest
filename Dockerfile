# 1. Usar una imagen oficial de Node.js como base
FROM node:18-alpine AS builder

# 2. Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# 3. Copiar los archivos package.json y package-lock.json (si existe) al contenedor
COPY package*.json ./

# 4. Instalar las dependencias del proyecto
RUN npm install

# 5. Copiar todo el código fuente al contenedor
COPY . .

# 6. Compilar el proyecto (transpilar TypeScript a JavaScript)
RUN npm run build

# ====================
# 7. Crear una imagen ligera para producción
FROM node:18-alpine AS production

# 8. Establecer el directorio de trabajo para la imagen de producción
WORKDIR /app

# 9. Copiar solo los archivos necesarios desde la imagen builder
COPY package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# 10. Exponer el puerto en el que la app escuchará
EXPOSE 3000

# 11. Comando para iniciar la aplicación
CMD ["node", "dist/main"]