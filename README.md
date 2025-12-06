# Relatório da Atividade Extraclasse — Aplicação Distribuída com gRPC e Kubernetes

### Curso: Engenharia de Software – Universidade de Brasília (UnB/FGA)  
### Disciplina: Programação para Sistemas Paralelos e Distribuídos (PSPD)  
### Professor: Fernando W. Cruz  
### Semestre: 2025/2  
### Participantes: 

|          Aluno               |  Matrícula  | 
|------------------------------|-------------|
|   Luana Souza Silva Torres   |  190033011  |
| Carlos Eduardo Miranda Roriz |  190011424  |


Link do Repositório: [link no github](https://github.com/CaduRoriz/Trabalho-Final)

Link do vídeo de apresentação: [vídeo](adicionar)


## 1. Introdução

Este trabalho teve como objetivo aplicar, na prática, os conceitos de Programação para Sistemas Paralelos e Distribuídos, utilizando o framework gRPC e o orquestrador de contêineres Kubernetes (Minikube).  

O objetivo está em implantar, monitorar e comparar uma aplicação distribuída construída com **gRPC**, executada em um ambiente **Kubernetes em modo cluster** com múltiplos nós.

Foram realizados:

- **Desenvolvimento dos microserviços** (A, B e P)  
- **Containerização com Docker**  
- **Orquestração com Kubernetes (Minikube multi-node)**  
- **Monitoramento com Prometheus**  
- **Testes de carga com K6** 
- **Avaliação de cenários arquiteturais no cluster**  

A realização deste trabalho permitiu o aprendizado de tecnologias de sistemas distribuídos como o GRPC, compreender suas vantagens em termos de desempenho e eficiência na comunicação binária, bem como consolidar conhecimentos sobre orquestração containeres em um ambiente Kubernetes muli nó, isto é, em Cluster, assim como a utilização prática de tecnologias como o Prometheus.

## 2. Aplicação Distribuída

A aplicação foi composta por três serviços em gRPC. Os módulos estão demonstrados a seguir:

| Módulo  |	Linguagem  | Função |
|---------|------------|--------|
| A	| Python (gRPC/REST) | Contar o número de palavras em um texto recebido. |
| B	| Python (gRPC/REST)  |	Contar o número de vogais no texto. |
| P	| Node.js | API Gateway, receber requisições HTTP externas e repassar para A e B via gRPC. |

### 2.1 Funcionamento do Sistema

O usuário envia uma requisição HTTP (via Postman) para o serviço P (rota /analyze-text);

O gateway P repassa o texto para os microserviços A e B;

O microserviço A retorna o número de palavras e o B retorna o número de vogais;

O P agrega os resultados e devolve uma resposta consolidada ao cliente.

Também foi considerado o caso da chamada dos microserviços A e B diretamente através do uso do grpcurl e do post-forward para permitir abrir uma porta para ambos os serviços.

## 3. Kubernetes

O cluster utilizado foi criado com Minikube multinode, contendo:


|  Nó  |   Função    | 
|-----------|------------|
| minikube | Control-plane | 
| minikube-m02 | Worker Node |	
| minikube-m03 |  Worker Node | 

O passo a passo para rodar o kubernetes nessa configuração será descrita na seção a seguir com o passo a passo de como rodar o projeto por completo. A distribuição dos microserviços foi diferente em cada cenário como descrito nas seções porteriores.

# Clusterização utilizando o minikube driver docker cluster kubernetes multi-nó

1. Instalar kubectl

No Ubuntu (WSL):

```
sudo apt install -y curl
```

Baixar binário estável do kubectl:

```
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
```

Dar permissão e mover pro PATH:

```
chmod +x kubectl
sudo mv kubectl /usr/local/bin/
```

Verificar:

```
kubectl version --client
```

2. Instalar Minikube no WSL

No Ubuntu:

```
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

Testar:

```
minikube version
```

3. Criar o cluster multi-nó

Minikube por padrão cria 1 nó. Para criar 3 no cenário padrão:

```
minikube start --driver=docker --nodes=3
```

p/ verificar:

```
kubectl get nodes
```

4. Subir a aplicação no cluster

```
entrar no context:
kubectl config current-context
```

5. Buildar imagens docker localmente na raiz do projeto

```
docker build -t grpc-a:latest -f grpc/A-py/Dockerfile ./grpc
docker build -t grpc-b:latest -f grpc/B-py/Dockerfile ./grpc
docker build -t grpc-p:latest -f grpc/P-nodejs/Dockerfile ./grpc
```

6. Enviar pro cluster multi-nó:
```
minikube image load grpc-a:latest
minikube image load grpc-b:latest
minikube image load grpc-p:latest
```

7. Ajuste dos arquivos yalm na pasta k8s já configurados

8. Aplicar os arquivos:

P/ aplicar tudo:

```
kubectl apply -f grpc/k8s/namespace.yaml
kubectl apply -f grpc/k8s/
```

9. verificar os pods:
```
kubectl get pods -n pspd-grpc -o wide
```

10. Restart do deployment (apenas se necessário para mudar pods)

```
kubectl rollout restart deployment grpc-a -n pspd-grpc
kubectl rollout restart deployment grpc-b -n pspd-grpc
kubectl rollout restart deployment grpc-p -n pspd-grpc
```

# comunicação - para testar 
para ver as portas:
```
kubectl get svc -n pspd-grpc
```

para encontrar a url para se comunicar com o serviço P (http)

```
minikube service grpc-p -n pspd-grpc --url 
```

deve aparecer algo como:
http://127.0.0.1:34559

Teste no postman com a url fornecida pelo método POST com /analyze-text
ex:
http://127.0.0.1:34585/analyze-text

após finalizar aperte Crtl+C no terminal.



# Configurando o Prometheus

1. Instalar helm localmente
```
sudo snap install helm --classic
```

2. Adicionar o repositório do Prometheus
```
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

helm repo update
```

3. Instalar kube-prometheus-stack

```
kubectl create namespace monitoring

helm install prometheus-stack prometheus-community/kube-prometheus-stack -n monitoring
```

4. verificar a instalação e se está rodando 1 exporter para cada pod:

```
kubectl get pods -n monitoring
```

5. Abrir localhost prometheus num terminal separado:

```
kubectl port-forward -n monitoring svc/prometheus-stack-kube-prom-prometheus 9090:9090
```

acesse http://localhost:9090


# Alterações para melhorar a observabilidade

Para fazer os testes de carga e isolar os serviços afim de permitir uma análise separada de cada serviço, optamos por utilizar o grpcurl, afim de habilitar a chamada de requisições diretas aos microserviços A e B sem passar por P:


## exemplo para estresse e verificar no Prometheus: Testando serviço A

1. fazer post-forward em um terminal
```
kubectl port-forward svc/grpc-a -n pspd-grpc 50051:50051
```
```
kubectl port-forward svc/grpc-b -n pspd-grpc 50052:50052
```

2. Em outro terminal execute o seguinte comando para fazer 500 requisições ao serviço A
```
for i in {1..50}; do
    grpcurl -plaintext \
      -proto grpc/proto/service.proto \
      -d '{"text":"aaaaaaaaaaaaaaaaaaaa"}' \
      localhost:50051 \
      textanalyzer.WordCounterService.CountWords > /dev/null
done
```

3. Na query do Prometheus você pode verificar os usos de CPU e Memória executando as querys e clicando em Graph:

CPU:
rate(container_cpu_usage_seconds_total{pod=~"grpc-a.*"}[1m])

Memória:
container_memory_usage_bytes{pod=~"grpc-a.*"}


## Principais querys Prometheus:

1. ver CPU de todos os pods:

rate(container_cpu_usage_seconds_total{namespace="pspd-grpc"}[1m])

2. CPU por pod:

rate(container_cpu_usage_seconds_total{pod=~"grpc-a.*"}[1m])
rate(container_cpu_usage_seconds_total{pod=~"grpc-b.*"}[1m])
rate(container_cpu_usage_seconds_total{pod=~"grpc-p.*"}[1m])

3. Memória de todos os Pods:

container_memory_usage_bytes{namespace="pspd-grpc"}

4. Memória por pod:

container_memory_usage_bytes{pod=~"grpc-a.*"}

5. CPU total usada em cada node:

sum(rate(container_cpu_usage_seconds_total[1m])) by (node)

6. Memória total por node:

sum(container_memory_usage_bytes) by (node)

7. Ver onde cada pod está rodando (distribuição dos nós):

kube_pod_info{namespace="pspd-grpc"}

(não retorna gráfico, retorna txt com serviço e node)


# Cenários

## Cenário Base - Cenário 1 - Cluster com 3 nós + distribuição automática - AutoScaling Automático

Esse cenário serve como referência.

## Cenário 2 - Todos os serviços no mesmo nó

No arquivos de deploy dos serviços A, B e P, alteramos os yalms para conter a config:

nodeSelector:
  kubernetes.io/hostname: minikube

Esta config assegura que todos os serviços estejam rodando no mesmo nó.

## Cenário 3 - cada serviço em 1 nó diferente

Aqui, configuramos o nodeSelector para que cada arquivo de deployment tivesse um hostname diferente:
A -> minikube
B -> minikube-m02
P -> minikube-m03

## Cenário 4 - Cada serviço em 1 nó diferente porém com 2 réplicas para cada serviço

Neste cenário, quisemos testar se o aumento de pods influencia na eficiência. Colocamos 2 réplicas para cada serviço A, B e P.

## Cenário 5 - cada serviço em 1 nó diferente chamando A e B sem o P

Utilizando esse cenário em que cada serviço esta em 1 nó, fizemos mais 1 teste de carga para que ao invés de chamar o serviços A e B através do P, chamassem diretamente os microserviços A e B.

Aqui consideramos um estresse maior, ao inves de uma carga de 1500, utilizamos 5000.

Entretanto, tivemos limitações para rodar esse cenário uma vez que o k6 ficou com diversos erros para ser executado.


# Dificuldades Encontradas

# Conclusão

### Autoavaliação:

|          Aluno               |  Contribuições  |  Autoavaliação |
|------------------------------|-----------------------------------------|-----|
|   Luana Souza Silva Torres   |  Estruturas grpc, prometheus e estruturação do kubernetes, seguido do acompanhamento dos testes de carga  | 10 |
| Carlos Eduardo Miranda Roriz |  Realização dos testes de carga e acompanhamento da estruturação grpc, prometheus e kubernetes.  | 10 |

### Referências:

Referências
Site oficial do gRPC: https://grpc.io/
Documentação do Kubernetes: https://kubernetes.io/docs/
Documentação do Minikube: https://minikube.sigs.k8s.io/docs/