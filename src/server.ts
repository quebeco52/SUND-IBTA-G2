import express, { Request, Response } from "express";
import { pool } from "./db.ts";
import {
  classificationSchema,
  transactionSchema,
  filterSchema,
  idParamSchema,
} from "./schemas.js";
import { env } from "process";

const app = express();
app.use(express.json());

type Transaction = {
  id: number;
  date: string;
  recipient: string;
  amount: number;
  classification: string;
};

type Classification = {
  id: number;
  recipient: string;
  classification: string;
};

// Shared query: joins in recipient and classification, returns the date as
// 'yyyy-mm-dd' text and the amount as a number
const SELECT_TRANSACTIONS = `
  SELECT t.id,
         to_char(t.date, 'YYYY-MM-DD') AS date,
         c.recipient,
         t.amount::float8 AS amount,
         c.classification
  FROM transactions t
  JOIN classifications c ON t.classification_id = c.id`;

function handleError(res: Response, err: unknown): void {
  console.error(err);
  res.status(500).json({ error: "Database error" });
}

async function findTransaction(id: number): Promise<Transaction | undefined> {
  const result = await pool.query<Transaction>(
    `${SELECT_TRANSACTIONS} WHERE t.id = $1`,
    [id],
  );
  return result.rows[0];
}

async function findClassificationId(recipient: string): Promise<number | null> {
  const result = await pool.query<{ id: number }>(
    "SELECT id FROM classifications WHERE recipient = $1",
    [recipient],
  );
  return result.rows.length > 0 ? result.rows[0].id : null;
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
      res.status(400).json({ error: safeQuery.error.issues[0].message });
      return;
    }
    const { from, to } = safeQuery.data;

    try {
      const result = await pool.query<Transaction>(
        `${SELECT_TRANSACTIONS} WHERE t.date BETWEEN $1 AND $2 ORDER BY t.date, t.id`,
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
      res.status(400).json({ error: safeParams.error.issues[0].message });
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
      res.status(400).json({ error: safeBody.error.issues[0].message });
      return;
    }
    const { date, recipient, amount } = safeBody.data;

    try {
      const classificationId = await findClassificationId(recipient);
      if (classificationId === null) {
        res.status(400).json({ error: "Unknown recipient." });
        return;
      }

      const inserted = await pool.query<{ id: number }>(
        "INSERT INTO transactions (date, classification_id, amount) VALUES ($1, $2, $3) RETURNING id",
        [date, classificationId, amount],
      );
      const created = await findTransaction(inserted.rows[0].id);
      res.status(201).json(created);
    } catch (err) {
      handleError(res, err);
    }
  },
);

app.post(
  "/classifications",
  async (req: Request, res: Response): Promise<void> => {
    const safeBody = classificationSchema.safeParse(req.body);
    if (!safeBody.success) {
      res.status(400).json({ error: safeBody.error.issues[0].message });
      return;
    }
    const { recipient, classification } = safeBody.data;

    try {
      const result = await pool.query<Classification>(
        `INSERT INTO classifications (recipient, classification)
       VALUES ($1, $2)
       RETURNING id, recipient, classification`,
        [recipient, classification],
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      // 23505 = unique violation: this recipient already exists
      if (err instanceof Error && "code" in err && err.code === "23505") {
        res.status(409).json({ error: "Recipient already exists." });
        return;
      }
      handleError(res, err);
    }
  },
);

app.delete(
  "/classifications/:id",
  async (req: Request, res: Response): Promise<void> => {
    const safeParams = idParamSchema.safeParse(req.params);
    if (!safeParams.success) {
      res.status(400).json({ error: safeParams.error.issues[0].message });
      return;
    }
    const { id } = safeParams.data;

    try {
      const result = await pool.query<Classification>(
        "DELETE FROM classifications WHERE id = $1 RETURNING id, recipient, classification",
        [id],
      );
      if (result.rows.length === 0) {
        res.status(404).json({ error: "Classification not found" });
        return;
      }

      const deleted = result.rows[0];
      res.json({
        message: `Classification "${deleted.recipient}" (${deleted.classification}) was deleted.`,
      });
    } catch (err) {
      // 23503 = foreign key violation: transactions still point to this row
      if (err instanceof Error && "code" in err && err.code === "23503") {
        res.status(409).json({
          error:
            "Classification is used by existing transactions and cannot be deleted.",
        });
        return;
      }
      handleError(res, err);
    }
  },
);

app.put(
  "/transactions/:id",
  async (req: Request, res: Response): Promise<void> => {
    const safeParams = idParamSchema.safeParse(req.params);
    if (!safeParams.success) {
      res.status(400).json({ error: safeParams.error.issues[0].message });
      return;
    }
    const { id } = safeParams.data;
    if (id === null) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const safeBody = transactionSchema.safeParse(req.body);
    if (!safeBody.success) {
      res.status(400).json({ error: safeBody.error.issues[0].message });
      return;
    }
    const { date, recipient, amount } = safeBody.data;

    try {
      const classificationId = await findClassificationId(recipient);
      if (classificationId === null) {
        res.status(400).json({ error: "Unknown recipient." });
        return;
      }

      const updated = await pool.query<{ id: number }>(
        `UPDATE transactions
       SET date = $1, classification_id = $2, amount = $3
       WHERE id = $4
       RETURNING id`,
        [date, classificationId, amount, id],
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
      res.status(400).json({ error: safeParams.error.issues[0].message });
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
  async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await pool.query<Classification>(
        "SELECT id, recipient, classification FROM classifications ORDER BY id",
      );
      res.json(result.rows);
    } catch (err) {
      handleError(res, err);
    }
  },
);

app.get(
  "/classifications/:id",
  async (req: Request, res: Response): Promise<void> => {
    const safeParams = idParamSchema.safeParse(req.params);
    if (!safeParams.success) {
      res.status(400).json({ error: safeParams.error.issues[0].message });
      return;
    }
    const { id } = safeParams.data;

    try {
      const result = await pool.query<Classification>(
        "SELECT id, recipient, classification FROM classifications WHERE id = $1",
        [id],
      );
      if (result.rows.length === 0) {
        res.status(404).json({ error: "Classification not found" });
        return;
      }
      res.json(result.rows[0]);
    } catch (err) {
      handleError(res, err);
    }
  },
);

app.listen(env.APP_PORT, (): void => {
  console.log(`Server running at http://localhost:${env.APP_PORT}`);
});
