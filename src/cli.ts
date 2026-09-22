import { number, select } from "@inquirer/prompts";

const base = "http://localhost:3000";

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

    case "view-all": {
      try {
        const response = await fetch(base + "/transactions");
        const data = await response.json();
        console.table(data);
      } catch (error) {
        console.log(error.message);
      }
      break;
    }

    case "view-one": {
      const id = await number({ message: "Transaction id:", required: true });
      try {
        const response = await fetch(`${base}/transactions/${id}`);
        const data = await response.json();
        console.table(data);
      } catch (error) {
        console.log(error.message);
      }
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
      console.log("TODO");
      break;
    }

    case "filter":
      console.log("TODO");
      break;
  }
}

try {
  await main();
} catch (error) {
  console.log(error.message);
}
