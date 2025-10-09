import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

// Usa variáveis de ambiente definidas no docker-compose
const A_SERVICE_URL = process.env.A_SERVICE_URL || "http://rest-a:6001";
const B_SERVICE_URL = process.env.B_SERVICE_URL || "http://rest-b:6002";

app.post("/analyze-text", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Campo 'text' é obrigatório." });

  try {
    const [respA, respB] = await Promise.all([
      axios.post(`${A_SERVICE_URL}/count-words`, { text }),
      axios.post(`${B_SERVICE_URL}/count-vowels`, { text }),
    ]);

    res.json({
      text,
      word_count: respA.data.word_count,
      vowel_count: respB.data.vowel_count,
    });
  } catch (err) {
    console.error("Erro ao chamar serviços:", err.message);
    res.status(500).json({ error: "Falha ao chamar os microserviços A e B" });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Gateway P (REST) rodando em http://localhost:${PORT}`);
});
