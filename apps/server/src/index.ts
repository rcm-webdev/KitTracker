import "dotenv/config";
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import binsRouter from "./routes/bins";
import itemsRouter from "./routes/items";
import searchRouter from "./routes/search";
import adminRouter from "./routes/admin";

const app = express();
const PORT = process.env.PORT ?? 3001;

// Better Auth handles its own body parsing — mount BEFORE express.json()
app.all("/api/auth/*", toNodeHandler(auth));

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/bins", binsRouter);
app.use("/api/bins", itemsRouter);   // POST /api/bins/:id/items
app.use("/api/items", itemsRouter);  // PUT/DELETE /api/items/:id
app.use("/api/search", searchRouter);
app.use("/api/admin", adminRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}. You better catch it!`);
});

export { app };
