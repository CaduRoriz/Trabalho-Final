import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

// Endpoint principal
app.post("/analyze-text", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Campo 'text' é obrigatório." });

  try {
    // Chama os serviços REST A e B
    const [respA, respB] = await Promise.all([
      axios.post("http://a-service:6001/count-words", { text }),
      axios.post("http://b-service:6002/count-vowels", { text }),
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
app.listen(PORT, () => console.log(`Gateway P (REST) rodando em http://localhost:${PORT}`));
