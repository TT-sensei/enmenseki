# 設計概要

## データの流れ

1. `router.js`がURLのハッシュを読み、`views/`の画面を呼び出す。
2. `problemService.js`が固定問題または生成問題を返す。
3. `diagrams/`が問題の`diagram`だけを読み、SVGを描く。
4. `utils/geometry.js`が正解計算、`validator.js`が式と答えを判定する。
5. `progressService.js`が結果をまとめ、`storage.js`がlocalStorageへ保存する。

画面、計算、描画、問題データを分離し、新しい図形や問題を追加しても既存画面を大きく変更しない構成です。

## ルーティング

`#home`、`#play/pizza`、`#play/cake`、`#play/rescue`、`#concept/circle`、`#concept/sector`、`#classify`、`#stages`、`#practice/:stageId`、`#challenge`、`#result/:stageId`、`#collection`、`#settings`、`#test`を使用します。静的なGitHub Pagesでも再読み込みとブラウザの戻る操作が働きます。

操作中心の3画面は、それぞれの画面内で小さな状態だけを管理します。完了時のかけらは`islandService.js`を通して保存し、詳しい問題の計算・判定ロジックとは分離しています。

## 式の安全性

式は`eval`や`Function`で実行しません。数字、小数、四則記号、括弧だけを字句として認める再帰下降パーサーで計算します。同じ結果になる別の式も許容できます。
