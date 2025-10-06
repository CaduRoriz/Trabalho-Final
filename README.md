
requirements:

python3 -m pip install grpcio grpcio-tools protobuf
sudo apt-get install -y protobuf-compiler grpc-proto grpc-dev libgrpc++-dev
protoc --version
grpc_cpp_plugin --version
sudo apt-get install build-essential autoconf libtool pkg-config
sudo apt install bazel-bootstrap


npm install -g grpc-tools @grpc/proto-loader
grpc_tools_node_protoc --js_out=import_style=commonjs,binary:./P-nodejs --grpc_out=grpc_js:./P-nodejs -I ./proto ./proto/service.proto


python3
grpcio==1.68.0
grpcio-tools==1.68.0
protobuf==5.27.0

python3 -m venv venv
source venv/bin/activate   # (ou venv\Scripts\activate no Windows)
pip install -r requirements.txt


dificuldades:

rodar o dockerfile c++ grpc pois possui diversas dependencias, precisa de serviços como o Cmake ou bazel que acabam tendo uma certa complexidade para configurar e buildar. Serviço acaba sendo pesado para rodar, tivemos problemas com compatibilidade de bibliotecas o que nos fez optar pelo Cmake apesar de ser mais pesado e demorado para rodar pela primeira vez.


build: docker build -f A-py/Dockerfile -t word-counter-python .

run: docker run -p 50051:50051 word-counter-python