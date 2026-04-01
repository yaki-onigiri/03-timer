# 学習メモ

## 2026/03/17

### タイマー機能（カウントアップ）の実装

▼ 結論（これだけ覚える）
    ・秒（seconds）を状態として持つ
    ・setInterval で1秒ごとに更新
    ・表示は別関数で管理

▼ 処理の流れ

1. seconds を1ずつ増やす

2. updateDisplay で表示を更新

3. setInterval で繰り返す

▼ 重要な設計
    ・表示処理は updateDisplay() に分離する
        → ロジック と UI を分けるため

▼学び
    ・setInterval は「自動ループ」
    ・timer変数で「動いているか」を管理する
    ・JSは大文字・小文字を区別（ミスでエラーになる）

## 2026/03/18

### カウントダウン・入力機能

▼結論
    ・入力値（分・秒）は「秒」に変換して管理する
    ・状態は seconds に一本化

▼重要ロジック
    seconds = min * 60 + sec;

▼設計ポイント
    ・if (seconds === 0)
        → 初回のみ入力値を反映するため

    ・Stop後に再開できる理由
        → seconds を保持しているから

▼バグ
    ・関数名ミス（countUp / countDown）
        → Console で特定

### アラーム

■ アラーム音がならない問題

▼ 原因
    ・ファイルパスミス
    ・GitHubに音声ファイルが無い
    ・ブラウザの自動再生制限

▼ 解決
    ・パスを正しく設定
    ・ユーザー操作後に再生する

▼ 学び
    ・「動かない原因＝コード」だけではない
    ・ファイル構成・環境も確認する

## 2026/03/19

### localStorage で状態保存

▼ 結論
    ・状態はまとめて保存する
    ・JSONで変換する必要がある

▼ 保存データ
    ・seconds
    ・動作状態（isRunning）
    ・入力値

▼ 重要ポイント
    ・localStorage は文字列のみ
    ・JSON.parse はエラーになる可能性あり → try-catch 必須

▼ 学び
    ・状態は「データ」として扱う
    ・UI状態も含めて管理する必要がある。

▼ 課題
    ・リロード中の時間ズレあり ⇒ つぎは「終了時刻ベース」にする

## 2026/03/21

### 精度問題の改善（終了時刻ベース）

▼ 結論
・タイマーは「秒を減らす」のではなく、「終了時刻との差」で計算する

▼ なぜ変更したか（問題）
    従来の方法：seconds--;
    この方法だと、
        ・setInterval のズレが蓄積する
        ・タブ非アクティブで遅れる
        ・リロードで時間がズレる
    ⇒ 正確な時間にならない

▼ 新しい考え方
    残り時間 ＝ 終了時刻 ー 現在時刻

▼ コアロジック（これだけ覚える）
        ・const diff = endTime - Date.now();
        ・const remaining = Math.ceil(diff / 1000);
    ここがすべて

▼ 処理の流れ
    ①スタート時
        終了時刻を決める：endTime = Date.now() + 秒数 * 1000;

    ②カウント中
        毎回「残り時間」を再計算：seconds = remaining;
    
    ③終了判定
        if (diff <= 0)
            秒ではなく「ミリ秒」で判定するのが重要

▼ なぜうまくいくのか
    ・setInterval がズレても関係ない
    ・常に「現在時刻」ベースで再計算している
        ☞ズレがリセットされ続ける

▼ ハマったポイント
    ①seconds を直接減らしていた
        → 古い設計と混ざってバグ発生のため

    ②remaining の再代入ミス
    ✖ remaining = endTime -Date.now(); //
        → seconds に代入しないと表示が更新されない
    
    ③初回表示がズレる問題
        → setInterval は1秒後に実行されるため
        
        解決：countDown(); をStart直後に1回実行
    
    ④00:01 で止まる問題
        原因：秒ベースで判定していた

        解決：if (diff <= 0)

▼ 学び
・「状態を更新する」より「状態を計算する」方が正確
・秒（seconds）は「結果」であって本体ではない
    ☞本体は「時間（Date.now）」側

▼ 今後に活きる理解
    この考え方は
        ・タイマー
        ・カウントダウン
        ・有効期限管理
        ・セッション管理
    全部に使える

▼ 一言まとめ
    時間は減らさずに、差で計算せよ

## 2026/03/23

### UI改善・状態管理の強化

▼ 結論（これだけ覚える）
    ・UIは「状態（seconds）」によって変化させる
    ・表示更新は updateDisplay() に集約する
    ・Resume は「状態を上書きしない」ことが重要

▼ 重要ロジック
    ・色変更
            if (seconds <= 10) → 赤
            else if (seconds <= 60) → オレンジ

    ・進行度（プログレスバー）
        進行率 = 1 - （残り時間 / 全体時間）

    ・完了判定
        if (diff <= 0)

▼ 処理の流れ
    ① 表示更新
        updateDisplay()
            ・時間表示
            ・色変更
            ・進捗更新

    ② カウント中
        seconds = remaining（毎回再計算）

    ③ 終了時
        ・seconds = 0
        ・メッセージ表示
        ・アラーム再生
    
    ④ Stop → Resume
        ・Stop時：seconds に残り時間を保持
        ・Resume時：seconds を上書きしない

▼ 重要な設計
    ・updateDisplay() にUI更新をまとめる
        → 表示ロジックを一元管理するため

    ・totalSeconds は固定値として扱う
        → 進行度の基準を変えないため

    ・seconds は「現在の状態」
        → 書き換えるタイミングを制御する必要がある

▼ ハマったポイント
    ・seconds = totalSeconds により再開時にリセットされた
        → 条件分岐が不足していた

    ・totalSeconds = seconds により進捗バーがリセットされた
        → 基準値を変更してしまっていた

▼ 学び
    ・UIは「状態」に依存して変化する
    ・代入（=）は状態を破壊する可能性がある
    ・「いつ代入するか」がバグの原因になる

▼ 一言まとめ
    状態をむやみに上書きすると、挙動が壊れる

## 2026/03/30

### 状態管理（Stateオブジェクト）の導入

▼ 目的
    複数の変数（seconds・timer・endTime など）をバラバラに管理していた状態をまとめ、バグを防ぐため。

▼ 仕組み
    アプリの状態（残り時間・終了時刻・タイマーの状態など）を1つのオブジェクトにまとめることで、「どこに何の値があるか」を明確にする。

▼ 具体的な方法

    今まで
    ```JS
        let seconds = 0;
        let timer = null;
        let endTime = null;

    修正後
        const state = {
            remainingSeconds: 0,
            totalSeconds: 0,
            endTime: null,
            timerId: null,
            isRunning: false
        };
    すべての変数を「state.○○」で扱うように変更する。

▼ 使用したコード
    ・オブジェクト（state）
    ・プロパティ管理（state.remainingSeconds など）

▼ 重要なポイント
    ・変数をバラバラに持たない
    ・必ず state 経由でアクセスする
    ・旧変数（seconds など）を残さない

▼ 学んだこと
    状態を1つにまとめることで、バグの原因を減らせることを理解した。
    特に「どこで値が変わったか」を追いやすくなる。

---

### UI更新の責務分離（render関数の分割）

▼ 目的
    “1つの関数”に“複数の役割”があると修正しづらいため、機能ごとに分ける。

▼ 仕組み
    「表示する処理」を細かく分割し、updateDisplay から呼び出す形にする。

▼ 具体的な方法
    function updateDisplay() {
        renderTime();
        renderColor();
        renderProgress();
    }
        ⇓　それぞれの役割ごとに関数を作る
    function renderTime() {}
    function renderColor() {}
    function renderProgress() {}

▼ 使用したコード・技術
    ・関数分割
    ・DOM操作（textContent / style変更）

▼ 重要なポイント
    ・1つの関数に役割を詰め込みすぎない
    ・「何をする関数か」が名前でわかるようにする

▼ 学んだこと
    コードを分割すると「どこを修正すればいいか」がわかりやすくなる。実務ではこの書き方が重要だと感じた。

### setInterval → setTimeout（tick関数）への変更

▼ 目的
    タイマーのズレや不安定さを減らすため。

▼ 仕組み
    setInterval ではなく、setTimeout で1回ずつ処理を呼び出すことで、処理のズレが積み重ならないようにする。

▼ 具体的な方法
    function tick() {
        if (!state.isRunning) return;

        countDown();

        if (state.remainingSeconds <= 0) return;

        state.timerId = setTimeout(tick, 1000);
    }

    start時：
        state.isRunning = true;
        tick();

    stop時：
        clearTimeout(state.timerId);
        state.timerId = null;
        state.isRunning = false;
    
▼ 使用したコード・技術
    ・setTimeout
    ・clearTimeout
    ・再帰処理（関数が自分自身を呼ぶ）

▼ 重要なポイント
    ・setInterval はズレが発生する
    ・setTimeout は「処理後に次を予約」するので安定
    ・isRunning で制御しないと止まらなくなる

▼ 学んだこと
    『非同期処理』は「どこで止めるか」が重要。
    tick関数のように「条件を見て次を呼ぶ」設計が必要だと理解した。

### 非同期処理のバグ修正（tick の停止条件）

▼ 目的
    0秒を過ぎてもタイマーが止まらないバグを修正する。

▼ 仕組み
    tick関数の中で条件をチェックし、必要な場合のみ次の処理を予約する。

▼ 具体的な方法
    tick関数内に以下のコードを「countDown();」の下に入力。
        if (state.remainingSeconds <= 0) return;

    また、start時の順番を修正。
        state.isRunning = true;
        tick();

▼ 使用したコード・技術
    ・条件分岐（if）
    ・非同期制御

▼ 重要なポイント
    ・tick は「無条件にループさせない」
    ・状態（isRunning）を先に更新する
    ・順番ミスで動かなくなる

▼ 学んだこと
    『非同期処理』は「実行順」がとても重要。
    順番を間違えると動かなくなることを実体験で理解した。

## 26/03/31

### 入力バリデーション強化

▼ 目的
    タイマーの入力欄に対して、間違った値を入れたときにエラーを出し、不正な状態でStartできないようにすること。

▼ 仕組み
    入力された値をチェックして、
        ①　数字として正しいか（NaNチェック）
        ②　値として正しいか（範囲チェック）
    の順番で確認する。

    エラーがあればメッセージを表示し、Startボタンを押せないようにする。

▼ 具体的な方法
    ① 入力値を取得
        const min = ○○(○○Input.value);
        const sec = ○○(○○Input.value);

    ②　文字かどうかをチェック（NaN対策）
        if (Number.isNaN(min) || Number.isNaN(sec)) {
            message.textContent = "数値を入力してください";
            return;
        }
    
    ③　validateInput関数で値チェック
        const error = validateInput(min, sec);

            if (error) {
                message.textContent = error;
                return;
            }

    ④ 入力中にもチェック（リアルタイム）
        minutesInput.addEventListener("input", validateRealtime);
        secondsInput.addEventListener("input", validateRealtime);
            （resetButton.addEventListener の下に入力）
        
    ⑤ エラーがある場合はStartボタンを無効化
        startButton.disabled = !!error;
    
▼ 使用したコード・技術
    ・Number() → 入力値を数値に変換
    ・Number.isNaN → 数値かどうかを判定
    ・関数（validateInput） → バリデーションをまとめる
    ・addEventListener("input") → 入力中にチェック
    ・disabled → ボタンの 有効/無効 を制御

▼ 重要なポイント
    ・バリデーションは1ヶ所（validateInput）にまとめる
    ・NaNチェック は validate の前に行なう
    ・HTML と JavaScript で二重チェックする
    ・alart ではなく画面内にエラー表示する
    ・エラー時はそもそもボタンを押せないようにする

▼ 学んだこと
    今までは“その場に if 文を書いていた”が、
    “関数にまとめる”ことでコードがわかりやすくなると理解した。

    また、
    ・HTML → 入力しにくくする（補助）
    ・JS → 絶対に防ぐ（本体）
    という役割の違いを理解した。

    その他としては、
    「動くコード」だけでなく、「整理されたコード」にすることが大事だと感じた。

## 26/04/01

▼ 目的
    タイマー終了後に、同じ設定時間で再びStartできるようにする

▼ 仕組み
    ・タイマーは「endTime（終了時刻）」を基準に動作している
    ・remainingSeconds = 表示用、totalSeconds = 元の設定時間
    ・終了時に状態をリセットしつつ、元の時間は保持することで再利用できる

▼ 具体的な方法
    １.終了時（countDown内）に以下を実行
        ・state.endTime = null にして「停止状態」にする
        ・state.remainingSeconds = state.totalSeconds に戻す

    ２.Start時に
        ・endTime が null の場合のみ新しく開始する
        ・remainingSeconds を使って再スタートできる状態にする
    
    ３.Audioの競合を防ぐ
        ・load() を使わない
        ・pause() + currentTime = 0 でリセットする

▼ 使用したコード・技術
    ・Date.now() を使った時間差分計算（endTimeベース）
    ・stateオブジェクトによる状態管理
    ・setTimeout による再帰的タイマー処理
    ・Audio API（play / pause / currentTime）
    ・localStorage による状態保存・復元
    ・入力バリデーション（Number.isNaN, Number.isInteger）

▼ 重要なポイント
    ・endTime が null かどうかで「動いているか」を判定している
    ・remainingSeconds と totalSeconds の役割を分けることが重要
    ・終了時に endTime をリセットしないと再スタートできない
    ・Audioは非同期処理なので競合（play と load）に注意する

▼ 学んだこと
    ・状態管理の1つの値（endTime）でアプリ全体の挙動が変わる
    ・UIの見た目と内部状態を一致させることが重要
    ・「再開」と「再スタート」はロジックとして分けて考える必要がある
    ・ブラウザのAudio操作は想定外のエラーが出やすく、設計が重要
