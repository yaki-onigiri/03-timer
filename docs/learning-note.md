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

## 2026/03/18

### タイマー機能（カウントダウン・入力機能）の実装

具体的な方法
// 入力欄の取得
const minutesInput = document.getElementById("minutes");
const secondsInput = document.getElementById("secondsInput");

// カウントダウン処理
function countDown() {
    if (seconds <= 0){
        clearInterval(timer);
        timer = null;
        return;
    }

    seconds--;
    updateDisplay();
}

// スタート処理（修正）
startButton.addEventListener("click", function() {
    if (timer !== null) return;

    // 初回のみ入力値を反映
    if (seconds === 0) {
        const min = Number(minutesInput.value) || 0;
        const sec = Number(secondsInput.value) || 0;

        seconds = min * 60 + sec;
    }

    updateDisplay();
    timer = setInterval(countDown, 1000);
});

使用したコード

・document.getElementById()
    →入力欄（分・秒）を取得するために使用

・Number()
    →入力された値(文字列)を数値に変換するために使用

・if文
    →条件によって処理を分けるために使用

    if文の基本パターン（今後使う）
        ① 単純分岐
            if (条件) {
                処理
            }

       ② それ以外も処理する
            if (条件) {
                処理A
            } else {
                処理B  
            }

        ③ 複数条件
            if (条件A) {
                処理A
            } else if (条件B) {
                処理B
            }
    (条件)に入る文字
    ・「seconds === 0」 → true（成立） → 初期化する
    ・「seconds !== 0」 → false（不成立） → 何もしない

ポイント

    ・分・秒で入力された値を「秒」に変換して扱っている
        （例：1分30秒 → 90秒）

    ・タイマー内部では「seconds（秒）」で状態を管理している

    ・if (seconds === 0) によって、最初の1回だけ入力値を反映するようにしている
        → Stop後にStartしてもリセットされず、途中から再開できる

    ・countUp → countDown に変更することで、カウントダウン処理に切り替えた

    ・関数名のスペルミス（countUp / countDown）でエラーが発生した
        → Consoleのエラー文を確認することが重要

### タイマー機能（アラーム音追加・動作不具合の修正）

目的
・時間終了時にアラーム音を鳴らす
・音が鳴らない原因を特定し、正しく動作させる

仕組み

    ①タイマー終了を検知
        → seconds <= 0 で判定
    
    ②タイマー停止
        → clearInterval()
    
    ③アラーム音を再生
        → Audioオブジェクトを使用

実装コード（要点のみ）

```js```
const alarm = new Audio(（フォルダ名）/alarm.mp3);

function countDown() {
    if (seconds <= 0){
        clearInterval(timer);
        timer = null;

        alarm.play(); // アラーム再生
        return;
    }

    seconds--;
    updateDisplay();
}

使用技術
・Audio()
    → 音声ファイルを読み込み、再生する

・play()
    → 音声を再生するメソッド

・clearInterval()
    → タイマーを停止

重要ポイント

・音声ファイルのパスは「正確」である必要がある
    → 1文字でも違うと404エラーになる

・GitHubにファイルが存在しないと読み込めない

・ブラウザは自動再生を制限している
    → ユーザー操作（クリックなど）が必要

学んだこと
・「動かない＝コード」ではなく
　→ ファイル構成・パス・GitHubも確認する

・Consoleエラーは必ず確認する

・ローカルで動いても、本番環境では動かない場合がある
