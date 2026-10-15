const BASE = "http://localhost:3000";

try {
  await fetch(`${BASE}/`);
} catch {
  console.log("Server is not running, aborting.");
  process.exit(1);
}

const res = await fetch(`${BASE}/transactions`);
const data = await res.json();
const ok = Array.isArray(data);
console.log(`${ok ? "PASS" : "FAIL"}  GET /transactions`);
process.exit(ok ? 0 : 1);
