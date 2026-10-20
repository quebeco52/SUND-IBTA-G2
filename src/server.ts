import express, { type Request, type Response } from "express";
import { pool } from "./db.js";
import {
  classificationEnum,
  transactionSchema,
  filterSchema,
  idParamSchema,
} from "./schemas.js";
import { env } from "process";
import type { ZodError } from "zod";

const app = express();
app.use(express.json());

type Transaction = {
  id: number;
  date: string;
  recipient: string;
  amount: number;
  classification: string;
};

// Shared query: returns transactions with date as 'yyyy-mm-dd' text and amount as a number
const SELECT_TRANSACTIONS = `
  SELECT t.id,
         to_char(t.transaction_date, 'YYYY-MM-DD') AS date,
         t.recipient,
         t.amount::float8 AS amount,
         t.classification
  FROM transactions t`;

function handleError(res: Response, err: unknown): void {
  console.error(err);
  res.status(500).json({ error: "Database error" });
}

function firstIssue(error: ZodError): string {
  return error.issues[0]?.message ?? "Invalid input";
}

async function findTransaction(id: number): Promise<Transaction | undefined> {
  const result = await pool.query<Transaction>(
    `${SELECT_TRANSACTIONS} WHERE t.id = $1`,
    [id],
  );
  return result.rows[0];
}


app.get("/transactions", async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query<Transaction>(
      `${SELECT_TRANSACTIONS} ORDER BY t.id`,
    );
    res.json(result.rows);
  } catch (err) {
    handleError(res, err);
  }
});

// Must stay above '/transactions/:id', otherwise 'filterbydate' is read as an id
app.get(
  "/transactions/filterbydate",
  async (req: Request, res: Response): Promise<void> => {
    const safeQuery = filterSchema.safeParse(req.query);
    if (!safeQuery.success) {
      res.status(400).json({ error: firstIssue(safeQuery.error) });
      return;
    }
    const { from, to } = safeQuery.data;

    try {
      const result = await pool.query<Transaction>(
        `${SELECT_TRANSACTIONS} WHERE t.transaction_date BETWEEN $1 AND $2 ORDER BY t.transaction_date, t.id`,
        [from, to],
      );
      res.json(result.rows);
    } catch (err) {
      handleError(res, err);
    }
  },
);

app.get(
  "/transactions/:id",
  async (req: Request, res: Response): Promise<void> => {
    const safeParams = idParamSchema.safeParse(req.params);
    if (!safeParams.success) {
      res.status(400).json({ error: firstIssue(safeParams.error) });
      return;
    }
    const { id } = safeParams.data;
    if (id === null) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    try {
      const transaction = await findTransaction(id);
      if (transaction) {
        res.json(transaction);
      } else {
        res.status(404).json({ error: "Transaction not found" });
      }
    } catch (err) {
      handleError(res, err);
    }
  },
);

app.post(
  "/transactions",
  async (req: Request, res: Response): Promise<void> => {
    const safeBody = transactionSchema.safeParse(req.body);
    if (!safeBody.success) {
      res.status(400).json({ error: firstIssue(safeBody.error) });
      return;
    }
    const { date, recipient, amount, classification } = safeBody.data;

    try {
      const inserted = await pool.query<{ id: number }>(
        `INSERT INTO transactions (transaction_date, recipient, amount, classification)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [date, recipient, amount, classification],
      );
      const created = await findTransaction(inserted.rows[0]!.id);
      res.status(201).json(created);
    } catch (err) {
      handleError(res, err);
    }
  },
);



app.put(
  "/transactions/:id",
  async (req: Request, res: Response): Promise<void> => {
    const safeParams = idParamSchema.safeParse(req.params);
    if (!safeParams.success) {
      res.status(400).json({ error: firstIssue(safeParams.error) });
      return;
    }
    const { id } = safeParams.data;

    const safeBody = transactionSchema.safeParse(req.body);
    if (!safeBody.success) {
      res.status(400).json({ error: firstIssue(safeBody.error) });
      return;
    }
    const { date, recipient, amount, classification } = safeBody.data;

    try {
      const updated = await pool.query<{ id: number }>(
        `UPDATE transactions
         SET transaction_date = $1, recipient = $2, amount = $3, classification = $4
         WHERE id = $5
         RETURNING id`,
        [date, recipient, amount, classification, id],
      );
      if (updated.rows.length === 0) {
        res.status(404).json({ error: "Transaction not found" });
        return;
      }
      res.json(await findTransaction(id));
    } catch (err) {
      handleError(res, err);
    }
  },
);


app.delete(
  "/transactions/:id",
  async (req: Request, res: Response): Promise<void> => {
    const safeParams = idParamSchema.safeParse(req.params);
    if (!safeParams.success) {
      res.status(400).json({ error: firstIssue(safeParams.error) });
      return;
    }
    const { id } = safeParams.data;
    if (id === null) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    try {
      const result = await pool.query(
        "DELETE FROM transactions WHERE id = $1",
        [id],
      );
      if (!result.rowCount) {
        res.status(404).json({ error: "Transaction not found" });
        return;
      }
      res.status(204).send();
    } catch (err) {
      handleError(res, err);
    }
  },
);

app.get(
  "/classifications",
  (_req: Request, res: Response): void => {
    res.json(classificationEnum.options);
  },
);



app.listen(env.APP_PORT, (): void => {
  console.log(`Server running at http://localhost:${env.APP_PORT}`);
}).on("error", (err): void => {
  console.error(err.message);
  process.exit(1);
});
