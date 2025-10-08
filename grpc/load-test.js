import http from "k6/http";
import { check } from "k6";

export let options = {
  scenarios: {
    carga_fixa: {
      executor: "constant-arrival-rate",
      rate: 5000,              //  1000 requisições por unidade de tempo
      timeUnit: "1s",           // unidade de tempo
      duration: "300s",         // duração total do teste em segundos
      preAllocatedVUs: 1000,   // VUs reservados
      maxVUs: 5000          // limite máximo de VUs
    },
  },
};

export default function () {
  const url = "http://localhost:3000/analyze-text";
  const payload = JSON.stringify({ text: "Teste de performance do gateway gRPC" });
  const params = { headers: { "Content-Type": "application/json" } };

  const res = http.post(url, payload, params);
  check(res, { "status é 200": (r) => r.status === 200 });
}
