const BASE = "http://localhost:3000";

try {
  await fetch(`${BASE}/`);
} catch {
  console.log("Server is not running, aborting.");
  process.exit(1);
}

let failures = 0;
const check = (ok: boolean) => {
  console.log(ok ? "PASS" : "FAIL");
  if (!ok) failures++;
};

const get = async (path: string) => {
  console.log(`GET ${path}`);
  const res = await fetch(`${BASE}${path}`);
  const data = await res.json();
  return { status: res.status, data };
};

// visa alla transaktioner
check(Array.isArray((await get("/transactions")).data));

// visa transaktion 1 (finns)
check((await get("/transactions/1")).status === 200);
// visa trasaktion 9999999 (finns ej)
check((await get("/transactions/9999999")).status === 404);

// fyll på här...

console.log(`Total failures: ${failures}`);
