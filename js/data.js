// 円の面積：問題データ（固定問題＋パラメータ生成）。
// すべての問題は params（検証用パラメータ）を持ち、答えは params から独立に再計算できる。
// 丸め規則：π＝3.14。答えは小数第2位までで割り切れる組み合わせだけを使う。
import { fmt } from './diagrams.js';

export const PI = 3.14;
export const round2 = v => Math.round((v + Number.EPSILON) * 100) / 100;
const exact2 = v => Math.abs(v * 100 - Math.round(v * 100)) < 1e-6;

// ---------- 乱数ヘルパー（検証時はシード付きを注入できる） ----------
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (rand, arr) => arr[Math.floor(rand() * arr.length)];
function shuffle(rand, arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 選択肢を組み立てる：正解＋誤答候補（tag付き）から重複・同値・0以下を除いて3つ
function buildChoices(rand, answer, cands) {
  const used = new Set([round2(answer)]);
  const wrong = [];
  for (const c of shuffle(rand, cands)) {
    const v = round2(c.v);
    if (v > 0 && !used.has(v) && exact2(c.v)) {
      used.add(v);
      wrong.push({ v, tag: c.tag });
      if (wrong.length === 3) break;
    }
  }
  let k = 2;
  while (wrong.length < 3) {
    const v = round2(answer * k);
    if (!used.has(v)) { used.add(v); wrong.push({ v, tag: 'near' }); }
    k += 1;
  }
  const choices = shuffle(rand, [{ v: round2(answer), tag: 'ok' }, ...wrong]);
  return { choices, answer: choices.findIndex(c => c.tag === 'ok') };
}

const NOTE = {
  dia: (r) => `直径 ${fmt(r * 2)}cm を、そのまま半径として計算したんだね。半径は半分の ${fmt(r)}cm だよ。`,
  nodiv: (d) => `直径 ${fmt(d)}cm を、そのまま半径として計算したんだね。まず 半径 ＝ 直径 ÷ 2 ＝ ${fmt(d / 2)}cm を出そう。`,
  circ: (r) => `それは円周の計算（2 × 半径 × 3.14）だね。面積は「半径 × 半径 × 3.14」だよ。`,
  r1: () => `半径を 1回しか かけていないよ。面積は「半径 × 半径 × 3.14」で、半径を 2回 かけるんだ。`,
  half: () => `半円なら ÷2 がいるけれど、これは円全体だよ。÷2 はしないでおこう。`,
  near: () => `計算の途中でずれたみたい。半径 × 半径 を先に計算してから 3.14 をかけ直してみよう。`
};

// ---------- ミッション1：半径から面積 ----------
const RADII = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20];
export function genCircleR(rand, r = pick(rand, RADII)) {
  const area = round2(r * r * PI);
  const { choices, answer } = buildChoices(rand, area, [
    { v: (2 * r) * (2 * r) * PI, tag: 'dia' },
    { v: 2 * r * PI, tag: 'circ' },
    { v: r * PI, tag: 'r1' },
    { v: area / 2, tag: 'half' },
    { v: (r + 1) * (r + 1) * PI, tag: 'near' }
  ]);
  return {
    mission: 'm1', kind: 'circle', params: { r },
    text: `半径 ${fmt(r)}cm の円の面積は、何cm²でしょう。`,
    fig: { type: 'circle', r, show: 'r' }, unit: 'cm',
    choices, answer,
    steps: [`半径 × 半径：${fmt(r)} × ${fmt(r)} ＝ ${fmt(r * r)}`, `${fmt(r * r)} × 3.14 ＝ ${fmt(area)}`, `答えは ${fmt(area)}cm²`],
    wrongNotes: { dia: NOTE.dia(r), circ: NOTE.circ(r), r1: NOTE.r1(), half: NOTE.half(), near: NOTE.near() },
    hint: ['円の面積は「半径 × 半径 × 3.14」で求めるよ。', `まず ${fmt(r)} × ${fmt(r)} を計算しよう。`],
    sig: `m1-circle-${r}`
  };
}

// ---------- ミッション2：直径から面積 ----------
const DIAMETERS = [4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 36, 40];
export function genCircleD(rand, d = pick(rand, DIAMETERS)) {
  const r = d / 2;
  const area = round2(r * r * PI);
  const { choices, answer } = buildChoices(rand, area, [
    { v: d * d * PI, tag: 'nodiv' },
    { v: d * PI, tag: 'circ' },
    { v: area * 2, tag: 'x2' },
    { v: r * PI, tag: 'r1' },
    { v: area / 2, tag: 'half' }
  ]);
  return {
    mission: 'm2', kind: 'circleD', params: { d },
    text: `直径 ${fmt(d)}cm の円の面積は、何cm²でしょう。`,
    fig: { type: 'circle', r, show: 'd' }, unit: 'cm',
    choices, answer,
    steps: [`半径は 直径 ÷ 2：${fmt(d)} ÷ 2 ＝ ${fmt(r)}cm`, `半径 × 半径：${fmt(r)} × ${fmt(r)} ＝ ${fmt(r * r)}`, `${fmt(r * r)} × 3.14 ＝ ${fmt(area)}`, `答えは ${fmt(area)}cm²`],
    wrongNotes: {
      nodiv: NOTE.nodiv(d),
      circ: `それは円周の計算（直径 × 3.14）だね。面積は、半径を出してから「半径 × 半径 × 3.14」だよ。`,
      x2: `2倍してしまったね。半径 ${fmt(r)}cm で 「${fmt(r)} × ${fmt(r)} × 3.14」 を計算しよう。`,
      r1: NOTE.r1(), half: NOTE.half(), near: NOTE.near()
    },
    hint: ['まずは半径を出すよ。半径 ＝ 直径 ÷ 2。', `半径は ${fmt(r)}cm。あとは「半径 × 半径 × 3.14」だ。`],
    sig: `m2-circleD-${d}`
  };
}

// ---------- ミッション3：おうぎ形 ----------
const SECTORS = [
  { num: 1, den: 2, angle: 180 }, { num: 1, den: 3, angle: 120 }, { num: 1, den: 4, angle: 90 },
  { num: 1, den: 6, angle: 60 }, { num: 1, den: 8, angle: 45 }, { num: 2, den: 3, angle: 240 },
  { num: 3, den: 4, angle: 270 }, { num: 5, den: 6, angle: 300 }
];
export function genSector(rand, s = pick(rand, SECTORS), r = null) {
  const whole = rr => round2(rr * rr * PI);
  if (r === null) {
    const ok = RADII.filter(rr => exact2((rr * rr * PI * s.num) / s.den));
    r = pick(rand, ok.length ? ok : [6]);
  }
  const full = whole(r);
  const area = round2((full * s.num) / s.den);
  const comp = round2((full * (s.den - s.num)) / s.den);
  const arc = round2(2 * r * PI * (s.num / s.den));
  const { choices, answer } = buildChoices(rand, area, [
    { v: full, tag: 'nofrac' },
    { v: comp, tag: 'comp' },
    { v: arc, tag: 'arc' },
    { v: area / 2, tag: 'xhalf' },
    { v: (2 * r) * (2 * r) * PI * (s.num / s.den), tag: 'dia' }
  ]);
  const fracText = s.num === 1 ? `${s.den}分の1` : `${s.den}分の${s.num}`;
  return {
    mission: 'm3', kind: 'sector', params: { r, num: s.num, den: s.den },
    text: `半径 ${fmt(r)}cm、中心角 ${s.angle}°のおうぎ形の面積は、何cm²でしょう。`,
    fig: { type: 'sector', r, angle: s.angle, fracText: `${s.den}分の${s.num}` }, unit: 'cm',
    choices, answer,
    steps: [
      `まず円全体の面積：${fmt(r)} × ${fmt(r)} × 3.14 ＝ ${fmt(full)}cm²`,
      `中心角 ${s.angle}° は 円の ${fracText}（${s.angle} ÷ 360）`,
      `${fmt(full)} × ${s.num}/${s.den} ＝ ${fmt(area)}`,
      `答えは ${fmt(area)}cm²`
    ],
    wrongNotes: {
      nofrac: `円全体の面積で止まっているよ。おうぎ形は、円の ${fracText} だけの広さだよ。`,
      comp: `それは、残りの部分（円の ${s.den}分の${s.den - s.num}）の面積だね。図で色のついた部分を見よう。`,
      arc: `それは弧の長さの計算だね。面積は、円の面積に分数をかけて出すよ。`,
      xhalf: `÷2 は ${s.den}分の1 の代わりにはならないよ。${fracText} をそのままかけよう。`,
      dia: NOTE.dia(r), near: NOTE.near()
    },
    hint: [`おうぎ形の面積は「円の面積 × 中心角/360」。`, `円全体は ${fmt(full)}cm²。${s.angle}/360 ＝ ${fracText} をかけよう。`],
    sig: `m3-sector-${r}-${s.num}/${s.den}`
  };
}

// ---------- ミッション5：逆算（面積→半径） ----------
export function genReverse(rand, r = pick(rand, [3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20])) {
  const area = round2(r * r * PI);
  const { choices, answer } = buildChoices(rand, r, [
    { v: r * 2, tag: 'dia' },
    { v: r * r, tag: 'quot' },
    { v: r + 2, tag: 'near' },
    { v: Math.max(1, r - 2), tag: 'near2' }
  ]);
  return {
    mission: 'm5', kind: 'reverse', params: { r },
    text: `面積が ${fmt(area)}cm² の円の半径は、何cmでしょう。`,
    fig: { type: 'reverse', area }, unit: 'cm',
    choices, answer,
    steps: [
      `面積 ÷ 3.14：${fmt(area)} ÷ 3.14 ＝ ${fmt(r * r)}`,
      `「半径 × 半径 ＝ ${fmt(r * r)} 」になる数は ${fmt(r)}`,
      `半径は ${fmt(r)}cm（直径は ${fmt(r * 2)}cm）`
    ],
    wrongNotes: {
      dia: `それは直径だね。${fmt(area)} ÷ 3.14 ＝ ${fmt(r * r)} は「半径 × 半径」の答え。半径 × 半径 が ${fmt(r * r)} になる数が半径だよ。`,
      quot: `${fmt(r * r)} は「半径 × 半径」の答えだよ。その数になるかけ算（□ × □ ＝ ${fmt(r * r)}）を考えよう。`,
      near: NOTE.near(), near2: NOTE.near()
    },
    hint: ['面積を 3.14 で割ると、「半径 × 半径」が出るよ。', `${fmt(area)} ÷ 3.14 ＝ ${fmt(r * r)}。□ × □ ＝ ${fmt(r * r)} の □ を探そう。`],
    sig: `m5-reverse-${r}`
  };
}

// ---------- ミッション5：円周（使い分け） ----------
export function genCirc(rand, r = pick(rand, [3, 4, 5, 6, 7, 8, 9, 10, 12, 14])) {
  const circ = round2(2 * r * PI);
  const area = round2(r * r * PI);
  const { choices, answer } = buildChoices(rand, circ, [
    { v: area, tag: 'swap' },
    { v: r * PI, tag: 'half' },
    { v: 2 * (2 * r) * PI, tag: 'd2' },
    { v: circ / 2, tag: 'half2' }
  ]);
  return {
    mission: 'm5', kind: 'circ', params: { r },
    text: `半径 ${fmt(r)}cm の円の、円周の長さは何cmでしょう。`,
    fig: { type: 'circle', r, show: 'r' }, unit: 'cm',
    choices, answer,
    steps: [`円周は「直径 × 3.14」＝「2 × 半径 × 3.14」`, `2 × ${fmt(r)} × 3.14 ＝ ${fmt(circ)}`, `答えは ${fmt(circ)}cm`],
    wrongNotes: {
      swap: `それは面積の計算（半径 × 半径 × 3.14）だね。今聞かれているのは「円周の長さ」だよ。`,
      half: `半径 × 3.14 だけだと半分だよ。円周は「直径 × 3.14」だから、半径を 2倍してから 3.14 をかけよう。`,
      d2: `直径 ${fmt(r * 2)}cm を、もう一度 2倍してしまったね。円周は 直径 × 3.14 で ${fmt(circ)}cm だよ。`,
      half2: NOTE.near(), near: NOTE.near()
    },
    hint: ['円周は「直径 × 3.14」。面積の公式と区別しよう。', `直径は ${fmt(r * 2)}cm。${fmt(r * 2)} × 3.14 を計算しよう。`],
    sig: `m5-circ-${r}`
  };
}

// ---------- ミッション4：組み合わせ図形（固定問題） ----------
function fixed(q) { return { mission: 'm4', ...q }; }
export const FIXED_COMPOSITE = [
  fixed({
    kind: 'halfRect', params: { w: 10, h: 6, r: 5 },
    text: '色のついた部分の面積は、何cm²でしょう。長方形の上に半円がのっています。',
    fig: { type: 'halfRect', w: 10, h: 6, r: 5 }, unit: 'cm',
    rawChoices: [
      { v: 99.25, tag: 'ok' }, { v: 138.5, tag: 'half' }, { v: 20.75, tag: 'minus' }, { v: 75.7, tag: 'circ' }
    ],
    steps: ['長方形：10 × 6 ＝ 60cm²', '半円：5 × 5 × 3.14 ÷ 2 ＝ 39.25cm²', '合わせる：60 ＋ 39.25 ＝ 99.25cm²'],
    wrongNotes: {
      half: '半円を円全体として計算しているよ。半円は 円の面積 ÷ 2 だよ。',
      minus: '引くのではなく、長方形と半円を「合わせた」形だよ。足し算をしよう。',
      circ: '5 × 3.14 は円周の考え方だね。半円の面積は「半径 × 半径 × 3.14 ÷ 2」だよ。'
    },
    hint: ['長方形と半円に分けて考えよう。', '半円の面積は、5 × 5 × 3.14 ÷ 2 だよ。'],
    sig: 'm4-halfRect-10-6-5'
  }),
  fixed({
    kind: 'rectMinusCircle', params: { w: 14, h: 10, r: 5 },
    text: '色のついた部分の面積は、何cm²でしょう。長方形から円がくりぬかれています。',
    fig: { type: 'rectMinusCircle', w: 14, h: 10, r: 5 }, unit: 'cm',
    rawChoices: [
      { v: 61.5, tag: 'ok' }, { v: 218.5, tag: 'plus' }, { v: 78.5, tag: 'part' }, { v: 100.75, tag: 'half' }
    ],
    steps: ['長方形：14 × 10 ＝ 140cm²', '円：5 × 5 × 3.14 ＝ 78.5cm²', 'くりぬく：140 − 78.5 ＝ 61.5cm²'],
    wrongNotes: {
      plus: 'くりぬいた形だから、足すのではなく引くんだよ。',
      part: 'それは、くりぬいた円そのものの面積だね。残りの部分は 長方形 − 円 だよ。',
      half: '引いたのは半円ではなく、円全体だよ。円の面積は 78.5cm² だね。'
    },
    hint: ['「全体 − くりぬいた部分」で考えよう。', '円の面積は 5 × 5 × 3.14 ＝ 78.5cm²。'],
    sig: 'm4-rectMinus-14-10-5'
  }),
  fixed({
    kind: 'donut', params: { R: 8, r: 5 },
    text: 'ドーナツ型（色のついた部分）の面積は、何cm²でしょう。',
    fig: { type: 'donut', R: 8, r: 5 }, unit: 'cm',
    rawChoices: [
      { v: 122.46, tag: 'ok' }, { v: 200.96, tag: 'outer' }, { v: 78.5, tag: 'inner' }, { v: 279.46, tag: 'plus' }
    ],
    steps: ['外の円：8 × 8 × 3.14 ＝ 200.96cm²', '内の円：5 × 5 × 3.14 ＝ 78.5cm²', '引く：200.96 − 78.5 ＝ 122.46cm²'],
    wrongNotes: {
      outer: 'それは外の円全体の面積だね。中の白い円を引くのを忘れずに。',
      inner: 'それは中の白い円の面積だね。ドーナツの部分は 外 − 内 だよ。',
      plus: '足すのではなく引くんだよ。輪の部分だけが残るからね。'
    },
    hint: ['「外の円 − 内の円」で考えよう。', '（8 × 8 − 5 × 5）× 3.14 でも計算できるよ。'],
    sig: 'm4-donut-8-5'
  }),
  fixed({
    kind: 'donut', params: { R: 10, r: 6 },
    text: 'ドーナツ型（色のついた部分）の面積は、何cm²でしょう。',
    fig: { type: 'donut', R: 10, r: 6 }, unit: 'cm',
    rawChoices: [
      { v: 200.96, tag: 'ok' }, { v: 314, tag: 'outer' }, { v: 113.04, tag: 'inner' }, { v: 427.04, tag: 'plus' }
    ],
    steps: ['外の円：10 × 10 × 3.14 ＝ 314cm²', '内の円：6 × 6 × 3.14 ＝ 113.04cm²', '引く：314 − 113.04 ＝ 200.96cm²'],
    wrongNotes: {
      outer: 'それは外の円全体の面積だね。中の白い円を引こう。',
      inner: 'それは中の白い円の面積だね。ドーナツの部分は 外 − 内 だよ。',
      plus: '足すのではなく引くんだよ。'
    },
    hint: ['「外の円 − 内の円」で考えよう。', '（10 × 10 − 6 × 6）× 3.14 ＝ 64 × 3.14 でも出せるよ。'],
    sig: 'm4-donut-10-6'
  }),
  fixed({
    kind: 'donut', params: { R: 7, r: 3 },
    text: 'ドーナツ型（色のついた部分）の面積は、何cm²でしょう。',
    fig: { type: 'donut', R: 7, r: 3 }, unit: 'cm',
    rawChoices: [
      { v: 125.6, tag: 'ok' }, { v: 153.86, tag: 'outer' }, { v: 28.26, tag: 'inner' }, { v: 182.12, tag: 'plus' }
    ],
    steps: ['外の円：7 × 7 × 3.14 ＝ 153.86cm²', '内の円：3 × 3 × 3.14 ＝ 28.26cm²', '引く：153.86 − 28.26 ＝ 125.6cm²'],
    wrongNotes: {
      outer: 'それは外の円全体の面積だね。中の白い円を引こう。',
      inner: 'それは中の白い円の面積だね。ドーナツの部分は 外 − 内 だよ。',
      plus: '足すのではなく引くんだよ。'
    },
    hint: ['「外の円 − 内の円」で考えよう。', '（7 × 7 − 3 × 3）× 3.14 ＝ 40 × 3.14 でも出せるよ。'],
    sig: 'm4-donut-7-3'
  }),
  fixed({
    kind: 'leaf', params: { r: 10 },
    text: '葉っぱ型（色のついた部分）の面積は、何cm²でしょう。正方形の角を中心とする四分円が2つ、重なっています。',
    fig: { type: 'leaf', r: 10 }, unit: 'cm',
    rawChoices: [
      { v: 57, tag: 'ok' }, { v: 78.5, tag: 'part' }, { v: 43, tag: 'complement' }, { v: 157, tag: 'plus' }
    ],
    steps: ['四分円1つ：10 × 10 × 3.14 ÷ 4 ＝ 78.5cm²', '四分円2つ分は 157cm²。そのうち正方形の外にはみ出た分はない代わりに、正方形（100cm²）と重なっている', '葉っぱ ＝ 四分円 × 2 − 正方形 ＝ 157 − 100 ＝ 57cm²'],
    wrongNotes: {
      part: 'それは四分円1つ分の面積だね。葉っぱは、四分円2つが重なった部分だよ。',
      complement: 'それは葉っぱ以外の部分（100 − 57）の面積だね。色のついた部分を見よう。',
      plus: '四分円2つを合わせただけでは、正方形の部分が2回数えられているよ。1回分（正方形）を引こう。'
    },
    hint: ['葉っぱは「四分円 ＋ 四分円 − 正方形」で出せるよ。', '四分円1つは 78.5cm²、正方形は 100cm² だね。'],
    sig: 'm4-leaf-10'
  }),
  fixed({
    kind: 'leaf', params: { r: 6 },
    text: '葉っぱ型（色のついた部分）の面積は、何cm²でしょう。正方形の角を中心とする四分円が2つ、重なっています。',
    fig: { type: 'leaf', r: 6 }, unit: 'cm',
    rawChoices: [
      { v: 20.52, tag: 'ok' }, { v: 28.26, tag: 'part' }, { v: 15.48, tag: 'complement' }, { v: 56.52, tag: 'plus' }
    ],
    steps: ['四分円1つ：6 × 6 × 3.14 ÷ 4 ＝ 28.26cm²', '四分円2つ分は 56.52cm²', '葉っぱ ＝ 四分円 × 2 − 正方形 ＝ 56.52 − 36 ＝ 20.52cm²'],
    wrongNotes: {
      part: 'それは四分円1つ分の面積だね。葉っぱは、四分円2つが重なった部分だよ。',
      complement: 'それは葉っぱ以外の部分（36 − 20.52）の面積だね。色のついた部分を見よう。',
      plus: '四分円2つを合わせただけでは、正方形の部分が2回数えられているよ。正方形（36cm²）を引こう。'
    },
    hint: ['葉っぱは「四分円 ＋ 四分円 − 正方形」で出せるよ。', '四分円1つは 28.26cm²、正方形は 36cm² だね。'],
    sig: 'm4-leaf-6'
  }),
  fixed({
    kind: 'house', params: { side: 8, r: 4 },
    text: '色のついた部分の面積は、何cm²でしょう。正方形の上に半円がのっています。',
    fig: { type: 'house', side: 8, r: 4 }, unit: 'cm',
    rawChoices: [
      { v: 89.12, tag: 'ok' }, { v: 114.24, tag: 'half' }, { v: 38.88, tag: 'minus' }, { v: 76.56, tag: 'circ' }
    ],
    steps: ['正方形：8 × 8 ＝ 64cm²', '半円：4 × 4 × 3.14 ÷ 2 ＝ 25.12cm²', '合わせる：64 ＋ 25.12 ＝ 89.12cm²'],
    wrongNotes: {
      half: '屋根は半円だよ。円全体ではなく、÷2 を忘れずに。',
      minus: '引くのではなく、正方形と半円を「合わせた」形だよ。',
      circ: '4 × 3.14 は円周の考え方だね。半円の面積は「半径 × 半径 × 3.14 ÷ 2」だよ。'
    },
    hint: ['正方形と半円に分けて考えよう。', '半円の面積は、4 × 4 × 3.14 ÷ 2 だよ。'],
    sig: 'm4-house-8-4'
  }),
  fixed({
    kind: 'stadium', params: { w: 12, h: 6, r: 3 },
    text: '色のついた部分の面積は、何cm²でしょう。長方形の両はしに半円がついています。',
    fig: { type: 'stadium', w: 12, h: 6, r: 3 }, unit: 'cm',
    rawChoices: [
      { v: 100.26, tag: 'ok' }, { v: 86.13, tag: 'half' }, { v: 28.26, tag: 'part' }, { v: 43.74, tag: 'minus' }
    ],
    steps: ['長方形：12 × 6 ＝ 72cm²', '半円2つ分は、半径3cmの円1つ分：3 × 3 × 3.14 ＝ 28.26cm²', '合わせる：72 ＋ 28.26 ＝ 100.26cm²'],
    wrongNotes: {
      half: '半円が片方だけになっているよ。両はしの半円2つで、円1つ分になるね。',
      part: 'それは円の部分だけの面積だね。長方形の部分（72cm²）も合わせよう。',
      minus: '引くのではなく合わせる形だよ。'
    },
    hint: ['長方形と、半円2つに分けて考えよう。', '半円2つ分は円1つ分（28.26cm²）だよ。'],
    sig: 'm4-stadium-12-6-3'
  }),
  fixed({
    kind: 'halfDonut', params: { R: 8, r: 4 },
    text: '色のついた部分の面積は、何cm²でしょう。大きい半円から小さい半円がくりぬかれています。',
    fig: { type: 'halfDonut', R: 8, r: 4 }, unit: 'cm',
    rawChoices: [
      { v: 75.36, tag: 'ok' }, { v: 150.72, tag: 'half' }, { v: 100.48, tag: 'outer' }, { v: 25.12, tag: 'inner' }
    ],
    steps: ['大きい半円：8 × 8 × 3.14 ÷ 2 ＝ 100.48cm²', '小さい半円：4 × 4 × 3.14 ÷ 2 ＝ 25.12cm²', '引く：100.48 − 25.12 ＝ 75.36cm²'],
    wrongNotes: {
      half: 'ドーナツ型全体（円のとき）の答えになっているよ。これは半円どうしだから、最後に ÷2 の分も考えよう。',
      outer: 'それは大きい半円だけの面積だね。小さい半円を引こう。',
      inner: 'それは小さい半円だけの面積だね。残りの部分は 大 − 小 だよ。'
    },
    hint: ['「大きい半円 − 小さい半円」で考えよう。', '（8 × 8 − 4 × 4）× 3.14 ÷ 2 でも出せるよ。'],
    sig: 'm4-halfDonut-8-4'
  }),
  fixed({
    kind: 'squareMinusQuarter', params: { r: 10 },
    text: '色のついた部分の面積は、何cm²でしょう。正方形から四分円が切り取られています。',
    fig: { type: 'squareMinusQuarter', r: 10 }, unit: 'cm',
    rawChoices: [
      { v: 21.5, tag: 'ok' }, { v: 78.5, tag: 'part' }, { v: 178.5, tag: 'plus' }, { v: 57, tag: 'leaf' }
    ],
    steps: ['正方形：10 × 10 ＝ 100cm²', '四分円：10 × 10 × 3.14 ÷ 4 ＝ 78.5cm²', '残り：100 − 78.5 ＝ 21.5cm²'],
    wrongNotes: {
      part: 'それは切り取られた四分円の面積だね。聞かれているのは残りの部分だよ。',
      plus: '足すのではなく、正方形から四分円を引くんだよ。',
      leaf: 'それは葉っぱ型の計算（四分円×2 − 正方形）だね。この図は四分円が1つだけ切り取られているよ。'
    },
    hint: ['「正方形 − 四分円」で考えよう。', '四分円は 78.5cm² だね。'],
    sig: 'm4-squareMinusQuarter-10'
  }),
  fixed({
    kind: 'rectPlusQuarter', params: { w: 10, h: 6, r: 6 },
    text: '色のついた部分の面積は、何cm²でしょう。長方形の横に四分円がついています。',
    fig: { type: 'rectPlusQuarter', w: 10, h: 6, r: 6 }, unit: 'cm',
    rawChoices: [
      { v: 88.26, tag: 'ok' }, { v: 116.52, tag: 'half' }, { v: 31.74, tag: 'minus' }, { v: 78.84, tag: 'circ' }
    ],
    steps: ['長方形：10 × 6 ＝ 60cm²', '四分円：6 × 6 × 3.14 ÷ 4 ＝ 28.26cm²', '合わせる：60 ＋ 28.26 ＝ 88.26cm²'],
    wrongNotes: {
      half: 'ついているのは半円ではなく四分円だよ。円の 4分の1 だね。',
      minus: '引くのではなく合わせる形だよ。',
      circ: '6 × 3.14 は円周の考え方だね。四分円の面積は「半径 × 半径 × 3.14 ÷ 4」だよ。'
    },
    hint: ['長方形と四分円に分けて考えよう。', '四分円の面積は、6 × 6 × 3.14 ÷ 4 だよ。'],
    sig: 'm4-rectPlusQuarter-10-6-6'
  }),
  fixed({
    kind: 'semiMinusTri', params: { r: 6 },
    text: '色のついた部分の面積は、何cm²でしょう。半円から、しろい三角形を引いた部分です。',
    fig: { type: 'semiMinusTri', r: 6 }, unit: 'cm',
    rawChoices: [
      { v: 20.52, tag: 'ok' }, { v: 92.52, tag: 'plus' }, { v: 56.52, tag: 'part' }, { v: 36, tag: 'tri' }
    ],
    steps: ['半円：6 × 6 × 3.14 ÷ 2 ＝ 56.52cm²', '三角形：底辺は直径 12cm、高さは半径 6cm。12 × 6 ÷ 2 ＝ 36cm²', '引く：56.52 − 36 ＝ 20.52cm²'],
    wrongNotes: {
      plus: '足すのではなく、半円から三角形を引くんだよ。',
      part: 'それは半円だけの面積だね。白い三角形の分を引こう。',
      tri: 'それは白い三角形の面積だね。聞かれているのは色のついた部分だよ。'
    },
    hint: ['「半円 − 三角形」で考えよう。', '三角形の底辺は直径（12cm）、高さは半径（6cm）だよ。'],
    sig: 'm4-semiMinusTri-6'
  }),
  fixed({
    kind: 'halfRect', params: { w: 14, h: 8, r: 7 },
    text: '色のついた部分の面積は、何cm²でしょう。長方形の上に半円がのっています。',
    fig: { type: 'halfRect', w: 14, h: 8, r: 7 }, unit: 'cm',
    rawChoices: [
      { v: 188.93, tag: 'ok' }, { v: 265.86, tag: 'half' }, { v: 35.07, tag: 'minus' }, { v: 133.98, tag: 'circ' }
    ],
    steps: ['長方形：14 × 8 ＝ 112cm²', '半円：7 × 7 × 3.14 ÷ 2 ＝ 76.93cm²', '合わせる：112 ＋ 76.93 ＝ 188.93cm²'],
    wrongNotes: {
      half: '半円を円全体として計算しているよ。半円は 円の面積 ÷ 2 だよ。',
      minus: '引くのではなく、長方形と半円を「合わせた」形だよ。足し算をしよう。',
      circ: '7 × 3.14 は円周の考え方だね。半円の面積は「半径 × 半径 × 3.14 ÷ 2」だよ。'
    },
    hint: ['長方形と半円に分けて考えよう。', '半円の面積は、7 × 7 × 3.14 ÷ 2 だよ。'],
    sig: 'm4-halfRect-14-8-7'
  })
];

// ---------- ミッション5：文章題（固定問題） ----------
export const FIXED_WORD = [
  fixed({
    mission: 'm5', kind: 'circle', params: { r: 4 },
    text: '半径 4m の円形の花だんがあります。花だんの面積は、何m²でしょう。',
    fig: { type: 'circle', r: 4, show: 'r', caption: '円形の花だん' }, unit: 'm',
    rawChoices: [
      { v: 50.24, tag: 'ok' }, { v: 25.12, tag: 'circ' }, { v: 200.96, tag: 'dia' }, { v: 12.56, tag: 'r1' }
    ],
    steps: ['半径 × 半径：4 × 4 ＝ 16', '16 × 3.14 ＝ 50.24', '答えは 50.24m²'],
    wrongNotes: { circ: NOTE.circ(4), dia: NOTE.dia(4), r1: NOTE.r1() },
    hint: ['花だんは円。面積は「半径 × 半径 × 3.14」だよ。', 'まず 4 × 4 を計算しよう。'],
    sig: 'm5-word-flower-4'
  }),
  fixed({
    mission: 'm5', kind: 'circleD', params: { d: 20 },
    text: '直径 20cm のピザがあります。ピザの面積は、何cm²でしょう。',
    fig: { type: 'circle', r: 10, show: 'd', caption: 'ピザ' }, unit: 'cm',
    rawChoices: [
      { v: 314, tag: 'ok' }, { v: 1256, tag: 'nodiv' }, { v: 62.8, tag: 'circ' }, { v: 157, tag: 'half' }
    ],
    steps: ['半径は 20 ÷ 2 ＝ 10cm', '10 × 10 × 3.14 ＝ 314', '答えは 314cm²'],
    wrongNotes: {
      nodiv: NOTE.nodiv(20),
      circ: 'それは円周の計算（直径 × 3.14）だね。面積は、半径を出してから「半径 × 半径 × 3.14」だよ。',
      half: 'このピザはまるごと1枚分だよ。÷2 はしないでおこう。'
    },
    hint: ['まずは半径を出すよ。半径 ＝ 直径 ÷ 2。', '半径は 10cm。あとは「半径 × 半径 × 3.14」だ。'],
    sig: 'm5-word-pizza-20'
  }),
  fixed({
    mission: 'm5', kind: 'circle', params: { r: 6 },
    text: 'スプリンクラーは、半径 6m の円の形に水をまきます。水がまかれる面積は、何m²でしょう。',
    fig: { type: 'circle', r: 6, show: 'r', caption: '水がまかれる範囲' }, unit: 'm',
    rawChoices: [
      { v: 113.04, tag: 'ok' }, { v: 37.68, tag: 'circ' }, { v: 452.16, tag: 'dia' }, { v: 56.52, tag: 'half' }
    ],
    steps: ['半径 × 半径：6 × 6 ＝ 36', '36 × 3.14 ＝ 113.04', '答えは 113.04m²'],
    wrongNotes: { circ: NOTE.circ(6), dia: NOTE.dia(6), half: NOTE.half() },
    hint: ['水の範囲は円。面積は「半径 × 半径 × 3.14」だよ。', 'まず 6 × 6 を計算しよう。'],
    sig: 'm5-word-sprinkler-6'
  }),
  fixed({
    mission: 'm5', kind: 'circleD', params: { d: 2 },
    text: '直径 2m の円形のテーブルの面積は、何m²でしょう。',
    fig: { type: 'circle', r: 1, show: 'd', caption: '円形のテーブル' }, unit: 'm',
    rawChoices: [
      { v: 3.14, tag: 'ok' }, { v: 12.56, tag: 'nodiv' }, { v: 6.28, tag: 'circ' }, { v: 1.57, tag: 'half' }
    ],
    steps: ['半径は 2 ÷ 2 ＝ 1m', '1 × 1 × 3.14 ＝ 3.14', '答えは 3.14m²'],
    wrongNotes: {
      nodiv: NOTE.nodiv(2),
      circ: 'それは円周の計算（直径 × 3.14）だね。面積は、半径を出してから「半径 × 半径 × 3.14」だよ。',
      half: 'テーブルはまるごと1つ分だよ。÷2 はしないでおこう。'
    },
    hint: ['まずは半径を出すよ。半径 ＝ 直径 ÷ 2。', '半径は 1m。1 × 1 × 3.14 だ。'],
    sig: 'm5-word-table-2'
  }),
  fixed({
    mission: 'm5', kind: 'reverse', params: { r: 5 },
    text: '面積が 78.5cm² の円があります。半径は、何cmでしょう。',
    fig: { type: 'reverse', area: 78.5 }, unit: 'cm',
    rawChoices: [
      { v: 5, tag: 'ok' }, { v: 10, tag: 'dia' }, { v: 25, tag: 'quot' }, { v: 2.5, tag: 'near' }
    ],
    steps: ['面積 ÷ 3.14：78.5 ÷ 3.14 ＝ 25', '「半径 × 半径 ＝ 25」になる数は 5', '半径は 5cm（直径は 10cm）'],
    wrongNotes: {
      dia: 'それは直径だね。78.5 ÷ 3.14 ＝ 25 は「半径 × 半径」の答え。半径は 5 だよ。',
      quot: '25 は「半径 × 半径」の答えだよ。□ × □ ＝ 25 の □ が半径だね。',
      near: NOTE.near()
    },
    hint: ['面積を 3.14 で割ると、「半径 × 半径」が出るよ。', '78.5 ÷ 3.14 ＝ 25。□ × □ ＝ 25 の □ を探そう。'],
    sig: 'm5-word-reverse-5'
  }),
  fixed({
    mission: 'm5', kind: 'reverse', params: { r: 10 },
    text: '面積が 314cm² の円があります。半径は、何cmでしょう。',
    fig: { type: 'reverse', area: 314 }, unit: 'cm',
    rawChoices: [
      { v: 10, tag: 'ok' }, { v: 20, tag: 'dia' }, { v: 100, tag: 'quot' }, { v: 5, tag: 'near' }
    ],
    steps: ['面積 ÷ 3.14：314 ÷ 3.14 ＝ 100', '「半径 × 半径 ＝ 100」になる数は 10', '半径は 10cm（直径は 20cm）'],
    wrongNotes: {
      dia: 'それは直径だね。314 ÷ 3.14 ＝ 100 は「半径 × 半径」の答え。半径は 10 だよ。',
      quot: '100 は「半径 × 半径」の答えだよ。□ × □ ＝ 100 の □ が半径だね。',
      near: NOTE.near()
    },
    hint: ['面積を 3.14 で割ると、「半径 × 半径」が出るよ。', '314 ÷ 3.14 ＝ 100。□ × □ ＝ 100 の □ を探そう。'],
    sig: 'm5-word-reverse-10'
  }),
  fixed({
    mission: 'm5', kind: 'circ', params: { r: 7 },
    text: '半径 7cm の円の、円周の長さは何cmでしょう。',
    fig: { type: 'circle', r: 7, show: 'r', caption: '円周を聞かれているよ' }, unit: 'cm',
    rawChoices: [
      { v: 43.96, tag: 'ok' }, { v: 153.86, tag: 'swap' }, { v: 21.98, tag: 'half' }, { v: 87.92, tag: 'd2' }
    ],
    steps: ['円周は「直径 × 3.14」＝「2 × 半径 × 3.14」', '2 × 7 × 3.14 ＝ 43.96', '答えは 43.96cm'],
    wrongNotes: {
      swap: 'それは面積の計算（半径 × 半径 × 3.14）だね。今聞かれているのは「円周の長さ」だよ。',
      half: '半径 × 3.14 だけだと半分だよ。円周は、半径を 2倍（直径）にしてから 3.14 をかけよう。',
      d2: '直径 14cm を、もう一度 2倍してしまったね。円周は 直径 × 3.14 で 43.96cm だよ。'
    },
    hint: ['円周は「直径 × 3.14」。面積の公式と区別しよう。', '直径は 14cm。14 × 3.14 を計算しよう。'],
    sig: 'm5-word-circ-7'
  }),
  fixed({
    mission: 'm5', kind: 'circD', params: { d: 8 },
    text: '直径 8m の円形の池があります。池のまわり 1周の長さは、何mでしょう。',
    fig: { type: 'circle', r: 4, show: 'd', caption: '円形の池' }, unit: 'm',
    rawChoices: [
      { v: 25.12, tag: 'ok' }, { v: 50.24, tag: 'swap' }, { v: 200.96, tag: 'areaD' }, { v: 12.56, tag: 'half' }
    ],
    steps: ['まわり 1周の長さは円周。「直径 × 3.14」', '8 × 3.14 ＝ 25.12', '答えは 25.12m'],
    wrongNotes: {
      swap: 'それは池の面積（半径 × 半径 × 3.14）だね。今聞かれているのは「まわり 1周の長さ」だよ。',
      areaD: '直径を半径として面積を計算したんだね。長さなら「直径 × 3.14」だけでいいよ。',
      half: '半周分になっているよ。1周分は 直径 × 3.14 だね。'
    },
    hint: ['「まわり 1周の長さ」は円周だよ。「直径 × 3.14」。', '8 × 3.14 を計算しよう。'],
    sig: 'm5-word-circD-8'
  })
];

// 生成器プール（セッション作成用）
export const GENERATORS = {
  m1: rand => genCircleR(rand),
  m2: rand => genCircleD(rand),
  m3: rand => genSector(rand),
  m5: rand => pick(rand, [genReverse, genCirc, genReverse, genCirc])(rand)
};

export function finalizeFixed(rand, q) {
  const { choices, answer } = buildChoices(rand, q.rawChoices.find(c => c.tag === 'ok').v,
    q.rawChoices.filter(c => c.tag !== 'ok'));
  const { rawChoices, ...rest } = q;
  return { ...rest, choices, answer };
}
