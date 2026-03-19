// １．HTML要素を取得する処理
const timeDisplay = document.getElementById("time");

const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const resetButton = document.getElementById("reset");

const minutesInput = document.getElementById("minutes");
const secondsInput = document.getElementById("secondsInput");

const alarmSound = new Audio("./audio/alarm.mp3");

// ２．タイマー用の変数
let seconds = 0;
let timer = null;

// ３．時間表示を更新する関数
function updateDisplay() {

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    timeDisplay.textContent = 
        String(minutes).padStart(2, "0") + ":" +
        String(remainingSeconds).padStart(2, "0");
}

// ４．タイマーを進める処理
function countDown() {

    if (seconds === 0) {
        clearInterval(timer);
        timer = null;

        alarmSound.play().catch(error => {
            console.log("再生エラー：", error);
        });

        alert("時間終了！");

        saveState();

        return;
    }

    seconds--;

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

    if (seconds === 0) {
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
        // Start時0秒スタートを防ぐためのコード

        seconds = min * 60 + sec;
    }

    updateDisplay();

    timer = setInterval(countDown, 1000);
        // setInterval = 指定時間ごとに処理を繰り返すコード
    
    startButton.disabled = true;
    stopButton.disabled = false;

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

    startButton.disabled = false;
    stopButton.disabled = true;

    // 保存処理
    saveState();
});

// ７．リセット処理
resetButton.addEventListener("click", function () {

    clearInterval(timer);
    timer = null;

    seconds = 0;

    minutesInput.value = "";
    secondsInput.value = "";
        // Reset時に入力欄もクリアする処理(/18)

    updateDisplay();

    startButton.disabled = false;
    stopButton.disabled = true;

    // 入力欄のロック解除 (/18 ②)
    minutesInput.disabled = false;
    secondsInput.disabled = false;

    // 
    localStorage.removeItem("timerState");
});

// 保存処理
function saveState() {
    const data = {
        seconds: seconds,
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

    let data;

    // 例外処理の構文：プログラム実行中に発生するエラーを補足し、異常終了を防ぐ
    try {
        data = JSON.parse(saved);

        seconds = data.seconds || 0;

        minutesInput.value = data.minutesInput || "";
        secondsInput.value = data.secondsInput || "";

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