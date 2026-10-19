import "dotenv/config";
import pg from "pg";

export const pool = new pg.Pool({
  host: "localhost",
  port: Number(process.env.DB_PORT),
  database: process.env.BANK_DB,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});
