FROM node:18-alpine

WORKDIR /app

# Copia os arquivos de dependência
COPY package*.json ./

RUN npm install

# Copia o código fonte
COPY . .

EXPOSE 4000
CMD ["node", "service.js"]
