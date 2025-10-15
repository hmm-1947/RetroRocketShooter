import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.post("/rocket-fact", async (req, res) => {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          { parts: [{ text: "Give me a fun fact about rockets." }] }
        ]
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error("Gemini proxy error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch from Gemini" });
  }
});


const PORT = 5000;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
