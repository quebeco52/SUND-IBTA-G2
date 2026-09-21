import express, { Request, Response } from "express";

import transactions from "../data/transactions.json" with { type: "json" };

const app = express();
app.use(express.json());

const PORT = 3000;



app.get("/transactions", (req: Request, res: Response): void => {
    res.json(transactions);
});

app.post("/transactions", (req: Request, res: Response): void => {
    const { date, recipient, amount } = req.body;

    if (!date || !recipient || typeof amount !== "number") {
        res.status(400).json({ error: "Missing or invalid fields" });
        return;
    }

    const nextId = transactions.length + 1;

    const newTransaction = {
        id: nextId,
        date,
        recipient,
        amount,
    };

    transactions.push(newTransaction);
    res.status(201).json(newTransaction);
});





app.listen(PORT, (): void => {
    console.log(`Server running at http://localhost:${PORT}`);
});