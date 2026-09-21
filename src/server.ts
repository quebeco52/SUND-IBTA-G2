import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

const PORT = 3000;



app.listen(PORT, (): void => {
    console.log(`Server running at http://localhost:${PORT}`);
});