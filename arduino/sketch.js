let port;
let connectBtn;
let player;
let sensorValue = 0;
let easedValue = 0; // Lerpで滑らかにした値を保持
let ease = 0.1; // 追従の速さ（0.01〜0.1程度で調整）

function setup() {
  new Canvas(400, 400);

  port = createSerial();
  connectBtn = createButton('Connect to Arduino');
  connectBtn.mousePressed(connectBtnClick);

  player = new Sprite();
  player.width = 50;
  player.height = 50;
  player.color = 'blue';

  // --- ★物理演算のパラメータ ---
  player.maxSpeed = 15; // 速度の限界を決めておく（跳ね上がり対策）
  player.drag = 5; // 適度な空気抵抗
}

function draw() {
  background(240);

  let str = port.readUntil('\n');
  if (str.length > 0) {
    let rawValue = parseInt(str.trim());
    if (!isNaN(rawValue)) {
      sensorValue = rawValue;
    }
  }

  // --- 1. Lerpによる平滑化 ---
  // 生のsensorValueに向かって、easedValueを少しずつ近づける
  // 計算式: $V_{next} = V_{current} + (V_{target} - V_{current}) \times \text{ease}$
  easedValue = lerp(easedValue, sensorValue, ease);

  // --- 2. ターゲット座標の計算 ---
  let targetX = map(easedValue, 0, 650, 0, width);

  // --- 3. 物理的な引き寄せ ---
  player.moveTowards(targetX, player.y, 0.1);

  // デバッグ表示
  fill(0);
  noStroke();
  text(`Raw: ${sensorValue} | Eased: ${nfc(easedValue, 1)}`, 10, height - 20);
}

function connectBtnClick() {
  if (connectBtn.html() != 'Disconnect') {
    port.open('Arduino', 9600);
    connectBtn.html('Disconnect');
    //connectBtn.hide();
  } else {
    port.close();
    connectBtn.html('Connect to Arduino');
  }
}
