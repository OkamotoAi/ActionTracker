import express from "express";
import session from "express-session";
import bcrypt from "bcrypt";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import cors from "cors";

type Action = {
  action_id: number;
  user_id: number;
  start: string;
  end: string;
  category: string;
};

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = ["http://localhost:3000"];
const options: cors.CorsOptions = {
  origin: allowedOrigins,
};

app.use(cors(options));

// MySQL 接続設定
let db: mysql.Pool;
(async () => {
  db = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
})();

app.use(express.json());
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

// 行動記録の取得
app.get("/actions", async (req, res) => {
  const date = req.query.date;
  const query = date
    ? "SELECT * FROM action WHERE user_id = ? AND DATE(start) = ?"
    : "SELECT * FROM action WHERE user_id = ?";

  const params = date ? [1, date] : [1];
  const [actionData] = await db.execute(query, params);

  res.json(actionData);
});

// 行動記録の追加
app.post("/actions", async (req, res) => {
  console.log(req.body);
  const { start, end, category } = req.body;

  const query =
    end == ""
      ? "INSERT INTO action (user_id, start, category) VALUES (?, ?, ?)"
      : "";
  const args = end == "" ? [1, start, category] : [1, start, end, category];
  try {
    await db.execute(query, args);
    res.status(201).json({ message: "Action recorded" });
  } catch (error) {
    res.status(500).json({ error: "Failed to record action" });
    console.log("error");
  }
});

app.put("/actions/:id", async (req, res) => {
  // たぶん存在しないＩＤにPＵＴされるとやばい
  console.log(req);
  const { id } = req.params;
  const { userid, start, end, category } = req.body;
  const formattedStart = new Date(start)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  const formattedEnd = new Date(end)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  try {
    const [result] = await db.query(
      "UPDATE action SET user_id = ?, start = ?, end = ?, category = ? WHERE action_id = ?",
      [1, formattedStart, formattedEnd, category, id]
    );
    res.json({ message: "Action updated successfully" });
  } catch (error) {
    console.error("Error updating action:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/actions/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query("DELETE FROM action WHERE action_id = ?", [
      id,
    ]);
    res.json({ message: "Action deleted successfully" });
  } catch (error) {
    console.error("Error deleting action:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
