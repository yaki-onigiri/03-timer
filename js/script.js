// １．DOM取得（HTML要素を取得する処理）
const timeDisplay = document.getElementById("time");

const progressBar = document.getElementById("progressBar");
    // 視覚的にどれくらい進んだかを示すコード②（/23）

const message = document.getElementById("message");
    // 完了時にメッセージ表示（アラート以外）②（/23）

const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const resetButton = document.getElementById("reset");

const minutesInput = document.getElementById("minutes");
const secondsInput = document.getElementById("secondsInput");

const alarmSound = new Audio("./audio/alarm.mp3");

startButton.disabled = true;
stopButton.disabled = true;

// State（状態管理）
const state = {
    remainingSeconds: 0,
    totalSeconds: 0,
    endTime: null,
    timerId: null,
    isRunning: false
};


// UI描画系（時間表示を更新する関数）
function updateDisplay() {

    renderTime();

    renderColor();

    // 視覚的にどれくらい進んだかを示すコード④（/23）
    renderProgress();
}

function renderTime() {

    const minutes = Math.floor(state.remainingSeconds / 60);
    const remainingSeconds = state.remainingSeconds % 60;

    timeDisplay.textContent = 
        String(minutes).padStart(2, "0") + ":" +
        String(remainingSeconds).padStart(2, "0");
}

// 色変更
function renderColor() {

    // 残り時間に応じた UI変化 を追加（/23）
    // 残り1分 → オレンジ
    // 残り10秒 → 赤
    if (state.remainingSeconds <= 10) {
        timeDisplay.style.color = "red";
    } else if (state.remainingSeconds <= 60) {
        timeDisplay.style.color = "orange";
    } else {
        timeDisplay.style.color = "black";
    }

    // タイマー終了時に UI を黒に変化
    if (!state.isRunning) {
        timeDisplay.style.color = "black";
        return;
    }
}

// 視覚的にどれくらい進んだかを示すコード③（/23）
function renderProgress() {
    if (!state.endTime || !state.totalSeconds) return;

    const percent = (1 - state.remainingSeconds / state.totalSeconds) * 100;

    progressBar.style.width = percent + "%";
}

// バリデーション
function validateInput(min, sec) {
    if (!Number.isInteger(min) || !Number.isInteger(sec)) {
        return "整数で入力してください";
    }

    if (min < 0 || min > 99) {
        return "分は0～99で入力してください";
    }

    if (sec < 0 || sec > 59) {
        return "秒は0～59で入力してください";
    }

    if (min === 0 && sec === 0) {
        return "時間を入力してください";
    }

    if (min * 60 + sec > 3600) {
        return "最大60分までです";
    }

    return null;
}

// リアルタイムバリデーション②（入力時点でエラー表示）
function validateRealtime() {
    const min = Number(minutesInput.value);
    const sec = Number(secondsInput.value);

    // 1.未入力チェック
    if (minutesInput.value === "" && secondsInput.value === "") {
        message.textContent = "";
        startButton.disabled = true;
        return;
    }

    // 2.NaNチェック
    if (Number.isNaN(min) || Number.isNaN(sec)) {
        message.textContent = "数値を入力してください";
        startButton.disabled = true;
        return;
    }

    // 3.0秒チェック
    if (min === 0 && sec === 0) {
        message.textContent = "時間を入力してください";
        startButton.disabled = true;
        return;
    }

    const error = validateInput(min, sec);

    message.textContent = error || "";
    startButton.disabled = !!error;
}

// ロジック系（setInterval依存の改善）
function tick() {
    if (!state.isRunning) return;

    countDown();
    if (state.remainingSeconds <= 0) return;
        // カウントダウン00:00 時にカウントダウンが止まる

    state.timerId = setTimeout(tick, 1000);
}

// ４．タイマーを進める処理
function countDown() {

    const diff = state.endTime - Date.now();

    // 精度問題の改善（26/03/21）
    const remaining = Math.ceil(diff / 1000);

    if (diff <= 0) {
        clearTimeout(state.timerId);
        state.timerId = null;

        state.isRunning = false;

        state.endTime = null;

        // タイマー終了時にリセットする
        state.remainingSeconds = 0;
        state.totalSeconds = 0;

        updateDisplay();

        message.textContent = "時間終了！";

        // 終了時のボタン状態を正しく戻すコード
        startButton.disabled = false;
        stopButton.disabled = true;

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
    // remaining = state.endTime - Date.now()

    state.remainingSeconds = remaining;

    // 防御コード『範囲制限』：ズレでマイナス値になるケースを防ぐコード
    if (state.remainingSeconds < 0) state.remainingSeconds = 0;

    updateDisplay();

    // 保存処理
    saveState();
}

// イベント
startButton.addEventListener("click", function () {

    if (state.isRunning) return;

    if (state.endTime === null) {

        if (state.remainingSeconds > 0 && state.remainingSeconds < state.totalSeconds) {
                // ストップ後の再開（Stop → Resume）
                state.totalSeconds = state.remainingSeconds;

        } else if (state.totalSeconds > 0) {
            // 終了後、もしくはすでに設定済み
            state.remainingSeconds = state.totalSeconds;

        } else {
            // 新規スタート
            const min = Number(minutesInput.value);
            const sec = Number(secondsInput.value);

            // NaN対策
            if (Number.isNaN(min) || Number.isNaN(sec)) {
                message.textContent = "数値を入力してください";
                return;
            }

            const error = validateInput(min, sec);

            if (error) {
                message.textContent = error;
                return;
            }

            state.totalSeconds = min * 60 + sec;
            state.remainingSeconds = state.totalSeconds;
        }

        // 音リセットのためのコード
        alarmSound.pause();
        alarmSound.currentTime = 0;

        state.endTime = Date.now() + state.totalSeconds * 1000;
    }

    updateDisplay();

    state.isRunning = true;

    tick();
    
    startButton.disabled = true;
    stopButton.disabled = false;

    startButton.textContent = "Start";
        // ボタン切り替え①（/23）

    // 入力欄のロック (/18 ②)
    minutesInput.disabled = true;
    secondsInput.disabled = true;

    // 保存処理
    saveState();
});

document.addEventListener("keydown", function(e) {
    if (e.key === "Enter" && !startButton.disabled) {
        startButton.click();
    }
});

// ６．ストップ処理
stopButton.addEventListener("click", function () {

    clearTimeout(state.timerId);
    state.timerId = null;

    state.isRunning = false;

    // 精度問題の改善（26/03/21）
    const remaining = Math.floor((state.endTime - Date.now()) / 1000);
    state.remainingSeconds = remaining > 0 ? remaining : 0;

    state.endTime = null;
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
    clearTimeout(state.timerId);
    state.timerId = null;

    state.isRunning = false;

    // 「時間基準」を完全破棄するためのコード
    state.endTime = null;

    // 表示リセット用
    state.remainingSeconds = 0;

    minutesInput.value = "";
    secondsInput.value = "";
        // Reset時に入力欄もクリアする処理(/18)

    updateDisplay();

    message.textContent = "";

    startButton.disabled = false;
    stopButton.disabled = true;

    startButton.textContent = "Start";
        // ボタン切り替え①（/23）

    // 入力欄のロック解除 (/18 ②)
    minutesInput.disabled = false;
    secondsInput.disabled = false;

    // 
    localStorage.removeItem("timerState");
});

// リアルタイムバリデーション①（入力時点でエラー表示）
minutesInput.addEventListener("input", validateRealtime);
secondsInput.addEventListener("input", validateRealtime);


// 保存処理
function saveState() {
    const data = {
        // 精度問題の改善（/21）
        endTime: state.endTime,

        isRunning: state.isRunning,
        minutesInput: minutesInput.value,
        secondsInput: secondsInput.value
    };

    localStorage.setItem("timerState", JSON.stringify(data));
}

// 復元処理（ページ読み込み時の読み込み処理）
function loadState(){
    const saved = localStorage.getItem("timerState");

    if (!saved) return;

    // 例外処理の構文：プログラム実行中に発生するエラーを補足し、異常終了を防ぐ
    try {
        const data = JSON.parse(saved);

        // 精度問題の改善（/21）
        state.endTime = data.endTime || null;

        minutesInput.value = data.minutesInput || "";
        secondsInput.value = data.secondsInput || "";

        // 精度問題の改善（/21）
        if (state.endTime) {
            const remaining = Math.floor((state.endTime - Date.now()) / 1000);
            state.remainingSeconds = remaining > 0 ? remaining : 0;
        }
        
        updateDisplay();

        // タイマー復元処理
        if (data.isRunning && state.remainingSeconds > 0) {
            state.isRunning = true;
            
            tick();

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