import { input, number, select } from "@inquirer/prompts";

const BASE_URL = "http://localhost:3000"; // match the port your server listens on

async function main() {
  console.clear();
  console.log("╔═══════════════════╗");
  console.log("║   Internet Bank   ║");
  console.log("╚═══════════════════╝");
  console.log();

  const answer = await select({
    message: "Main menu",
    choices: [
      { name: "View transactions", value: "view-all" },
      { name: "View one transaction", value: "view-one" },
      { name: "Add transaction", value: "add" },
      { name: "Update transaction", value: "update" },
      { name: "Delete transaction", value: "delete" },
      { name: "Filter transaction by date", value: "filter" },
      { name: "Exit", value: "exit" },
    ],
  });

  switch (answer) {
    case "exit":
      console.log("Have a nice day. Bye.");
      break;

    case "view-all":
      const res = await fetch(`${BASE_URL}/transactions`);
      const transactions = await res.json();
      console.table(transactions); // nice formatted output in the terminal
      break;

    case "view-one": {
      const id = await number({ message: "Transaction id:", required: true });
      const res = await fetch(`${BASE_URL}/transactions/${id}`);
      const transaction = await res.json();
      console.table([transaction]); // nice formatted output in the terminal
      break;
    }

    case "add":
      console.log("TODO");
      break;

    case "update":
      console.log("TODO");
      break;

    case "delete": {
      const id = await number({ message: "Transaction id:", required: true });
      const res = await fetch(`${BASE_URL}/transactions/${id}`, { method: "DELETE" });
      console.log("Transaction deleted.");
      break;
    }

    case "filter": {
      const from = await input({
        message: "From date (YYYY-MM-DD):",
      });

      const to = await input({
        message: "To date (YYYY-MM-DD):",
      });

      const res2 = await fetch(
        `${BASE_URL}/transactions/filterbydate?from=${from}&to=${to}`
      );
      const filteredTransactions = await res2.json();
      console.table(filteredTransactions);
      break;
    }
  }
}

try {
  await main();
} catch (error) {
  console.log(error instanceof Error ? error.message : error);
}
