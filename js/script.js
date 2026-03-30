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

// 状態管理（State）
const state = {
    remainingSeconds: 0,
    totalSeconds: 0,
    endTime: null,
    timerId: null,
    isRunning: false
};


// ３．時間表示を更新する関数
function updateDisplay() {

    renderTime();

    renderColor();

    // 視覚的にどれくらい進んだかを示すコード④（/23）
    renderProgress();
}

// 時間表示
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
}

// 視覚的にどれくらい進んだかを示すコード③（/23）
function renderProgress() {
    if (!state.endTime || !state.totalSeconds) return;

    const percent = (1 - state.remainingSeconds / state.totalSeconds) * 100;

    progressBar.style.width = percent + "%";
}

// setInterval依存の改善
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

    console.log("remaining:", remaining);

    if (diff <= 0) {
        clearTimeout(state.timerId);
        state.timerId = null;

        state.isRunning = false;

        state.remainingSeconds = 0;
        updateDisplay();

        message.textContent = "時間終了！";

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

// ５．スタートの処理
startButton.addEventListener("click", function () {

    if (state.timerId !== null) return;

    alarmSound.play().then(() => {
        alarmSound.pause();
        alarmSound.currentTime = 0;
    }).catch(() => {});

    if (state.endTime === null) {

        if (state.remainingSeconds > 0) {
                // ストップ後の再開
                state.totalSeconds = state.remainingSeconds;
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

            state.totalSeconds = min * 60 + sec;
            state.remainingSeconds = state.totalSeconds;
        }

        state.endTime = Date.now() + state.totalSeconds * 1000;

    }

    // Start時に表示だけ先に作る（26/03/21）
    state.remainingSeconds = state.totalSeconds;

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
    
    alarmSound.load();

    // 保存処理
    saveState();
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
        endTime: state.endTime,

        isRunning: state.isRunning,
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