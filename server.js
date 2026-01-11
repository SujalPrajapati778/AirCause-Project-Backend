import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatHandler from "./api/chat.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json()); // REQUIRED

app.post("/api/chat", chatHandler);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
