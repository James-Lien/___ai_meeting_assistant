import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

// Helper for Gemini generation
async function generateGemini(prompt: string, systemInstruction?: string) {
  const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { headers: { 'User-Agent': 'vercel-function' } },
  });
  const response = await genAI.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: prompt,
    config: {
      systemInstruction: systemInstruction ||
        '你是一個專業的會議助理，請分析、總結並翻譯為繁體中文，輸出結構化 Markdown。',
      temperature: 0.3,
    },
  });
  return response.text;
}

// Helper for NVIDIA generation via their REST API
async function generateNvidia(prompt: string, systemInstruction?: string) {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    throw new Error('NVIDIA_API_KEY is not set');
  }
  const payload = {
    model: 'nvidia/nemotron-mini-4b-instruct',
    messages: [
      { role: 'system', content: systemInstruction || 'You are a professional meeting assistant. Summarize and translate to Traditional Chinese in Markdown format.' },
      { role: 'user', content: prompt },
    ],
    max_tokens: 1024,
    temperature: 0.3,
  };
  const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`NVIDIA API error ${res.status}: ${err}`);
  }
  const data = await res.json();
  // NVIDIA returns { choices: [{ message: { content: string } }] }
  const text = data?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('NVIDIA response missing text');
  }
  return text;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt, systemInstruction, provider } = req.body as {
    prompt: string;
    systemInstruction?: string;
    provider?: 'gemini' | 'nvidia';
  };

  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  const selectedProvider = provider ?? 'gemini';
  try {
    let text: string;
    if (selectedProvider === 'gemini') {
      text = await generateGemini(prompt, systemInstruction);
    } else if (selectedProvider === 'nvidia') {
      text = await generateNvidia(prompt, systemInstruction);
    } else {
      return res.status(400).json({ error: `Unsupported provider: ${selectedProvider}` });
    }
    return res.status(200).json({ text });
  } catch (err: any) {
    console.error('AI generation error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
