# ===== Etapa 1: Build =====
FROM debian:bookworm-slim AS builder

# Instala dependências de compilação + ferramentas gRPC
RUN apt-get update && apt-get install -y \
    build-essential cmake git pkg-config \
    protobuf-compiler libprotobuf-dev \
    libgrpc++-dev libprotoc-dev grpc-tools && \
    rm -rf /var/lib/apt/lists/*

# Define diretório de trabalho
WORKDIR /app

# Copia o código-fonte
COPY . .

# Compila o projeto
RUN mkdir -p build && cd build && \
    cmake .. && \
    make -j$(nproc)

# ===== Etapa 2: Runtime =====
FROM debian:bookworm-slim

# Instala somente as libs necessárias para execução
RUN apt-get update && apt-get install -y \
    libprotobuf-dev libgrpc++1 && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia apenas o binário compilado
COPY --from=builder /app/build/servera /app/servera

# Expõe a porta gRPC
EXPOSE 50051

# Comando padrão
CMD ["./servera"]
