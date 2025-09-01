# Usa Node.js LTS
FROM node:20-alpine

# Crear directorio de la app
WORKDIR /usr/src/app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install --production

# Copiar todo el código
COPY . .

# Exponer el puerto que Cloud Run espera
ENV PORT 8080
EXPOSE 8080

# Comando para correr tu servidor
CMD ["npm", "start"]