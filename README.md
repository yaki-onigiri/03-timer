# タイマー

---

## Demo

[タイマーアプリはこちら](https://yaki-onigiri.github.io/03-timer)

---

## Source Code

---

## アプリ概要

---

## Features（主な機能）

- スタート機能
「Start」ボタンを押すと1秒ごとにカウントアップします。

- ストップ機能
「Stop」ボタンを押すとタイマーを一時停止できます。

- リセット機能
「Reset」ボタンを押すとタイマーを 00：00 に戻します。

- 時間表示機能
秒数を「分：秒」の形式に変換して表示します。
（例：01：05　など）

---

## 使用技術

・HTML
「タイマー表示」「操作ボタン」などの画面構成を作成。

・CSS
タイマー画面のレイアウト・デザインを調整。

・JavaScript
主に以下の機能を使用。

    ・DOM操作
    ・イベントリスナー
    ・setInterval() による定期処理
    ・clearInterval() による処理停止
    ・Math.floor() による時間計算
    ・padStart() を使った時間表示フォーマット

---

## How to Run

---

## フォルダ構成

.
├ index.html
├ css
│ └ style.css
├ js
│ └ script.js
├ README.md
└ docs
  ├ learning-note.md
  ├ dev-log.md
  └ screenshots
    └ todo-app.png

---

## 学習ポイント

今回のツール作成では、以下のJavaScriptの基礎を学習しました。

26/03/17
・DOM要素の取得
document.getElementById()

・イベント処理
addEventListener()

・一定時間ごとの処理
setInterval()

・タイマー停止処理
clearInterval()

・秒数を「分：秒」に変換する処理
Math.floor(seconds / 60)
seconds % 60

・2桁表示のフォーマット
padStart()

---

## 今後の改善予定

今後、以下の機能追加を予定しています。

・カウントダウンタイマー機能

・分単位の入力フォームの追加

・タイマー終了時のアラーム機能

・ localStorage を使用したタイマー状態の保存

・UIデザインの改善（レスポンシブ対応・ダークモードなど）

---

## 工夫した点

26/03/17
・秒数を“そのまま表示する”のではなく、「分：秒」形式で表示する処理を実装しました。

・`padStart()` を使用して、``常に2桁で表示される``ように調整しました。

・`timer !== null` を利用し、``Startボタンの連続クリックによるタイマー重複起動を防止``しています。

---
