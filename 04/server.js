// 先生から教えられた、テスト用のサーバーURL
const analyzeUrl = 'http://160.251.173.137:3000/api/analyze'; // ポート番号は先生に確認

const analyzeButton = document.getElementById('analyzeButton');
const inputText = document.getElementById('inputText');

analyzeButton.addEventListener('click', async () => {
  const question = inputText.value;
  if (!question) return; // 入力が空なら処理しない

  // ボタンを一時的に無効化（連打防止）
  analyzeButton.disabled = true;
  analyzeButton.textContent = '思考中...';

  try {
    // サーバーに分析したいテキストを送信
    const response = await fetch(analyzeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: question }), // サーバーに送るデータ
    });

    // サーバー（AI）からの分析結果を受け取る
    // 例: { analysis: "テーマ1: ..., テーマ2: ..." }
    const data = await response.json();

    // 受け取った分析結果（data.result）を画面に表示したり、
    // D3.jsのグラフ更新関数に渡すなどの処理を行う
    console.log('AIの回答:', data.result);
    // updateChart(processedData); // ← D3.jsの更新関数を呼び出す（次のステップ）
  } catch (error) {
    console.error('AIへの質問エラー:', error);
    // エラーメッセージをユーザーに表示する処理など
  } finally {
    // ボタンを再度有効化
    analyzeButton.disabled = false;
    analyzeButton.textContent = 'AIに質問する';
  }
});
