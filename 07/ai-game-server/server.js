import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const port = 3000;
const app = express();
app.use(cors());
app.use(express.json());

app.listen(port, () => {
  console.log(`サーバーがポート ${port} で起動しました`);
});

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/gemini', async (req, res) => {
  const userPrompt = req.body.prompt;

  if (!userPrompt) {
    return res.status(400).json({ error: 'プロンプトが必要です' });
  }

  try {
    const result = await genai.models.generateContent(setting(userPrompt));

    console.log(result.text);
    const jsonResponse = JSON.parse(result.text);

    res.json({ result: jsonResponse });
  } catch (error) {
    console.error(error);
  }
});

const setting = (userPrompt) => ({
  model: 'gemini-2.5-flash-lite',
  config: {
    responseMimeType: 'application/json',
    thinkingConfig: {
      thinkingBudget: 0,
    },
    systemInstruction: `
          あなたはゲームマスターです。
          ユーザーの入力に基づいて、ゲームの難易度設定をJSON形式で出力してください。
          数値は以下の範囲で設定してください。
          - gravity (重力): 0 〜 20 (通常は10)
          - enemySpeed (敵の速さ): 2 〜 10 (通常は5)
          - message (AIからのコメント): 日本語で短く
        `,
  },
  contents: [
    {
      role: 'user',
      parts: [
        {
          text: userPrompt,
        },
      ],
    },
  ],
});
