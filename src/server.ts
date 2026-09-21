import express, { Request, Response } from "express";

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
};



app.get("/transactions", (req: Request, res: Response): void => {
    res.json(transactions);
});

app.get("/transactions/:id", (req: Request, res: Response): void => {
    const id = Number(req.params.id);
    const transaction = transactions.find((t) => t.id === id);
    if (transaction) {
        res.json(transaction);
    } else {
        res.status(404).json({ error: "Transaction not found" });
    }
});

app.post("/transactions", (req: Request, res: Response): void => {
    const { date, recipient, amount } = req.body;

    if (!date || !recipient || typeof amount !== "number") {
        res.status(400).json({ error: "Missing or invalid fields" });
        return;
    }

    const nextId = transactions.length + 1;

    const newTransaction : Transaction = {
        id: nextId,
        date,
        recipient,
        amount,
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

app.get("/classifications", (req: Request, res: Response): void => {
    res.json(classifications);
});




app.listen(PORT, (): void => {
    console.log(`Server running at http://localhost:${PORT}`);
});