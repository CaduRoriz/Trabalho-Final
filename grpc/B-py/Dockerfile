FROM python:3.11-slim

WORKDIR /app

COPY B-py/requirements.txt .
RUN pip install --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r requirements.txt grpcio-tools


COPY B-py/ ./B-py
COPY proto/ ./proto

WORKDIR /app/B-py

RUN python -m grpc_tools.protoc -I../proto --python_out=. --grpc_python_out=. ../proto/service.proto

EXPOSE 50052

CMD ["python", "serverb.py"]
