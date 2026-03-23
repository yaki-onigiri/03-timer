// １．HTML要素を取得する処理
const timeDisplay = document.getElementById("time");

const progressBar = document.getElementById("progressBar")
    // 視覚的にどれくらい進んだかを示すコード②（/23）

const message = document.getElementById("message");
    // 完了時にメッセージ表示（アラート以外）②（/23）

const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const resetButton = document.getElementById("reset");

const minutesInput = document.getElementById("minutes");
const secondsInput = document.getElementById("secondsInput");

const alarmSound = new Audio("./audio/alarm.mp3");

// ２．タイマー用の変数
let seconds = 0;
let timer = null;

// 精度問題の改善（26/03/21）
let endTime = null;

let totalSeconds;

// ３．時間表示を更新する関数
function updateDisplay() {

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    timeDisplay.textContent = 
        String(minutes).padStart(2, "0") + ":" +
        String(remainingSeconds).padStart(2, "0");

    // 残り時間に応じた UI変化 を追加（/23）
    // 残り1分 → オレンジ
    // 残り10秒 → 赤
    if (seconds <= 10) {
        timeDisplay.style.color = "red";
    } else if (seconds <= 60) {
        timeDisplay.style.color = "orange";
    } else {
        timeDisplay.style.color = "black";
    }

    // 視覚的にどれくらい進んだかを示すコード④（/23）
    updateProgress();
}

// 視覚的にどれくらい進んだかを示すコード③（/23）
function updateProgress() {
    if (!endTime || !totalSeconds) return;

    const remaining = seconds;
    const percent = (1 - remaining / totalSeconds) * 100;

    progressBar.style.width = percent + "%";
}

// ４．タイマーを進める処理
function countDown() {

    const diff = endTime - Date.now();

    // 精度問題の改善（26/03/21）
    const remaining = Math.ceil(diff / 1000);

    console.log("remaining:", remaining);

    if (diff <= 0) {
        clearInterval(timer);
        timer = null;

        seconds = 0;
        updateDisplay();

        message.textContent = "";

        alarmSound.play().catch(error => {
            console.log("再生エラー：", error);
        });

        setTimeout(() => {
            console.log("時間終了！");
        }, 0);

        saveState();

        return;
    }

    // 精度問題の改善（26/03/21）
    // remaining = endTime - Date.now()

    seconds = remaining;

    // 防御コード『範囲制限』：ズレでマイナス値になるケースを防ぐコード
    if (seconds < 0) seconds = 0;

    updateDisplay();

    // 保存処理
    saveState();
}

// ５．スタートの処理
startButton.addEventListener("click", function () {

    if (timer !== null) return;

    alarmSound.play().then(() => {
        alarmSound.pause();
        alarmSound.currentTime = 0;
    }).catch(() => {});

    if (endTime === null) {

        if (seconds > 0) {
                // ストップ後の再開
                totalSeconds = seconds;
        } else {
            // 新規スタート
            const min = Number(minutesInput.value) || 0;
            const sec = Number(secondsInput.value) || 0;
                
            if (sec < 0 || sec > 59) {
                alert("秒は0～59で入力してください");
                return;
            }
            //「 if (sec < 0 || sec > 59) 」と入力することでマイナス値の入力を防ぐこともできる。(/18 ②)

            if (min === 0 && sec === 0) {
                alert("時間を入力してください");
                return;
            }

            totalSeconds = min * 60 + sec;
        }

        endTime = Date.now() + totalSeconds * 1000;

    }

    // Start時に表示だけ先に作る（26/03/21）
    seconds = totalSeconds;

    updateDisplay();

    timer = setInterval(countDown, 1000);
    // setInterval = 指定時間ごとに処理を繰り返すコード
    
    startButton.disabled = true;
    stopButton.disabled = false;

    startButton.textContent = "Start";
        // ボタン切り替え①（/23）

    // 入力欄のロック (/18 ②)
    minutesInput.disabled = true;
    secondsInput.disabled = true;
    
    alarmSound.load();

    // 保存処理
    saveState();
});

// ６．ストップ処理
stopButton.addEventListener("click", function () {

    clearInterval(timer);
    timer = null;

    // 精度問題の改善（26/03/21）
    const remaining = Math.floor((endTime - Date.now()) / 1000);
    seconds = remaining > 0 ? remaining : 0;

    endTime = null;
    // （26/03/21）ここまで

    startButton.disabled = false;
    stopButton.disabled = true;

    startButton.textContent = "Resume";
        // ボタン切り替え②（/23）

    // 保存処理
    saveState();
});

// ７．リセット処理
resetButton.addEventListener("click", function () {

    // 実行中の処理停止
    clearInterval(timer);
    timer = null;

    // 「時間基準」を完全破棄するためのコード
    endTime = null;

    // 表示リセット用
    seconds = 0;

    minutesInput.value = "";
    secondsInput.value = "";
        // Reset時に入力欄もクリアする処理(/18)

    updateDisplay();

    startButton.disabled = false;
    stopButton.disabled = true;

    startButton.textContent = "Pause";
        // ボタン切り替え①（/23）

    // 入力欄のロック解除 (/18 ②)
    minutesInput.disabled = false;
    secondsInput.disabled = false;

    // 
    localStorage.removeItem("timerState");
});

// 保存処理
function saveState() {
    const data = {
        // 精度問題の改善（/21）
        endTime: endTime,

        isRunning: timer !== null,
        minutesInput: minutesInput.value,
        secondsInput: secondsInput.value
    };

    localStorage.setItem("timerState", JSON.stringify(data));
}

// ページ読み込み時の読み込み処理
function loadState(){
    const saved = localStorage.getItem("timerState");

    if (!saved) return;

    // 例外処理の構文：プログラム実行中に発生するエラーを補足し、異常終了を防ぐ
    try {
        const data = JSON.parse(saved);

        // 精度問題の改善（/21）
        endTime = data.endTime || null;

        minutesInput.value = data.minutesInput || "";
        secondsInput.value = data.secondsInput || "";

        // 精度問題の改善（/21）
        if (endTime) {
            const remaining = Math.floor((endTime - Date.now()) / 1000);
            seconds = remaining > 0 ? remaining : 0;
        }
        
        updateDisplay();

        // タイマー復元処理
        if (data.isRunning && seconds > 0) {
            timer = setInterval(countDown, 1000);

            startButton.disabled = true;
            stopButton.disabled = false;

            minutesInput.disabled = true;
            secondsInput.disabled = true;
        }

    } catch (e) {
        console.error("データ破損:", e);
        localStorage.removeItem("timerState");
    }    
}

// ページ読み込み時に実行
loadState();