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



# Configurando o Prometheus

1. Instalar helm localmente
sudo snap install helm --classic

2. Adicionar o repositório do Prometheus

helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

helm repo update

3. Instalar kube-prometheus-stack

kubectl create namespace monitoring

helm install prometheus-stack prometheus-community/kube-prometheus-stack -n monitoring

4. verificar a instalação e se está rodando 1 exporter para cada pod:
kubectl get pods -n monitoring

5. Abrir localhost prometheus num terminal separado:

kubectl port-forward -n monitoring svc/prometheus-stack-kube-prom-prometheus 9090:9090

acesse http://localhost:9090


# Alterações para melhorar a observabilidade

Para fazer os testes de carga e isolar os serviços afim de permitir uma análise separada de cada serviço, optamos por utilizar o grpcurl, afim de habilitar a chamada de requisições diretas aos microserviços A e B sem passar por P:


## exemplo para estresse e verificar no Prometheus: Testando serviço A

1. fazer post-forward em um terminal
kubectl port-forward svc/grpc-a -n pspd-grpc 50051:50051

2. Em outro terminal execute o seguinte comando para fazer 500 requisições ao serviço A
for i in {1..50}; do
    grpcurl -plaintext \
      -proto grpc/proto/service.proto \
      -d '{"text":"aaaaaaaaaaaaaaaaaaaa"}' \
      localhost:50051 \
      textanalyzer.WordCounterService.CountWords > /dev/null
done

3. Na query do Prometheus você pode verificar os usos de CPU e Memória executando as querys e clicando em Graph:

CPU:
rate(container_cpu_usage_seconds_total{pod=~"grpc-a.*"}[1m])

![Utilizando o exemplo anterior - CPU](assets\cpuUsageOnlyA.png)

Memória:
container_memory_usage_bytes{pod=~"grpc-a.*"}

![Utilizando o exemplo anterior - Memória](assets\memUsageOnlyA.png)
