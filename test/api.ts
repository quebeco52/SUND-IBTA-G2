const BASE = "http://localhost:3000";

try {
  await fetch(`${BASE}/`);
} catch {
  console.log("Server is not running, aborting.");
  process.exit(1);
}

let failures = 0;
let testNumber = 0;
const check = (ok: boolean) => {
  testNumber++;
  console.log(`${testNumber}. ${ok ? "PASS" : "FAIL"}`);
  if (!ok) failures++;
};

const req = async (method: string, path: string, body?: any) => {
  console.log(`${method} ${path}`);
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json().catch(() => null) };
};

// Vi skapar en transaktion som vi kan använda i tester, och som tas bort på slutet
const trans = await req("POST", "/transactions", {
  date: "2026-10-18",
  recipient: "ICA",
  amount: 500,
});
check(trans.status === 201);

const transID = trans.data?.id;
if (transID == null) {
  console.log("Could not create transaction, aborting.");
  process.exit(1);
}

// GET /transactions
check(Array.isArray((await req("GET", "/transactions")).data));

// GET /transactions/:id
check((await req("GET", `/transactions/${transID}`)).status === 200);
check((await req("GET", "/transactions/9999999")).status === 404);

// GET /classifications
check(Array.isArray((await req("GET", "/classifications")).data));
check((await req("GET", "/classifications/1")).status === 200);
check((await req("GET", "/classifications/9999999")).status === 404);

// DELETE /transactions/:id
check((await req("DELETE", `/transactions/${transID}`)).status === 204);
check((await req("DELETE", "/transactions/9999999")).status === 404);

console.log(`Total failures: ${failures}`);
