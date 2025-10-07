import express from "express";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import * as path from 'path'; // <--- Importe o 'path'
import { fileURLToPath } from 'url'; // <--- Importe o 'fileURLToPath'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Carrega o arquivo .proto
const PROTO_PATH = path.join(__dirname, '..', 'proto', 'service.proto'); 
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const proto = grpc.loadPackageDefinition(packageDefinition).textanalyzer;



const grpcOptions = {
  'grpc.keepalive_timeout_ms': 2000,
  'grpc.keepalive_time_ms': 2000,
};

// Cria os clients gRPC para A e B
const clientA = new proto.WordCounterService("microservice-a:50051", grpc.credentials.createInsecure(), grpcOptions);
const clientB = new proto.VowelCounterService("microservice-b:50052", grpc.credentials.createInsecure(), grpcOptions);

// Endpoint HTTP
app.post("/analyze-text", (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Campo 'text' é obrigatório." });
  }

  // Chama A e B em paralelo
  console.log("Chamando serviço A...");
  clientA.CountWords({ text }, (errA, responseA) => {
  if (errA) return res.status(500).json({ error: "Erro no serviço A", details: errA });

  console.log("Resposta de A:", responseA);

  console.log("Chamando serviço B...");
  clientB.CountVowels({ text }, (errB, responseB) => {
    if (errB) return res.status(500).json({ error: "Erro no serviço B", details: errB });

    console.log("Resposta de B:", responseB);

    res.json({
      text,
      word_count: responseA.wordCount ?? responseA.word_count,
      vowel_count: responseB.vowelCount ?? responseB.vowel_count,
    });
  });
});

});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Gateway P rodando em http://localhost:${PORT}`);
});
