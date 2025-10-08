# Relatório da Atividade Extraclasse — Aplicação Distribuída com gRPC e Kubernetes

### Curso: Engenharia de Software – Universidade de Brasília (UnB/FGA)  
### Disciplina: Programação para Sistemas Paralelos e Distribuídos (PSPD)  
### Professor: Fernando W. Cruz  
### Semestre: 2025/2  
### Participantes: 
- Luana Souza Silva Torres - 1900330110
- [Nome dos demais integrantes]


|          Aluno               |  Matrícula  | 
|------------------------------|-------------|
|   Luana Souza Silva Torres   |  190033011  |
| Carlos Eduardo Miranda Roriz |  190011424  |


## 1. Introdução

Este trabalho teve como objetivo aplicar, na prática, os conceitos de Programação para Sistemas Paralelos e Distribuídos, utilizando o framework gRPC e o orquestrador de contêineres Kubernetes (Minikube).  

O experimento consistiu em projetar, implementar e comparar duas versões de uma mesma aplicação distribuída:  
1. Uma versão baseada em **gRPC (HTTP/2 + Protobuf)**;  
2. Uma versão alternativa baseada em **REST (HTTP + JSON)**.  

Ambas as versões foram compostas por três microserviços distintos — **P, A e B** — que colaboram entre si por meio de diferentes protocolos.  
O módulo **P** funciona como uma **API Gateway** escrita em nodejs, enquanto os módulos **A** e **B** são dois microserviços distintos de processamento textual escritos em python.

A realização deste trabalho permitiu o aprendizado de tecnologias de sistemas distribuídos como o GRPC, compreender suas vantagens em termos de desempenho e eficiência na comunicação binária, bem como consolidar conhecimentos sobre orquestração containeres em um ambiente Kubernetes, assim como a utilização prática de tecnologias como o docker e minikube.


## 2. O Framework gRPC

O **gRPC (Google Remote Procedure Call)** é um framework de comunicação remota de alto desempenho, baseado em **HTTP/2** e **Protocol Buffers (protobuf)**.  
Ele permite que aplicações distribuídas troquem dados estruturados de maneira eficiente, segura e fortemente tipada.

### 2.1 Componentes principais

- **Protocol Buffers (Protobuf):**  
  Linguagem de definição de interface (IDL) utilizada para descrever os serviços, métodos e estruturas de dados transmitidas entre cliente e servidor.  
  Diferente do JSON, o Protobuf é binário, o que reduz significativamente o tamanho das mensagens e melhora a performance.

- **HTTP/2:**  
  Protocolo de transporte usado pelo gRPC. Ele oferece multiplexação de streams, compressão de cabeçalhos e comunicação bidirecional sobre uma única conexão TCP, tornando-o mais rápido e eficiente que o HTTP/1.1 (utilizado tradicionalmente).

---

### 2.2 Tipos de Comunicação no gRPC

| Tipo de Chamada | Descrição | Exemplo de Uso |
|------------------|------------|----------------|
| **Unary Call** | O cliente envia uma única requisição e recebe uma única resposta. | Consultas simples de dados (ex: contagem de palavras). |
| **Server Streaming** | O cliente envia uma requisição e recebe uma sequência de respostas. | Envio de resultados parciais (ex: stream de logs ou métricas). |
| **Client Streaming** | O cliente envia múltiplas requisições e recebe uma única resposta consolidada. | Upload de blocos de dados (ex: upload de arquivo em partes). |
| **Bidirectional Streaming** | Cliente e servidor enviam fluxos contínuos de mensagens simultaneamente. | Comunicação em tempo real (ex: chat, IoT, streaming). |

---

## 3. Aplicação Distribuída

A aplicação foi composta por três módulos principais em cada uma das 2 pastas, sendo uma para a versão gRPC e outra para REST. Os módulos estão demonstrados a seguir:

| Módulo  |	Linguagem  | Função |
|---------|------------|--------|
| A	| Python (gRPC/REST) | Contar o número de palavras em um texto recebido. |
| B	| Python (gRPC/REST)  |	Contar o número de vogais no texto. |
| P	| Node.js | API Gateway, receber requisições HTTP externas e repassar para A e B via gRPC (ou REST, na versão alternativa). |

### 3.1 Funcionamento do Sistema

O usuário envia uma requisição HTTP (via Postman) para o serviço P (rota /analyze-text);

O gateway P repassa o texto para os microserviços A e B;

O microserviço A retorna o número de palavras e o B retorna o número de vogais;

O P agrega os resultados e devolve uma resposta consolidada ao cliente.

## 4. Kubernetes

A aplicação foi implantada em um ambiente Kubernetes localmente através do Minikube.

Cada microserviço foi empacotado como um contêiner Docker e distribuído como Deployment e Service, conforme a arquitetura a seguir:


|  Serviço  |   Porta    | 
|-----------|------------|
| grpc-a | 50051 | 
| grpc-b | 50052 |	
| grpc-p |  3000 | 
| rest-a |  6001 | 
| rest-b |  6002 | 
| rest-p |  4000 | 

O passo a passo para rodar o kubernetes nessa configuração será descrita na seção a seguir com o passo a passo de como rodar o projeto por completo.

## 6. Rodando a Aplicação

### 6.1. Requisitos e Pré-compilação
*Dependencias (Geral)*
- Para compilar os stubs gRPC e as dependências em Linux Ubuntu:

```
# Python
python3 -m pip install grpcio grpcio-tools protobuf
sudo apt-get install -y protobuf-compiler grpc-proto grpc-dev libgrpc++-dev
protoc --version
grpc_cpp_plugin --version
sudo apt-get install build-essential autoconf libtool pkg-config
sudo apt install bazel-bootstrap
```

```
Node.js
npm install -g grpc-tools @grpc/proto-loader
```

### 6.2 Geração dos Stubs (gRPC):

```
# Python para A e B
python3 -m grpc_tools.protoc -I=./proto --python_out=./A-py --grpc_python_out=./A-py ./proto/service.proto

# Node para P
npm install -g grpc-tools @grpc/proto-loader
grpc_tools_node_protoc --js_out=import_style=commonjs,binary:./P-nodejs --grpc_out=grpc_js:./P-nodejs -I ./proto ./proto/service.proto

```

Configuração do Ambiente Python:


 Versões utilizadas:
- python3
- grpcio==1.68.0
- grpcio-tools==1.68.0
- protobuf==5.27.0


```
python3 -m venv venv
source venv/bin/activate    # (ou venv\Scripts\activate no Windows)
pip install -r requirements.txt
```

### 6.3 Dockerfiles:

**GRPC:**

build: 
```docker build -f A-py/Dockerfile -t word-counter-python .```

run: 
```docker run -p 50051:50051 word-counter-python. ```

**REST:**

```
cd rest 
docker compose up -d --build
```

### 6.4 Kuberntes:
Assumindo que você está na raiz do projeto (trabalhoPSPD):

- Inicializar Minikube e Configurar Ambiente Docker:

```
minikube start
eval $(minikube -p minikube docker-env)
```

- Build das Imagens Docker (gRPC e REST):

```
# GRPC
docker build -t pspd/grpc-a:latest -f grpc/A-py/Dockerfile ./grpc
docker build -t pspd/grpc-b:latest -f grpc/B-py/Dockerfile ./grpc
docker build -t pspd/grpc-p:latest -f grpc/P-nodejs/Dockerfile ./grpc

# REST
docker build -t pspd/rest-a:latest ./rest/A-py-rest 
docker build -t pspd/rest-b:latest ./rest/B-py-rest
docker build -t pspd/rest-p:latest ./rest/P-nodejs-rest
```

- Aplicar Arquivos YAML no Cluster:

```
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
```

- Acessar o API Gateway (Serviço P):

```
# gRPC
minikube service grpc-p -n pspd-grpc

# REST
minikube service rest-p -n pspd-rest
```

A partir deste momento é possível fazer requisições via postman pela url fornecida no passo anterior com /analyze-text e um texto no body JSON.


## 6. Conclusão

A experiência proporcionou uma compreensão prática dos conceitos de computação distribuída, comunicação entre microserviços e orquestração com Kubernetes.

Foi possível observar que o gRPC é significativamente mais eficiente do que o modelo REST tradicional em performance.

Além disso, o uso do Minikube demonstrou como ambientes containerizados podem simular infraestruturas de nuvem de forma simples, eficaz e didática. Este trabalho nos ajudou a compreender mais sobre computação distribuída e diversas tecnologias atuais na prática.


### Autoavaliação:

|          Aluno               |  Contribuições  |  Autoavaliação |
|------------------------------|-----------------------------------------|-----|
|   Luana Souza Silva Torres   |  Estruturas grpc e rest dos 3 módulos, dockerfiles, docker-compose e kuberntes.  | 10 |
| Carlos Eduardo Miranda Roriz |  Estruturas grpc e rest dos 3 módulos, dockerfiles, docker-compose e testes de desempenho.  | 10 |

### Referências:

Referências
Site oficial do gRPC: https://grpc.io/
Documentação do Kubernetes: https://kubernetes.io/docs/
Documentação do Minikube: https://minikube.sigs.k8s.io/docs/