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
const prompt = (userPrompt) => {
  return {
    model: 'gemini-2.5-flash-lite',
    config: {
      responseMimeType: 'application/json',
      temperature: 1.0,
      systemInstruction: `
          あなたは2Dアクションゲームの「ゲームマスター」です。
          ユーザーの入力（テーマや雰囲気）に基づいて、ゲームの難易度や物理挙動を調整してください。

          必ず以下のJSON形式で出力してください。
          {
            "gravity": 数値 (0〜20, デフォルト10, 低いとふわふわ、高いと重い),
            "enemySpeed": 数値 (2〜15, デフォルト5, 敵が左に進む速さ),
            "jumpForce": 数値 (5〜15, デフォルト8, プレイヤーのジャンプ力),
            "message": "ユーザーへの短いメッセージ（日本語）"
          }
        `,
    },
    contents: userPrompt,
  };
};

app.post('/api/gemini', async (req, res) => {
  const userPrompt = req.body.prompt;

  if (!userPrompt) {
    return res.status(400).json({ error: '単語を入力してください' });
  }

  try {
    const result = await genai.models.generateContent(prompt(userPrompt));

    const responseText = result.text;
    console.log('AIの応答:', responseText);

    const jsonResponse = JSON.parse(responseText);
    res.json({ result: jsonResponse });
  } catch (error) {
    console.error('エラー:', error);
    res.status(500).json({ error: 'AIエラー' });
  }
});
