// --- グローバル変数（AIから受け取るパラメータ） ---
let params = {
  shapeType: 'circle', // 初期値
  colorPalette: ['#FFFFFF', '#AAAAAA', '#555555'],
  noiseSpeed: 0.01,
  count: 100,
};

const mySystemInstruction = `
  あなたはジェネラティブアートの「構成作家」です。
  ユーザーの入力（単語や感情）から連想されるビジュアル表現を決定してください。

  必ず以下のJSON形式で出力してください。
  {
    "shapeType": "描画する形（'circle', 'rect', 'line' のいずれか）",
    "colorPalette": ["#16進数カラー1", ...],
    "noiseSpeed": 数値,
    "count": 数値,
    "message": "理由"
  }
`;

// ノイズ用のオフセット配列
let offsets = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  initOffsets(); // オフセットの初期化
  setupAIInterface(); // ボタン設定
}

function draw() {
  // 背景を少し残して塗りつぶす（残像効果）
  background(0, 30);

  // 指定された数だけ図形を描画
  for (let i = 0; i < params.count; i++) {
    // 1. 色の決定（パレットからランダムに、または順番に）
    let col = params.colorPalette[i % params.colorPalette.length];
    fill(col);

    // 2. 動きの計算（ノイズを使用）
    // 各図形ごとに異なる場所からノイズを取得
    let x = noise(offsets[i].x) * width;
    let y = noise(offsets[i].y) * height;
    let size = noise(offsets[i].z) * 50 + 10; // 10〜60のサイズ

    // ノイズを進める（AIが決めた速度で！）
    offsets[i].x += params.noiseSpeed;
    offsets[i].y += params.noiseSpeed;
    offsets[i].z += params.noiseSpeed;

    // 3. 形の描画（AIが決めた shapeType で分岐）★重要ポイント
    switch (params.shapeType) {
      case 'circle':
        ellipse(x, y, size, size);
        break;

      case 'rect':
        push();
        translate(x, y);
        rotate(frameCount * params.noiseSpeed); // 回転も加える
        rectMode(CENTER);
        rect(0, 0, size, size);
        pop();
        break;

      case 'line':
        stroke(col);
        strokeWeight(size / 5);
        // 流れるような線を描く
        line(x, y, x + random(-20, 20), y + random(-20, 20));
        noStroke(); // 設定を戻す
        break;

      default:
        // 想定外の値が来た場合は円を描く
        ellipse(x, y, size, size);
    }
  }
}

// 図形ごとのノイズ開始位置をリセットする関数
function initOffsets() {
  offsets = [];
  for (let i = 0; i < 1000; i++) {
    // 最大1000個分確保
    offsets.push({
      x: random(1000),
      y: random(1000),
      z: random(1000),
    });
  }
}

// --- AI連携部分 ---
function setupAIInterface() {
  const btn = document.getElementById('sendButton');
  const input = document.getElementById('promptInput');
  const msgDisplay = document.getElementById('aiMessage');

  btn.addEventListener('click', async () => {
    const text = input.value;
    if (!text) return;

    btn.disabled = true;
    btn.textContent = '生成中...';

    try {
      // Node.jsサーバーにリクエスト
      const response = await fetch('http://localhost:3000/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          systemInstruction: mySystemInstruction, // 定義した指示を渡す
        }),
      });

      const data = await response.json();
      const result = data.result;

      // ★ AIのパラメータを反映
      params = result;

      // パラメータ変更に合わせてリセット
      initOffsets();
      background(0); // 画面クリア

      msgDisplay.textContent = `AIの解釈: ${result.message}`;
      console.log('適用パラメータ:', params);
    } catch (e) {
      console.error(e);
      msgDisplay.textContent = 'エラーが発生しました';
    } finally {
      btn.disabled = false;
      btn.textContent = '生成';
    }
  });
}
