# Usa uma imagem oficial do Node.js como base
FROM node:20

WORKDIR /app


COPY ./P-nodejs/package*.json ./
COPY ./proto ../proto
COPY ./P-nodejs/ .

RUN npm install

EXPOSE 3000


CMD ["node", "server.js"]
