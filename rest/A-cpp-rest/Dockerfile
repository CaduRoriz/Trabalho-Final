FROM ubuntu:22.04

# Evita perguntas interativas
ENV DEBIAN_FRONTEND=noninteractive

# Instala o compilador e dependências
RUN apt-get update && apt-get install -y g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia o código-fonte
COPY . .

# Compila o arquivo principal (ajuste o nome se for diferente)
RUN g++ -o servera servera_rest.cpp

# Expõe a porta REST do serviço (por exemplo, 4000)
EXPOSE 6001

# Executa o servidor
CMD ["./servera"]
