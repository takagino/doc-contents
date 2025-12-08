// server.js

import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.listen(port, () => {
  console.log(`サーバーがポート ${port} で起動しました`);
});

// プロンプトを作成する関数
const prompt = (userPrompt, userInstruction) => {
  return {
    model: 'gemini-2.5-flash-lite',
    config: {
      responseMimeType: 'application/json',
      temperature: 1.0,
      systemInstruction: userInstruction,
    },
    contents: userPrompt,
  };
};

app.post('/api/gemini', async (req, res) => {
  const userPrompt = req.body.prompt;
  const userInstruction =
    req.body.instruction || 'あなたは親切なアシスタントです。';

  if (!userPrompt) {
    return res.status(400).json({ error: '単語を入力してください' });
  }

  try {
    // 変更
    const result = await genai.models.generateContent(
      prompt(userPrompt, userInstruction)
    );

    const responseText = result.text;
    console.log('AIの応答:', responseText);

    const jsonResponse = JSON.parse(responseText);
    res.json({ result: jsonResponse });
  } catch (error) {
    console.error('エラー:', error);
    res.status(500).json({ error: 'AIエラー' });
  }
});
