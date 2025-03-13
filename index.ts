import express from "express";
import session from "express-session";
import bcrypt from "bcrypt";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

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

// ユーザー登録
// app.post("/register", async (req, res) => {
//   const { email, password } = req.body;
//   const hashedPassword = await bcrypt.hash(password, 10);

//   try {
//     await db.execute("INSERT INTO user (email, password) VALUES (?, ?)", [
//       email,
//       hashedPassword,
//     ]);
//     res.status(201).json({ message: "User registered" });
//   } catch (error) {
//     res.status(500).json({ error: "Registration failed" });
//   }
// });

// ログイン
// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;
//   const [rows] = await db.execute("SELECT * FROM user WHERE email = ?", [
//     email,
//   ]);

//   if (rows.length === 0)
//     return res.status(401).json({ error: "Invalid credentials" });

//   const user = rows[0];
//   // const isMatch = await bcrypt.compare(password, user.password);
//   const isMatch = password === user.password;
//   if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

//   req.session.userId = user.id;
//   res.json({ message: "Login successful" });
// });

// 行動記録の取得
app.get("/actions", async (req, res) => {
  // if (!req.session.userId)
  //   return res.status(401).json({ error: "Unauthorized" });

  const date = req.query.date;
  const query = date
    ? "SELECT * FROM action WHERE user_id = ? AND DATE(start) = ?"
    : "SELECT * FROM action WHERE user_id = ?";

  // const params = date ? [req.session.userId, date] : [req.session.userId];
  const params = date ? [1, date] : [1];
  const [actionData] = await db.execute(query, params);

  res.json(actionData);
});

// 行動記録の追加
app.post("/actions", async (req, res) => {
  // if (!req.session.userId)
  //   return res.status(401).json({ error: "Unauthorized" });

  const { start, end, category } = req.body;
  try {
    await db.execute(
      "INSERT INTO action (user_id, start, end, category) VALUES (?, ?, ?, ?)",
      // [req.session.userId, start, end, category]
      [1, start, end, category]
    );
    res.status(201).json({ message: "Action recorded" });
  } catch (error) {
    res.status(500).json({ error: "Failed to record action" });
  }
});

// 行動記録の更新
// app.put('/actions/:id', async (req, res) => {
//   if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });

//   const { start, end, category } = req.body;
//   const { id } = req.params;
//   try {
//     await db.execute(
//       'UPDATE action SET start = ?, end = ?, category = ? WHERE action_id = ? AND user_id = ?',
//       [start, end, category, id, req.session.userId]
//     );
//     res.json({ message: 'Action updated' });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to update action' });
//   }
// });

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
