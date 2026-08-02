# 問題を追加する方法

問題は `js/data/` の、内容に合う `*Problems.js` に追加します。既存問題を一つコピーし、`id`が重ならないように書き換える方法が簡単です。

## 円の基本問題

```js
makeProblem({
  id: 'circle-new-1', stageId: 1, difficulty: 1,
  type: 'circle-area', title: '半径から円の面積',
  instruction: '半径7cmの円の面積を求めよう。',
  diagram: { kind: 'circle', radius: 7 },
  values: { radius: 7 },
  validStrategies: ['whole'],
  expression: '7×7×3.14', answer: 153.86, unit: 'cm²',
  tags: ['円', '半径']
})
```

`radius`を変えると図の半径ラベルが変わります。`instruction`、`expression`、`answer`も同じ数に合わせます。

## おうぎ形問題

```js
makeProblem({
  id: 'sector-new-1', stageId: 5, difficulty: 2,
  type: 'sector-angle', title: '中心角とおうぎ形',
  instruction: '半径9cm、中心角120°のおうぎ形の面積を求めよう。',
  diagram: { kind: 'sector', radius: 9, angle: 120 },
  values: { radius: 9, angle: 120 },
  validStrategies: ['fraction', 'whole'],
  expression: '9×9×3.14×120÷360', answer: 84.78, unit: 'cm²',
  tags: ['おうぎ形', '中心角']
})
```

`angle`が色のついた部分の角度です。中心角を変えたら、式中の角度と答えも直します。

## 組み合わせ図形問題

```js
makeProblem({
  id: 'ring-new-1', stageId: 7, difficulty: 3,
  type: 'ring', title: 'ドーナツ型',
  instruction: '色のついた部分の面積を求めよう。',
  diagram: { kind: 'ring', outerRadius: 12, innerRadius: 8 },
  values: { outerRadius: 12, innerRadius: 8 },
  validStrategies: ['subtract'],
  expression: '12×12×3.14-8×8×3.14', answer: 251.2, unit: 'cm²',
  tags: ['引き算', 'ドーナツ型']
})
```

`outerRadius`は外側、`innerRadius`は内側の半径です。`validStrategies`には正しい考え方をすべて書けます。葉っぱ型なら `['overlap', 'double', 'subtract']` のように複数指定できます。

## ヒントと解説を個別に変える

`makeProblem`は共通ヒントを補います。問題専用にする場合は次を加えます。

```js
hints: ['半径を見つけよう。', '円全体から考えよう。', '半径×半径×3.14', '12×12×3.14', '144×3.14を計算しよう。'],
explanation: '大きい円の面積から、小さい円の面積を引きます。'
```

変更後は `#test` を開き、ステージの問題数と計算テストが成功することを確認してください。
