import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";

const app = express();
const PORT = process.env.PORT || 4242;

app.use(cors());
app.use(express.json());

connectDB();

app.get("/health", (_req, res) => {
  res.json({ message: "Server running" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});