import express, { Request, Response } from "express";
import { z } from "zod";

import transactions from "../data/transactions.json" with { type: "json" };
import classifications from "../data/classifications.json" with { type: "json" };

const app = express();
app.use(express.json());

const PORT = 3000;

type Transaction = {
  id: number;
  date: string;
  recipient: string;
  amount: number;
  classification?: string | null;
};

const bodySchema = z.object({
  date: z.iso.date("Invalid date, expected yyyy-mm-dd."),
  recipient: z.string().min(1, "Recipient is required."),
  amount: z.number().int("Amount must be an integer."),
});

const dateIntervalSchema = z.object({
  from: z.iso.date("Invalid from date, expected yyyy-mm-dd."),
  to: z.iso.date("Invalid to date, expected yyyy-mm-dd."),
});

app.get("/transactions", (req: Request, res: Response): void => {
  const transactionsWithClassifications = transactions.map((transaction) => {
    const match = classifications.find(
      (c) => c.recipient === transaction.recipient,
    );
    return {
      ...transaction,
      classification: match ? match.classification : null,
    };
  });
  res.json(transactionsWithClassifications);
});

app.get("/transactions/filterbydate", (req: Request, res: Response): void => {
  const safeDates = dateIntervalSchema.safeParse(req.query);

  if (!safeDates.success) {
    res.status(400).json({ error: safeDates.error.issues[0].message });
    return;
  }

  const { from, to } = safeDates.data;

  const filtered = transactions.filter((t) => {
    const transactionDate = t.date;
    return transactionDate >= from && transactionDate <= to;
  });

  res.json(filtered);
});

app.get("/transactions/:id", (req: Request, res: Response): void => {
  const id = Number(req.params.id);
  const transaction = transactions.find((t) => t.id === id);
  if (transaction) {
    const match = classifications.find(
      (c) => c.recipient === transaction.recipient,
    );
    res.json({
      ...transaction,
      classification: match ? match.classification : null,
    });
  } else {
    res.status(404).json({ error: "Transaction not found" });
  }
});

app.post("/transactions", (req: Request, res: Response): void => {
  const safeBody = bodySchema.safeParse(req.body);

  if (!safeBody.success) {
    res.status(400).json({ error: safeBody.error.issues[0].message });
    return;
  }

  const { date, recipient, amount } = safeBody.data;

  const nextId = transactions.length + 1;

  const match = classifications.find(
    (c) => c.recipient === recipient,
  );

  const newTransaction: Transaction = {
    id: nextId,
    date,
    recipient,
    amount,
    classification: match ? match.classification : null,
  };

  transactions.push(newTransaction);
  res.status(201).json(newTransaction);
});

app.delete("/transactions/:id", (req: Request, res: Response): void => {
  const id = Number(req.params.id);
  const index = transactions.findIndex((t) => t.id === id);
  if (index !== -1) {
    transactions.splice(index, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ error: "Transaction not found" });
  }
});

app.put("/transactions/:id", (req: Request, res: Response): void => {
  const id = Number(req.params.id);
  const index = transactions.findIndex((t) => t.id === id);
  if (index !== -1) {
    const safeBody = bodySchema.safeParse(req.body);
    if (!safeBody.success) {
      res.status(400).json({ error: safeBody.error.issues[0].message });
      return;
    }
    const { date, recipient, amount } = safeBody.data;

    const updatedTransaction: Transaction = {
      id,
      date,
      recipient,
      amount,
    };

    transactions[index] = updatedTransaction;
    res.json(updatedTransaction);
  } else {
    res.status(404).json({ error: "Transaction not found" });
  }
});

app.get("/classifications", (req: Request, res: Response): void => {
  res.json(classifications);
});

app.listen(PORT, (): void => {
  console.log(`Server running at http://localhost:${PORT}`);
});
