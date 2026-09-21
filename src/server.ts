import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

const PORT = 3000;

let transactions = [1, 1];

app.get("/transactions", (req: Request, res: Response): void => {
    res.json(transactions);
});



app.listen(PORT, (): void => {
    console.log(`Server running at http://localhost:${PORT}`);
});