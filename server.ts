import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Supports large transcripts
  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini client on the server side
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API endpoint for meeting notes summarization and translation
  app.post("/api/generate", async (req, res) => {
    try {
      const { prompt, systemInstruction } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "請輸入或貼上會議內容！" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "未偵測到 GEMINI_API_KEY 環境變數，請在系統設定或秘密主機中配置金鑰。" });
      }

      // Request text generation with the custom instructions
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || "你是一個專業的會議助理。請幫忙分析、重點總結、並將會議內容翻譯為繁體中文，並為使用者產出清晰且具有結構性的 Markdown 報告。",
          temperature: 0.3,
        },
      });

      res.json({ text: response.text });
    } catch (err: any) {
      console.error("Gemini API server-side proxy error:", err);
      res.status(500).json({ error: err.message || "處理會議記錄時，後端 AI 處理遇到錯誤。" });
    }
  });

  // Setup Vite middleware for development, static assets for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
