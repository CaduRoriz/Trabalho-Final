
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
