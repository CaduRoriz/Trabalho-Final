FROM python:3.11-slim

WORKDIR /app

COPY A-py/requirements.txt .
RUN pip install --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r requirements.txt grpcio-tools

# Copia apenas o código Python e o proto
COPY A-py/ ./A-py
COPY proto/ ./proto

WORKDIR /app/A-py

RUN python -m grpc_tools.protoc -I../proto --python_out=. --grpc_python_out=. ../proto/service.proto

EXPOSE 50052

CMD ["python", "servera.py"]
