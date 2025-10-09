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


Link do Repositório: [link no github](https://github.com/luanatorress/trabalhoPSPD)

Link do vídeo de apresentação: [vídeo](https://youtu.be/YQeDbYyEQco)


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

Se for preciso atualizar algum pod:
```
kubectl rollout restart deployment grpc-p -n pspd-grpc
```

### 6.5 Testes de performance:

Para compararmos as performances dos microserviços em REST e GRPC, foi realizado por este trabalho testes utulizando a ferramenta K6, uma biblioteca do node.js para testes nos serviços.

- Primeiramente atualize o seu sistema e baixe a ferramenta k6:

``` 
  sudo apt update && sudo apt install -y gnupg software-properties-common && \
curl -s https://dl.k6.io/key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/k6-archive-keyring.gpg && \

  echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | \

  sudo tee /etc/apt/sources.list.d/k6.list > /dev/null && \

  sudo apt update && sudo apt install -y k6
 ```

 - No arquivo /trabalhopspd/rest/load-test.js configure os atributos da função de forma que for coveniente para o seu teste:


```
export let options = {
  scenarios: {
    carga_fixa: {
      executor: "constant-arrival-rate",
      rate: X,             // requisições por segundo
      timeUnit: "xs",           // unidade de tempo
      duration: "xs",     // duração total do teste em segundos
      preAllocatedVUs: x,  // Número de VUs reservados
      maxVUs: x          // Número limite máximo de VUs
    },
  },
};
```

- Após o serviço P-Gateway rest estiver em execução, no caminho: /projetos/trabalhoPSPD/rest siga com o comando: 

```
k6 run load-test.js --summary-export nome-do-seu-arquivo-de-relatorio-.json
```

## 7. Resultado e comparação das performances REST x GRPC com os testes K6

Para avaliar a performance dos microserviços desenvolvidos em REST e gRPC, foram realizados testes de carga utilizando a ferramenta K6, em conjunto com os dados de monitoramento extraídos via Docker Stats. O objetivo foi observar o comportamento dos serviços sob diferentes níveis de estresse, medindo métricas críticas de desempenho e estabilidade.

Foram executados três testes distintos, variando a taxa de requisições por segundo:

- Teste 1: 1000 requisições/segundo

- Teste 2: 3000 requisições/segundo

- Teste 3: 5000 requisições/segundo

Essa variação permitiu simular diferentes cenários de carga e identificar possíveis gargalos ou limitações dos serviços.

A partir dos dados coletados, foi possível analisar:

- Tempo de resposta das requisições (latência total)

- Taxa de sucesso das respostas (validação de status HTTP)

- Tempo para estabelecer conexão (incluindo handshake TLS e conexão TCP)

- Duração das iterações (tempo total de execução por VU)

- Volume de dados enviados e recebidos

- Comportamento dos VUs (usuários virtuais) e taxa de iterações descartadas

- Consumo de recursos do container (CPU, memória, rede e I/O via Docker Stats)

Essas métricas fornecem uma visão abrangente sobre a eficiência, escalabilidade e resiliência dos microserviços em diferentes contextos de uso.


## Carga de aquecimento, teste 1/3: 

Configs do arquivo de testes para primeira carga: 

```
export let options = {
  scenarios: {
    carga_fixa: {
      executor: "constant-arrival-rate",
      rate: 1000,               //  1000 requisições por unidade de tempo
      timeUnit: "1s",           // unidade de tempo
      duration: "300s",         // duração total do teste em segundos
      preAllocatedVUs: 1000,    // VUs reservados
      maxVUs: 2000             // limite máximo de VUs
    },
  },
};
```

### Tabela 01 - Comparativo Desempenho, teste de aquecimento:

| **Métrica**                           | **REST**  | **gRPC**      |
| ------------------------------------- | --------- | ------------- |
| Duração média da requisição (ms)      | 33.956 ms | **3.569 ms**  |
| Mediana da duração da requisição (ms) | 28.191 ms | **1.241 ms**  |
| Percentil 95 da duração (ms)          | 60.010 ms | **16.024 ms** |
| Iterações totais executadas           | 91.984    | **162.364**   |
| Iterações descartadas                 | 1.407.809 | **137.638**   |
| Taxa de sucesso (%)                   | 73,02%    | **98,77%**    |
| Taxa de falhas (%)                    | 26,98%    | **1,23%**     |


### Tabela 02 - Comparativo de Consumo e Transferência 

| **Métrica**                             | **REST**   | **gRPC**       |
| --------------------------------------- | ---------- | -------------- |
| Dados recebidos (total em bytes)        | 21.493.953 | **51.108.296** |
| Dados enviados (total em bytes)         | 17.700.480 | **31.173.888** |
| Média de conexão bloqueada (ms)         | 1,31       | **0,01**       |
| Média de tempo de espera (waiting) (ms) | 33.958,23  | **3.569,71**   |


### Conclusões

#### Desempenho de Requisições

Os testes evidenciam uma diferença significativa de latência entre as abordagens. Enquanto o REST apresentou um tempo médio de requisição superior a 33 ms, o gRPC manteve uma média de apenas 3,5 ms, ou seja, quase 10 vezes mais rápido. Essa vantagem também se reflete nos percentis (p95), com o gRPC sendo substancialmente mais consistente em tempos de resposta.

#### Estabilidade e Sucesso das Requisições

REST apresentou uma alta taxa de falhas (26,98%), com apenas cerca de 73% das requisições bem-sucedidas. Já o gRPC se mostrou muito mais estável, com uma taxa de sucesso acima de 98%, mesmo sob a mesma carga de 1000 requisições por segundo.

#### Eficiência de Rede

Apesar de transferir mais dados (enviados e recebidos), o gRPC conseguiu manter a latência muito inferior, o que demonstra uma maior eficiência no uso do protocolo. Isso é característico do gRPC, que utiliza o Protobuf como formato de serialização binária compacta, reduzindo overhead de rede.

#### Uso de Recursos

### Tabela 03 - Comparativo de Consumo de Recursos 

| **Container**  | **Tipo** | **CPU (%)** | **Memória (MiB)** | **NET I/O (MB)** | **BLOCK I/O (MB)** |
| -------------- | -------- | ----------- | ----------------- | ---------------- | ------------------ |
| pnode-gateway  | REST     | 105.42%     | 253               | 877 / 307        | 442 / 0            |
| b-service      | REST     | 64.59%      | 111.9             | 301 / 128        | 201 / 368          |
| a-service      | REST     | 53.60%      | 111.6             | 294 / 128        | 709 / 86           |
| p-gateway      | gRPC     | **141.09%** | 278.1             | 736 / 772        | 2.84 / 0           |
| microservice-a | gRPC     | **32.84%**  | 45.5              | 65.4 / 51.5      | 1.25 / 0           |
| microservice-b | gRPC     | **31.23%**  | 32.2              | 46.6 / 41.9      | 1.37 / 0           |

#### Uso de CPU

O gateway gRPC (p-gateway) consumiu mais CPU (141%) que o gateway REST (105%), o que é esperado, pois gRPC realiza mais trabalho no handshake e serialização binária.

Porém, os microserviços gRPC (microservice-a e microservice-b) usaram menos da metade do CPU comparado aos REST (a-service, b-service), demonstrando melhor eficiência no backend.

#### Uso de Memória

O consumo de memória do gRPC foi significativamente menor nos serviços internos:

microservice-a: 45.5 MiB

microservice-b: 32.2 MiB

Já os equivalentes REST (a-service e b-service) consumiram mais que o dobro da memória.

#### Rede e I/O

O REST teve maior tráfego de rede no gateway (pnode-gateway: 877 MB enviados), enquanto o gRPC manteve um tráfego mais equilibrado (736 MB enviados / 772 MB recebidos).

Em BLOCK I/O, os containers gRPC quase não realizaram operações de disco, enquanto os REST (a-service, b-service) tiveram maior atividade de leitura/gravação em disco – possível sinal de gargalos ou mais operações de escrita.


### Tabela 04 - Conslusão final integrada

| **Critério Avaliado**           | **Vantagem** |
| ------------------------------- | ------------ |
| Latência e performance          |  gRPC       |
| Estabilidade                    |  gRPC       |
| Escalabilidade                  |  gRPC       |
| Eficiência de rede              |  gRPC       |
| Consumo de CPU nos serviços     |  gRPC       |
| Consumo de memória              |  gRPC       |
| Simplicidade de uso             |  REST       |
| Integração com sistemas legados |  REST       |


## Carga média, teste 2/3: 

Configs do arquivo de testes para primeira carga: 

```
export let options = {
  scenarios: {
    carga_fixa: {
      executor: "constant-arrival-rate",
      rate: 3000,               //  3000 requisições por unidade de tempo
      timeUnit: "1s",           // unidade de tempo
      duration: "300s",         // duração total do teste em segundos
      preAllocatedVUs: 1000,    // VUs reservados
      maxVUs: 2000             // limite máximo de VUs
    },
  },
};
```
### Tabela 01 - Comparativo Desempenho, teste de carga média: 

| **Métrica**                           | **REST**   | **gRPC**      |
| ------------------------------------- | ---------- | ------------- |
| Duração média da requisição (ms)      | 6.206 ms   | **4.148 ms**  |
| Mediana da duração da requisição (ms) | 4.926 ms   | **819 ms**    |
| Percentil 95 da duração (ms)          | 21.045 ms  | **26.641 ms** |
| Iterações totais executadas           | 112.990    | **198.752**   |
| Iterações descartadas                 | 787.010    | **701.247**   |
| Taxa de sucesso (%)                   | **99,67%** | 96,25%        |
| Taxa de falhas (%)                    | 0,33%      | **3,75%**     |

### Tabela 02 - Comparativo  de Consumo e transferência:

| **Métrica**                             | **REST**   | **gRPC**       |
| --------------------------------------- | ---------- | -------------- |
| Dados recebidos (total em bytes)        | 35.369.417 | **60.069.142** |
| Dados enviados (total em bytes)         | 21.694.080 | **38.160.384** |
| Média de conexão bloqueada (ms)         | 0,0216     | **0,2961**     |
| Média de tempo de espera (waiting) (ms) | 6.205,07   | **4.147,99**   |


#### Desempenho de Requisições

Mesmo com o aumento da carga, o gRPC manteve tempos de resposta inferiores ao REST. A mediana da duração caiu para menos de 1 segundo (819 ms), enquanto o REST permaneceu na casa dos 4,9 ms. Apesar de o percentil 95 (p95) ter subido no gRPC, isso indica maior variabilidade sob maior estresse, mas ainda com desempenho consistente e aceitável.

#### Estabilidade e Sucesso das Requisições

Diferente do teste de carga baixa, o REST obteve uma taxa de sucesso superior a 99%, enquanto o gRPC caiu para 96,25%, mostrando sinais de impacto sob maior carga. Ainda assim, o gRPC executou mais iterações totais com menor taxa de descarte proporcional.

#### Eficiência de Rede

O gRPC continuou transferindo significativamente mais dados, o que está alinhado com sua alta taxa de requisições bem-sucedidas e maior volume de interações. Mesmo com esse volume, manteve menor latência média que o REST.


### Tabela 03 - Comparativo  de Consumo de Recursos

| **Container**  | **Tipo** | **CPU (%)** | **Memória (MiB)** | **NET I/O (MB)**      | **BLOCK I/O (MB)** |
| -------------- | -------- | ----------- | ----------------- | --------------------- | ------------------ |
| pnode-gateway  | REST     | 107.82%     | 214               | 1.32 GB / 731 MB      | 446 / 0            |
| b-service      | REST     | 102.21%     | 113.9             | 662 MB / 252 MB       | 201 / 86           |
| a-service      | REST     | 97.82%      | 114.1             | 651 MB / 252 MB       | 709 / 86           |
| p-gateway      | gRPC     | **312.19%** | 901.7             | 1.11 GB / **1.66 GB** | 2.84 / 0           |
| microservice-a | gRPC     | **36.05%**  | 64.4              | 339 MB / 133 MB       | 1.35 / 0           |
| microservice-b | gRPC     | **15.55%**  | 58.2              | 118 MB / 122 MB       | 1.37 / 0           |


#### Uso de CPU

O gateway gRPC consumiu mais que o triplo da CPU (312%) em comparação ao REST (107%), refletindo o maior volume de dados processados e serialização binária mais intensiva. Porém, os microserviços gRPC ainda mostram desempenho eficiente, com consumo bem inferior ao dos equivalentes REST.

#### Uso de Memória

O container p-gateway (gRPC) teve um aumento significativo de memória (901 MiB), o que pode indicar gargalo ou necessidade de ajustes de configuração em cenários de alta carga. Por outro lado, os serviços internos gRPC continuam leves em comparação aos REST.

#### Rede e I/O

O tráfego de rede foi intenso em ambos os cenários, mas o gRPC se destaca pelo alto volume de dados recebidos (1.66 GB no gateway), demonstrando robustez na transferência. Em relação ao disco, os containers REST continuam com atividade de BLOCK I/O mais significativa, o que pode representar operações custosas de escrita/leitura.

### Tabela 04 - Conclusão Final Integrada

| **Critério Avaliado**              | **Vantagem (Carga Média)** |
| ---------------------------------- | -------------------------- |
| Latência e performance             | gRPC                       |
| Estabilidade (baixa falha)         | REST                       |
| Escalabilidade (volume processado) | gRPC                       |
| Eficiência de rede                 | gRPC                       |
| Consumo de CPU nos serviços        | gRPC                       |
| Consumo de memória (serviços)      | gRPC                       |
| Simplicidade de uso                | REST                       |
| Integração com sistemas legados    | REST                       |


## Carga de estresse, teste 3/3: 

Configs do arquivo de testes para primeira carga: 

export let options = {
  scenarios: {
    carga_fixa: {
      executor: "constant-arrival-rate",
      rate: 5000,             // 1000 requisições por segundo
      timeUnit: "1s",           // unidade de tempo
      duration: "300s",     // duração total do teste
      preAllocatedVUs: 1000,  // VUs reservados
      maxVUs: 5000          // limite máximo de VUs
    },
  },
};

### Table 01 - Comparativo de Desemepenho 

| **Métrica**                           | **REST**   | **gRPC**       |
| ------------------------------------- | ---------- | -------------- |
| Duração média da requisição (ms)      | 7.001 ms   | **5.570 ms**   |
| Mediana da duração da requisição (ms) | 5.468 ms   | **699 ms**     |
| Percentil 95 da duração (ms)          | 19.642 ms  | **5.999 ms***¹ |
| Iterações totais executadas           | 204.365    | **331.487**    |
| Iterações descartadas                 | 1.295.635  | **1.168.497**  |
| Taxa de sucesso (%)                   | **98,06%** | 93,15%         |
| Taxa de falhas (%)                    | 1,94%      | **6,85%**      |


### Tabela 02 - Comparativo  de Consumo e Transferência 

| **Métrica**                             | **REST**   | **gRPC**       |
| --------------------------------------- | ---------- | -------------- |
| Dados recebidos (total em bytes)        | 62.969.493 | **96.961.316** |
| Dados enviados (total em bytes)         | 39.238.080 | **63.645.504** |
| Média de tempo de espera (waiting) (ms) | 8.000,31   | **5.570,67**   |
| Mediana do tempo de espera (ms)         | 5.490,41   | **699,67**     |

### Tabela 03 - Compartivo de Consumo de Recursos (Carga de Estresse) 

| **Container**  | **Tipo** | **CPU (%)** | **Memória (MiB)** | **NET I/O (MB)** | **BLOCK I/O (MB)** |
| -------------- | -------- | ----------- | ----------------- | ---------------- | ------------------ |
| pnode-gateway  | REST     | 111,68%     | 214               | 260 / 287        | 5,35 / 0           |
| b-service      | REST     | 75,54%      | 89,7              | 336 / 169        | 6,96 / 0           |
| a-service      | REST     | 81,60%      | 107,3             | 334 / 168        | 8,37 / 0           |
| p-gateway      | gRPC     | **189,93%** | **1006**          | 416 / **798**    | 4,16 / 0           |
| microservice-a | gRPC     | 44,80%      | 48,9              | 89,8 / 58,6      | 7,43 / 0           |
| microservice-b | gRPC     | 46,21%      | 50,8              | 48,8 / 57,9      | 10,4 / 0           |

### Análise Final

O gRPC continua liderando em termos de latência, com tempos médios e medianos significativamente menores.

No entanto, o REST foi mais estável com maior taxa de sucesso (98%), enquanto o gRPC teve quase 7% de falhas, sugerindo gargalos ou limitações em paralelo extremo.

O volume total de requisições bem-sucedidas foi maior no gRPC (331k vs 204k), o que mostra melhor throughput apesar da maior taxa de erro.

### Consumo de Recursos

O p-gateway (gRPC) voltou a apresentar altíssimo consumo de CPU (189%) e memória (1006 MiB), exigindo atenção especial a tuning e escalabilidade.

Os microserviços gRPC, no entanto, continuaram leves e eficientes, com consumo significativamente menor que os REST.

O REST teve uso mais distribuído entre seus containers, com uso moderado de CPU e memória.

### Comunicação e Rede

O tráfego de rede no gRPC foi novamente superior ao REST (798 MB recebidos vs 287 MB), o que condiz com maior volume de interações.

Apesar disso, a performance de transferência se manteve estável e rápida.

### Tabela 04 - Conclusão Final Integrada

| **Critério Avaliado**           | **Vantagem (Carga Estresse)** |
| ------------------------------- | ----------------------------- |
| Latência e performance          | gRPC                          |
| Estabilidade (baixa falha)      | REST                          |
| Throughput (requisições totais) | gRPC                          |
| Eficiência de rede              | gRPC                          |
| Consumo de CPU nos serviços     | gRPC                          |
| Consumo de memória (serviços)   | gRPC                          |
| Simplicidade de uso             | REST                          |
| Integração com sistemas legados | REST                          |


#### Considerações finais

- O gRPC demonstrou ser mais performático em todos os níveis de carga, principalmente em termos de latência, eficiência de rede, e uso de CPU/memória nos microserviços.

- Já o REST manteve maior estabilidade nas requisições sob carga extrema, com menor taxa de falha, sendo ainda vantajoso em simplicidade e integração.

- Para ambientes de alta performance e comunicação interna entre serviços, o gRPC é uma escolha superior. Para APIs públicas ou integrações com sistemas heterogêneos, o REST segue sendo uma opção robusta e estável.


### Conclusão da Comparação REST X gRPC

Após a realização dos testes de carga leve, moderada e estresse, ficou claro que o gRPC oferece melhor desempenho em termos de latência, throughput e uso de recursos dos microserviços, sendo ideal para comunicações internas de alto volume.
Por outro lado, o REST demonstrou maior estabilidade sob carga extrema, com menos falhas, sendo mais adequado para APIs públicas e sistemas legados.

Assim, a escolha entre REST e gRPC deve considerar o perfil da aplicação:

- gRPC para eficiência e performance interna

- REST para estabilidade, simplicidade e interoperabilidade

## 9. Dificuldades e considerações finais

Inicialmente planejamos fazer um serviço mais robusto, mas posteriormente percebemos que fazer microserviços mais simples otimizaria nossos trabalho. 
Tivemos alguns problemas com os outros integrantes do grupo, inicialmente éramos 5, mas os outros 3 integrantes não participaram ativamente da realização do trabalho, devido a esse fato, foi precioso continuar o trabalho com apenas 2 integrantes. Além disso, tivemos alguns contra-tempos com o serviço A, que inicialmente tinha sido escrito em C++. Tentamos utilizar o Bazel para compilação e posteriormente o CMake, porém obtivemos alguns problemas para rodas os serviços na integração com o DockerFile na máquina de um dos nossos integrantes, sendo assim, optamos por reescrever o serviço A em python como o serviço B.

## 10. Conclusão

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