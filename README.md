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

```promql
rate(container_cpu_usage_seconds_total{namespace="pspd-grpc"}[1m])
```

2. CPU por pod:

```promql
rate(container_cpu_usage_seconds_total{pod=~"grpc-a.*"}[1m])
```
```promql
rate(container_cpu_usage_seconds_total{pod=~"grpc-b.*"}[1m])
```
```promql
rate(container_cpu_usage_seconds_total{pod=~"grpc-p.*"}[1m])
```

3. Memória de todos os Pods:

```promql
container_memory_usage_bytes{namespace="pspd-grpc"}
```

4. Memória por pod:

```promql
container_memory_usage_bytes{pod=~"grpc-a.*"}
```

5. CPU total usada em cada node:

```promql
sum(rate(container_cpu_usage_seconds_total[1m])) by (node)
```

6. Memória total por node:

```promql
sum(container_memory_usage_bytes) by (node)
```

7. Ver onde cada pod está rodando (distribuição dos nós):

```promql
kube_pod_info{namespace="pspd-grpc"}
```

(não retorna gráfico, retorna txt com serviço e node)


# 📄 Análise de Resultados – Projeto de Paralelismo com Microserviços, Kubernetes, Prometheus e k6


Essa seção apresenta a análise dos resultados experimentais obtidos a partir da execução de uma arquitetura de microserviços composta por três serviços:

- **Serviço P (Gateway REST)** – Responsável por receber as requisições HTTP.
- **Serviço A (gRPC)** – Responsável pela contagem de palavras.
- **Serviço B (gRPC)** – Responsável pela contagem de vogais.

O serviço P recebe uma entrada textual de aproximadamente **5.000 caracteres**, encaminha esta carga simultaneamente aos serviços A e B por meio de chamadas gRPC paralelas e retorna um resultado agregado ao cliente.

O objetivo principal do trabalho é **avaliar o impacto do paralelismo, da distribuição em cluster e da replicação de serviços no desempenho do sistema**, utilizando:

- **k6** para testes de carga;
- **Prometheus** para observabilidade (CPU e Memória);
- **Docker Stats** para monitoramento direto;
- **Minikube multinó** como ambiente de cluster Kubernetes.

---

##  Metodologia Experimental

Para a realização dos experimentos foram definidos de maneira prévia cinco cenários principais de teste. A definição foi realizada anteriormente ao início dos testes de modo a evitar qualquer tipo de viés na coleta dos dados. Essa escolha trás consigo uma abordagem acadêmica da experimentação, mas por outro lado talvez não explore o cenário prático de paralelismo, a seguir os 5 cenários escolhidos :

| Cenário | Descrição |
|--------|-----------|
| Cenário 1 | Execução apenas com Docker, sem cluster |
| Cenário 2 | Cluster Kubernetes com autoscaling |
| Cenário 3 | Todos os serviços no mesmo nó |
| Cenário 4 | Cada serviço em um nó distinto |
| Cenário 5 | Cada serviço com 2 réplicas (estresse) |

Para a coleta de resultado dos experimentos foi utilizado a ferramenta de observabilidade Prometheus, e a ferramenta de teste de carga K6.

Os testes de carga foram realizados com o executor `constant-arrival-rate`, variando entre **300, 800, 1500 e até 5000 requisições por segundo**.

---

# Análise por Cenário

---

## Cenário 1 – Execução sem Cluster (Docker Local)

### Descrição
Neste cenário, os três serviços foram executados como containers Docker independentes, sem orquestração por Kubernetes. Foram realizados três testes:

- **Carga Baixa:** 300 req/s  
- **Carga Média:** 800 req/s  
- **Carga Alta:** ~1200 req/s (limite físico da máquina)

### Principais Resultados (k6)

| Carga | Req/s Efetivo | Latência Média | p95 | Erros |
|--------|----------------|----------------|-----|--------|
| Baixa | ~326 | ~70 ms | ~293 ms | 0% |
| Média | ~859 | ~2,3 ms | ~4 ms | 0% |
| Alta | ~1225 | ~1178 ms | ~760 ms | ~0,75% |

### Análise

- Em **baixa e média carga**, o sistema apresentou **excelente estabilidade e baixa latência**.
- Em **alta carga**, ocorreram:
  - Saturação total de CPU;
  - Latências superiores a 1 segundo;
  - Erros de requisição e iterações descartadas.

 Conclusão:  
A arquitetura **funciona corretamente até um limite físico**, porém **não é escalável sem clusterização**, tornando o serviço P um **gargalo central**.

---

##  Cenário 2 – Cluster Kubernetes com Autoscaling

### Descrição
Os serviços passaram a ser gerenciados pelo Kubernetes, com distribuição automática dos pods entre os nós. Em alguns momentos, o serviço P e B ficaram no mesmo nó, enquanto o serviço A ficou isolado.

### Resultados

| Carga | Req/s Efetivo | Latência Média | Taxa de Erro |
|--------|----------------|----------------|----------------|
| Baixa | ~243 | ~1114 ms | 0% |
| Média | ~532 | ~1059 ms | ~65% |
| Alta | ~1493 | ~329 ms | ~86% |

### Análise

Mesmo em **carga baixa**, a latência já se apresentou **elevada**, indicando:

- Overhead do cluster;
- Saturação de nós;
- Gargalos na comunicação entre pods.

 Conclusão:  
Apenas utilizar Kubernetes com autoscaling **não garante melhoria automática de desempenho** se não houver planejamento adequado da distribuição de carga.

---

##  Cenário 3 – Todos os Serviços no Mesmo Nó

### Descrição
Neste cenário, todos os serviços (P, A e B) foram executados dentro de um único nó do cluster, com teste direto em carga alta (1500 req/s).

### Resultados

| Métrica | Valor |
|--------|--------|
| Req/s | ~1513 |
| Latência Média | ~284 ms |
| p95 | ~1647 ms |
| Taxa de Erro | ~87,5% |

### Análise

- Forte contenção de CPU;
- Altíssimo índice de falhas;
- Gargalo extremo de escalonamento.

 Conclusão:  
Este cenário comprova que **colocar todos os serviços em um único nó anula totalmente o paralelismo**.

---

##  Cenário 4 – Cada Serviço em um Nó Distinto

### Descrição
Cada serviço foi alocado em um nó diferente, sem replicações, com carga alta de 1500 req/s.

### Resultados

| Métrica | Valor |
|--------|--------|
| Req/s | ~1456 |
| Latência Média | ~503 ms |
| p95 | ~1251 ms |
| Taxa de Erro | ~87,5% |

### Análise

- Distribuir os serviços em nós distintos **reduz a contenção direta de CPU**, mas:
  - Não elimina gargalos;
  - Não evita falhas sob alta carga;
  - Continua existindo ponto único de falha (serviço P).

Conclusão:  
A separação por nós melhora parcialmente o desempenho, mas **não resolve o problema sem replicação**.

---

## Cenário 5 – Cada Serviço com 2 Réplicas + Teste de Estresse (5000 req/s)

### Descrição
Neste cenário final:

- Cada serviço (P, A, B) possuía **2 réplicas (total de 6 pods)**;
- Cluster com **3 nós**;
- Teste em **carga extrema: 5000 req/s**.

### Resultados

| Métrica | Valor |
|--------|--------|
| Req/s | ~4187 |
| Latência Média | ~239 ms |
| p95 | ~1423 ms |
| Taxa de Erro | ~93,6% |
| Throughput Enviado | ~23 MB/s |

### Análise

Apesar da arquitetura estar mais distribuída:

- O volume de carga extrapolou a capacidade total do cluster;
- Houve alta taxa de falhas;
- Crescimento absurdo de `http_req_blocked` e `dropped_iterations`.

Conclusão:  
Mesmo com **replicação**, o sistema possui **limites físicos claros**, especialmente quando submetido a cargas extremas.

---

# Tabela Comparativa Geral

| Cenário | Arquitetura | Req/s | Latência Média | Taxa de Erro | Estabilidade |
|--------|--------------|--------|----------------|----------------|----------------|
| 1 | Docker local | ~1225 | ~1178 ms | ~0,75% | Média |
| 2 | Kubernetes autoscaling | ~1493 | ~329–1059 ms | Até 86% | Baixa |
| 3 | Todos no mesmo nó | ~1513 | ~284 ms | ~87% | Muito baixa |
| 4 | Cada serviço em um nó | ~1456 | ~503 ms | ~87% | Baixa |
| 5 | 2 réplicas por serviço | ~4187 | ~239 ms | ~93% | Baixa |

---

# 5. Conclusões Gerais

A partir da análise dos cinco cenários experimentais realizados, foi possível observar de forma prática e mensurável os impactos diretos do **paralelismo, da clusterização, da distribuição de serviços e da replicação de pods no desempenho de sistemas distribuídos**.

Inicialmente, no cenário sem clusterização (apenas Docker), o sistema apresentou **ótima estabilidade em cargas baixas e médias**, mantendo baixíssimos tempos de resposta e ausência total de falhas. No entanto, à medida que a carga aumentou, ficou evidente a existência de um **limite físico bem definido da máquina host**, caracterizado por:
- Saturação de CPU;
- Crescimento abrupto da latência;
- Ocorrência de erros e descarte de iterações no k6.

Esse comportamento confirma que, mesmo com chamadas paralelas via gRPC entre os serviços A e B, a ausência de **distribuição de carga em múltiplos nós** transforma o serviço P (gateway) em um **ponto único de estrangulamento da arquitetura**.

Com a introdução do Kubernetes, observou-se que a **clusterização por si só não garante aumento automático de desempenho**. Em alguns cenários, especialmente quando múltiplos serviços foram alocados no mesmo nó, houve:
- Alto overhead do ambiente orquestrado;
- Competição por recursos computacionais;
- Aumento significativo da latência média;
- Crescimento expressivo da taxa de falhas.

Isso evidencia que a simples utilização de um cluster não é suficiente: é fundamental que exista **planejamento adequado da distribuição dos serviços entre os nós** para que os benefícios da computação distribuída sejam efetivamente alcançados.

Nos testes em que **todos os serviços foram executados em um único nó**, ficou claro que essa configuração é altamente ineficiente sob cargas elevadas. Mesmo com paralelismo lógico entre os serviços, a contenção de CPU e memória no nível físico do nó anulou completamente qualquer ganho arquitetural, ocasionando:
- Taxas de erro superiores a 80%;
- Latência extremamente elevada;
- Instabilidade generalizada do sistema.

Quando os serviços passaram a ser distribuídos em **nós distintos**, foi possível observar uma melhora moderada na latência e um leve ganho de estabilidade. Ainda assim, mesmo nessa configuração, o sistema permaneceu vulnerável a falhas sob cargas elevadas, principalmente pela ausência de replicação do serviço P, que continuou sendo um **ponto único de falha**.

O cenário mais robusto estruturalmente foi aquele em que **cada serviço possuía duas réplicas**, totalizando seis pods distribuídos no cluster. Nesta configuração, foi possível alcançar o maior throughput entre todos os experimentos, superando a marca de **4.000 requisições por segundo**, o que demonstra claramente o potencial da **replicação aliada à distribuição em múltiplos nós**. Todavia, mesmo nesse cenário, as cargas extremas impostas (até 5.000 req/s) ultrapassaram a capacidade total do ambiente, provocando:
- Elevadas taxas de erro;
- Crescimento do tempo de bloqueio de requisições (`http_req_blocked`);
- Grande quantidade de iterações descartadas pelo k6.

Esses resultados demonstram que todo sistema distribuído, independentemente da arquitetura adotada, está submetido a **limites físicos de processamento**, especialmente relacionados a CPU, memória, rede e capacidade de escalonamento dos nós.

Além disso, os dados coletados pelo Prometheus foram fundamentais para identificar:
- Picos de utilização de CPU;
- Crescimento progressivo do consumo de memória;
- Momentos de saturação completa dos recursos do cluster.

Dessa forma, pode-se concluir que:

- ✅ O **paralelismo via gRPC** entre os serviços A e B é eficiente e traz ganhos reais de desempenho;
- ✅ A **clusterização com Kubernetes** oferece escalabilidade estrutural;
- ✅ A **replicação de pods** é essencial para aumentar throughput e tolerância a falhas;
- ❌ A **má distribuição de serviços entre nós** compromete severamente o desempenho;
- ❌ A **ausência de replicação do gateway (serviço P)** torna o sistema altamente vulnerável;
- ❌ Nenhuma arquitetura é imune aos **limites físicos do hardware**.

Por fim, este trabalho evidencia, de forma prática, que **o desempenho de sistemas distribuídos não depende apenas da adoção de tecnologias modernas**, mas principalmente de **decisões corretas de arquitetura, distribuição de carga e observabilidade contínua**. O uso combinado de **k6, Prometheus, Docker e Kubernetes** mostrou-se essencial para validar hipóteses, identificar gargalos e compreender o comportamento real do sistema sob estresse.

---


# Disponibilidade dos Dados e Materiais

Todos os dados experimentais utilizados para a análise de desempenho deste projeto estão disponíveis no próprio repositório, de forma a garantir a **transparência, reprodutibilidade e validação dos experimentos apresentados**.

Estão disponibilizados no projeto:

-  **Prints das telas do Prometheus**, contendo os gráficos de utilização de CPU e memória em todos os cenários testados;
- **Prints do Docker Stats**, demonstrando em tempo real o consumo de recursos dos containers durante a execução dos testes;
- **Arquivos de saída em formato JSON do k6**, contendo todas as métricas detalhadas de cada cenário de carga (baixa, média, alta e estresse).

Esses materiais permitem que qualquer leitor interessado possa:

- Validar os resultados apresentados neste relatório;
- Reproduzir os testes em ambiente similar;
- Realizar comparações com outras arquiteturas e abordagens de paralelismo.

Dessa forma, o projeto atende aos princípios fundamentais de **reprodutibilidade científica e auditabilidade dos resultados**.


# Dificuldades Encontradas

escrever dificuldades *


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
Documentação do Prometheus: https://prometheus.io/
Documentação do K6: https://k6.io/