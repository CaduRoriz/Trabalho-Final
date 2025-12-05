import http from "k6/http";
import { check } from "k6";

const text = open("./texto-grande.txt");

export let options = {
  scenarios: {
    carga_pequena: {
      executor: "constant-arrival-rate",
      rate: 800,       
      timeUnit: "1s",
      duration: "180s",
      preAllocatedVUs: 400,
      maxVUs: 800
    }
  }
};

export default function () {
  const payload = JSON.stringify({ text });
  const params = { headers: { "Content-Type": "application/json" } };

  const res = http.post("http://localhost:3000/analyze-text", payload, params);

  check(res, { "status 200": (r) => r.status === 200 });
}
