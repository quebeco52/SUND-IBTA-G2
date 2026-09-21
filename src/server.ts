import express, { Request, Response } from "express";

import transactions from "../data/transactions.json" with { type: "json" };

const app = express();
app.use(express.json());

const PORT = 3000;



app.get("/transactions", (req: Request, res: Response): void => {
    res.json(transactions);
});



app.listen(PORT, (): void => {
    console.log(`Server running at http://localhost:${PORT}`);
});