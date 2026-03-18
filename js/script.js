// １．HTML要素を取得する処理
const timeDisplay = document.getElementById("time");

const StartButton = document.getElementById("start");
const StopButton = document.getElementById("stop");
const ResetButton = document.getElementById("reset");

const minutesInput = document.getElementById("minutes");
const secondsInput = document.getElementById("secondsInput");

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

    if (seconds <= 0) {
        clearInterval(timer);
        timer = null;
        return;
    }

    seconds--;

    updateDisplay();
}

// ５．スタートの処理
StartButton.addEventListener("click", function () {

    if (timer !== null) return;

    if (seconds === 0) {
        const min = Number(minutesInput.value) || 0;
        const sec = Number(secondsInput.value) || 0;

        seconds = min * 60 + sec;
    }

    updateDisplay();

    timer = setInterval(countDown, 1000);
        // setInterval = 指定時間ごとに処理を繰り返すコード
});

// ６．ストップ処理
StopButton.addEventListener("click", function () {

    clearInterval(timer);

    timer = null;

});

// ７．リセット処理
ResetButton.addEventListener("click", function () {

    clearInterval(timer);
    timer = null;

    seconds = 0;

    minutesInput.value = "";
    secondsInput.value = "";
        // Reset時に入力欄もクリアする処理(/18)

    updateDisplay();

});