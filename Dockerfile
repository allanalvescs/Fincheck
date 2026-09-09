FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Gera o Prisma Client (não há postinstall no projeto)
RUN npx prisma generate

# Compila o projeto Nest (dist/main.js)
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
