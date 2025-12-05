import http from "k6/http";
import { check } from "k6";

const text = open("./texto-grande.txt");

export let options = {
  scenarios: {
    carga_pequena: {
      executor: "constant-arrival-rate",
      rate: 5000,      //carga baixa: 300 - media: 800 - alta: 1500 - ESTRESSE - 5000
      timeUnit: "1s",
      duration: "180s",
      preAllocatedVUs: 2500, //  baixa: 150 - media: 400 - alta: 800 - ESTRESSE - 2500
      maxVUs: 5000      // carga baixa: 300 - media 800 - alta: 1500 - ESTRESSE - 5000
    }
  }
};

export default function () {
  const payload = JSON.stringify({ text });
  const params = { headers: { "Content-Type": "application/json" } };

  const res = http.post("http://127.0.0.1:44637/analyze-text", payload, params);

  check(res, { "status 200": (r) => r.status === 200 });
}