import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import { connectDB } from "./config/db";

const app = express();
const PORT = process.env.PORT || 4242;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});