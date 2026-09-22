import { input, number, select } from "@inquirer/prompts";

const base = "http://localhost:3000";

async function main() {
  while (true) {
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
        return;

      case "view-all": {
        try {
          const response = await fetch(base + "/transactions");
          const data = await response.json();
          console.table(data);
        } catch (error) {
          console.log((error as Error).message);
        }
        break;
      }

      case "view-one": {
        const id = await number({ message: "Transaction id:", required: true });
        try {
          const response = await fetch(`${base}/transactions/${id}`);
          const data = await response.json();
          if (!response.ok) {
            throw new Error(
              data.error ?? `Request failed (${response.status})`,
            );
          }
          console.table(data);
        } catch (error) {
          console.log((error as Error).message);
        }
        break;
      }

      case "add": {
        const today = new Date().toISOString().split("T")[0];
        const date = await input({
          message: "Date (YYYY-MM-DD):",
          default: today,
          validate: (val: string) =>
            /^\d{4}-\d{2}-\d{2}$/.test(val) || "Format must be YYYY-MM-DD",
        });

        const recipient = await input({
          message: "Recipient:",
          validate: (val: string) => val.trim().length > 0 || "Cannot be empty",
        });

        const amount = await number({ message: "Amount:", required: true });

        try {
          const response = await fetch(`${base}/transactions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ date, recipient: recipient.trim(), amount }),
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(
              data.error ?? `Request failed (${response.status})`,
            );
          }

          console.log("Transaction added successfully:");
          console.table([data]);
        } catch (error) {
          console.log((error as Error).message);
        }
        break;
      }

      case "update": {
        const id = await number({ message: "Transaction id:", required: true });
        try {
          const response = await fetch(`${base}/transactions/${id}`);
          const data = await response.json();
          if (!response.ok) {
            throw new Error(
              data.error ?? `Request failed (${response.status})`,
            );
          }

          console.table([data]);

          const date = await input({
            message: "Date:",
            default: data.date,
            validate: (val: string) =>
              /^\d{4}-\d{2}-\d{2}$/.test(val) || "Format must be YYYY-MM-DD",
          });
          const recipient = await input({
            message: "Recipient:",
            default: data.recipient,
          });
          const amount = await number({
            message: "Amount:",
            default: data.amount,
          });

          const updateResponse = await fetch(`${base}/transactions/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ date, recipient, amount }),
          });
          const updateData = await updateResponse.json();
          if (!updateResponse.ok) {
            throw new Error(
              updateData.error ?? `Request failed (${updateResponse.status})`,
            );
          }

          console.log("Transaction updated");
        } catch (error) {
          console.log((error as Error).message);
        }
        break;
      }

      case "delete": {
        const id = await number({ message: "Transaction id:", required: true });
        try {
          const response = await fetch(`${base}/transactions/${id}`, {
            method: "DELETE",
          });
          if (!response.ok) {
            const data = await response.json();
            throw new Error(
              data.error ?? `Request failed (${response.status})`,
            );
          }
          console.log("Transaction deleted");
        } catch (error) {
          console.log((error as Error).message);
        }
        break;
      }

      case "filter": {
        const from = await input({
          message: "From date (YYYY-MM-DD):",
          validate: (val: string) =>
            /^\d{4}-\d{2}-\d{2}$/.test(val) || "Format must be YYYY-MM-DD",
        });

        const to = await input({
          message: "To date (YYYY-MM-DD):",
          validate: (val: string) =>
            /^\d{4}-\d{2}-\d{2}$/.test(val) || "Format must be YYYY-MM-DD",
        });

        try {
          const res = await fetch(
            `${base}/transactions/filterbydate?from=${from}&to=${to}`,
          );
          const filteredTransactions = await res.json();
          if (!res.ok) {
            throw new Error(
              filteredTransactions.error ?? `Request failed (${res.status})`,
            );
          }
          console.table(filteredTransactions);
        } catch (error) {
          console.log((error as Error).message);
        }
        break;
      }
    }

    await input({ message: "Press Enter to go back to the main menu" });
  }
}

try {
  await main();
} catch (error) {
  console.log(error instanceof Error ? error.message : error);
}
