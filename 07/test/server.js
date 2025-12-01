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
      あなたは博識な名言ソムリエです。
      ユーザーから送られた「単語」に関連する、偉人や有名人の名言を1つ選んでください。

      必ず以下のJSON形式で出力してください。
      {
        "result": "名言の原文（英語または日本語）",
        "quote": "日本語訳（原文が日本語の場合はそのまま）"
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
    // 変更
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
