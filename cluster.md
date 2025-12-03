# Clusterização utilizando o minikube driver docker cluster kubernetes multi-nó

1. Instalar kubectl

No Ubuntu (WSL):

sudo apt install -y curl

Baixar binário estável do kubectl:

curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

Dar permissão e mover pro PATH:

chmod +x kubectl
sudo mv kubectl /usr/local/bin/

Verificar:

kubectl version --client

2. Instalar Minikube no WSL

No Ubuntu:

curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube


Testar:

minikube version

3. Criar o cluster multi-nó

Minikube por padrão cria 1 nó. Para criar 3 no cenário padrão:

minikube start --driver=docker --nodes=3

p/ verificar:

kubectl get nodes

4. Subir a aplicação no cluster

entrar no context:
kubectl config current-context

5. Buildar imagens docker localmente na raiz do projeto

docker build -t grpc-a:latest -f grpc/A-py/Dockerfile ./grpc
docker build -t grpc-b:latest -f grpc/B-py/Dockerfile ./grpc
docker build -t grpc-p:latest -f grpc/P-nodejs/Dockerfile ./grpc

6. Enviar pro cluster multi-nó:
minikube image load grpc-a:latest
minikube image load grpc-b:latest
minikube image load grpc-p:latest

7. Ajuste dos arquivos yalm na pasta k8s já configurados

8. Aplicar os arquivos:

P/ aplicar tudo:
kubectl apply -f grpc/k8s/namespace.yaml
kubectl apply -f grpc/k8s/

9. verificar os pods:
kubectl get pods -n pspd-grpc -o wide


# comunicação - para testar 
para ver as portas:
kubectl get svc -n pspd-grpc

para encontrar a url para se comunicar com o serviço P (http)
minikube service grpc-p -n pspd-grpc --url 

deve aparecer algo como:
http://127.0.0.1:34559

Teste no postman com a url fornecida pelo método POST com /analyze-text
ex:
http://127.0.0.1:34585/analyze-text

após finalizar aperte Crtl+C no terminal.