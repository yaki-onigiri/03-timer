# 学習メモ

## 2026/03/17

### タイマー機能（カウントアップ）の実装

具体的な方法

// HTML要素の取得
const timeDisplay = document.getElementById("time");
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const resetButton = document.getElementById("reset");

// 変数
let seconds = 0;
let timer = null;

// 表示更新
function updateDisplay() {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    timeDisplay.textContent =
        String(minutes).padStart(2, "0") + ":" +
        String(remainingSeconds).padStart(2, "0");
}

// カウント処理
function countUp() {
    seconds++;
    updateDisplay();
}

// スタート
startButton.addEventListener("click", function () {
    if (timer !== null) return;
    timer = setInterval(countUp, 1000);
});

// ストップ
stopButton.addEventListener("click", function () {
    clearInterval(timer);
    timer = null;
});

// リセット
resetButton.addEventListener("click", function () {
    clearInterval(timer);
    timer = null;
    seconds = 0;
    updateDisplay();
});

使用したコード
    ・document.getElementById()
        → HTMLの要素をJavaScriptで操作するために取得

    ・addEventListener("click", ...)
        → ボタンがクリックされたときの処理を設定

    ・setInterval()
        → 一定時間ごとに処理を繰り返す（今回は1秒ごと）

    ・clearInterval()
        → 繰り返し処理を止める

    ・Math.floor()
        → 小数点以下を切り捨てて「分」を計算

    ・%（余り）
        → 秒を求めるために使用

    ・padStart()
        → 表示を2桁（例：01）にそろえる

ポイント
    ・秒数はそのまま表示するのではなく、計算して「分」と「秒」に分けている

    ・updateDisplay() という関数で表示の更新をまとめている（まだ完全には理解できていないが重要そう）

    ・setInterval() を使うと自動で処理が繰り返される

    ・timer という変数を使って、タイマーが動いているかどうかを管理している

    ・スペルミス（String や padStart）でエラーになった→ JavaScriptは大文字・小文字を区別する

    ・エラーが出たときはF12 → Consoleで確認することが重要
