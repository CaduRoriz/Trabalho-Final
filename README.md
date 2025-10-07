
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

//docker-compose rest (cd rest): 
 docker compose up -d --build


para subir kubernetes, na raiz do trabalhoPSPD:

 (cd trabalhoPSPD)

minikube start
eval $(minikube -p minikube docker-env)

 # GRPC
docker build -t pspd/grpc-a:latest -f grpc/A-py/Dockerfile ./grpc
docker build -t pspd/grpc-b:latest -f grpc/B-py/Dockerfile ./grpc
docker build -t pspd/grpc-p:latest -f grpc/P-nodejs/Dockerfile ./grpc

# REST
docker build -t pspd/rest-a:latest ./rest/A-py-rest   # ou ./rest/A-cpp-rest
docker build -t pspd/rest-b:latest ./rest/B-py-rest
docker build -t pspd/rest-p:latest ./rest/P-nodejs-rest

//Aplicando scripts no cluester
# gRPC
kubectl apply -f grpc/k8s/namespace.yaml
kubectl apply -f grpc/k8s/a-deploy.yaml -f grpc/k8s/a-svc.yaml
kubectl apply -f grpc/k8s/b-deploy.yaml -f grpc/k8s/b-svc.yaml
kubectl apply -f grpc/k8s/p-deploy.yaml -f grpc/k8s/p-svc.yaml

kubectl -n pspd-grpc get pods,svc

# REST
kubectl apply -f rest/k8s/namespace.yaml
kubectl apply -f rest/k8s/a-deploy.yaml -f rest/k8s/a-svc.yaml
kubectl apply -f rest/k8s/b-deploy.yaml -f rest/k8s/b-svc.yaml
kubectl apply -f rest/k8s/p-deploy.yaml -f rest/k8s/p-svc.yaml

kubectl -n pspd-rest get pods,svc

//P DESCOBRIR URL DO P:
minikube service -n pspd-grpc grpc-p --url
minikube service -n pspd-rest rest-p --url


Verificar se os serviços estão no ar:
kubectl get pods -n pspd-grpc

P/ ver url para fazer requsições:
kubectl get svc -n pspd-grpc // com esse comando conseguimos ver a NodePort 

p/ ver ip externo minikube: 
minikube ip

A URL de acesso será 
http://<IP do HServ (dado no comando anterior)>:<NodePort>
exemplo: http://192.168.49.2:31001


OU

minikube service grpc-p -n pspd-grpc




//// p/ testar a versão REST:
minikube service rest-p -n pspd-rest


