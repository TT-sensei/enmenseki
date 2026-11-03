// 「円の面積」画面と進行。
// 心臓は「円を並べ替えると長方形になる」体験（へんしんラボ）。
// 記録（解いた数・正解数・まちがえた問題・バッジ）は localStorage にだけ保存する。
import {
  GENERATORS, FIXED_COMPOSITE, FIXED_WORD, finalizeFixed, round2
} from './data.js';
import { figureSVG, fmt } from './diagrams.js';
import { mountLab } from './lab.js';

let soundList = [];
try {
  ({ soundList } = await import('https://tt-sensei.github.io/sounds-recipe-/sounds.js'));
} catch {
  soundList = [];
}

const root = document.querySelector('#app');
const NAVI_BASE = 'https://tt-sensei.github.io/navi-character-/assets/web';
const BADGE_BASE = 'https://tt-sensei.github.io/edu-assets/assets/web/badges';
const expr = (c, e) => `${NAVI_BASE}/characters/${c}/expressions/${e}.webp`;

const NAVI = {
  tsuki: { name: 'つき', face: expr('tsuki', '04-idea') },
  riku: { name: 'りく', face: expr('riku', '02-happy') },
  kai: { name: 'かい', face: expr('kai', '03-thinking') },
  nami: { name: 'なみ', face: expr('nami', '07-encouraging') },
  saku: { name: 'さく', face: expr('saku', '02-happy') },
  sora: { name: 'そら', face: expr('sora', '02-happy') }
};
const CHAR_KEY = { 'つき': 'tsuki', 'りく': 'riku', 'かい': 'kai', 'なみ': 'nami', 'さく': 'saku', 'そら': 'sora' };

const MISSIONS = [
  { id: 'm1', navi: 'riku', name: 'もとめ方', sub: '半径から面積を求める', comment: '円の面積は「半径 × 半径 × 3.14」。まずはこの型を体に入れよう。' },
  { id: 'm2', navi: 'kai', name: '直径から', sub: '直径を半径に直してから', comment: '直径が出てきたら、まず ÷2 して半径を出すのがコツだよ。' },
  { id: 'm3', navi: 'nami', name: 'おうぎ形', sub: '中心角と分数で考える', comment: 'おうぎ形は、円全体の何分の一かを見つけるのが先だよ。' },
  { id: 'm4', navi: 'saku', name: '組み合わせ', sub: '半円・ドーナツ・葉っぱ型', comment: '複雑な形も、分けたり引いたりすれば、知っている形になるよ。' },
  { id: 'm5', navi: 'sora', name: '逆算と文章題', sub: '面積から半径、円周との使い分け', comment: '面積から半径をさかのぼったり、円周と使い分けたりする仕上げの問題だよ。' }
];
const missionById = id => MISSIONS.find(m => m.id === id);

// ---------- バッジ ----------
const BADGES = [
  { id: 'first-step', name: 'はじめの一歩', img: `${BADGE_BASE}/common/first-step/badge.webp`, desc: 'はじめて問題に答える', test: s => s.stats.answered >= 1 },
  { id: 'lab-36', name: 'へんしん名人', img: `${BADGE_BASE}/math/geometry/badge.webp`, desc: 'へんしんラボで36等分まで変形させる', test: s => s.stats.labMax >= 36 },
  { id: 'correct-10', name: '10問正解', img: `${BADGE_BASE}/common/great-answer/badge.webp`, desc: 'ぜんぶで10問正解する', test: s => s.stats.correct >= 10 },
  { id: 'correct-30', name: '30問正解', img: `${BADGE_BASE}/math/number-sense/badge.webp`, desc: 'ぜんぶで30問正解する', test: s => s.stats.correct >= 30 },
  { id: 'correct-60', name: '60問正解', img: `${BADGE_BASE}/math/measurement/badge.webp`, desc: 'ぜんぶで60問正解する', test: s => s.stats.correct >= 60 },
  { id: 'sector-fan', name: 'おうぎ形ファン', img: `${BADGE_BASE}/math/spatial-sense/badge.webp`, desc: 'おうぎ形で15問正解する', test: s => (s.stats.byMission.m3 || {}).c >= 15 },
  { id: 'combo-fan', name: '組み合わせ名人', img: `${BADGE_BASE}/math/logical-thinking/badge.webp`, desc: '組み合わせ図形で12問正解する', test: s => (s.stats.byMission.m4 || {}).c >= 12 },
  { id: 'perfect', name: 'パーフェクト', img: `${BADGE_BASE}/common/clear/badge.webp`, desc: 'どれかの練習で10問ぜんぶ正解する', test: s => s.stats.perfectSessions >= 1 },
  { id: 'mix-run', name: 'まぜまぜ完走', img: `${BADGE_BASE}/common/level-up/badge.webp`, desc: 'まぜまぜ練習を最後まで解く', test: s => s.stats.mixFinished >= 1 },
  { id: 'retry-hero', name: 'こくふくヒーロー', img: `${BADGE_BASE}/common/keep-going/badge.webp`, desc: 'まちがえた問題を3問こくふくする', test: s => s.stats.retryCleared >= 3 }
];

// ---------- 状態 ----------
const LS_KEY = 'enmenseki.v2';
function defaultState() {
  return {
    sound: true,
    stats: { answered: 0, correct: 0, byMission: {}, retryCleared: 0, perfectSessions: 0, mixFinished: 0, labMax: 0 },
    mistakes: [],
    badges: []
  };
}
let state = defaultState();
try {
  const raw = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
  if (raw && typeof raw === 'object') {
    const d = defaultState();
    if (typeof raw.sound === 'boolean') d.sound = raw.sound;
    if (raw.stats) Object.assign(d.stats, raw.stats);
    if (Array.isArray(raw.mistakes)) d.mistakes = raw.mistakes.filter(m => m && m.q && m.q.sig);
    if (Array.isArray(raw.badges)) d.badges = raw.badges.filter(id => BADGES.some(b => b.id === id));
    state = d;
  }
} catch { /* 壊れた保存は初期化して続ける */ }
function persist() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch { /* 保存できなくても続ける */ }
}
persist();

// ---------- 音 ----------
class SoundController {
  constructor() { this.context = null; this.recipes = Array.isArray(soundList) ? soundList : []; }
  play(id) {
    if (!state.sound || !this.recipes.length) return;
    const recipe = this.recipes.find(item => item.id === id);
    if (!recipe) return;
    try {
      if (!this.context) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.context = new AC();
      }
      if (this.context.state === 'suspended') this.context.resume();
      recipe.play(this.context, 0.72);
    } catch { /* 効果音の失敗で操作を止めない */ }
  }
}
const sounds = new SoundController();

// ---------- 小物 ----------
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[c]));
}
function fxPop(el) {
  if (el && window.EduEffects) { try { window.EduEffects.play(el, 'edu-kinetic-pop'); } catch { /* 演出は補助 */ } }
}
function fxConfetti(el, n = 16) {
  if (el && window.EduEffects) { try { window.EduEffects.confetti(el, n); } catch { /* 演出は補助 */ } }
}
let toastTimer = null;
function showBadgeToast(badge) {
  document.querySelector('.badge-toast')?.remove();
  const el = document.createElement('div');
  el.className = 'badge-toast';
  el.innerHTML = `<img src="${badge.img}" alt=""><div><b>バッジをゲット！「${escapeHtml(badge.name)}」</b><small>${escapeHtml(badge.desc)}</small></div>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  sounds.play('badge');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 500); }, 3400);
}
function checkBadges() {
  for (const badge of BADGES) {
    if (!state.badges.includes(badge.id) && badge.test(state)) {
      state.badges.push(badge.id);
      persist();
      showBadgeToast(badge);
    }
  }
}
function statMission(id) {
  if (!state.stats.byMission[id]) state.stats.byMission[id] = { a: 0, c: 0 };
  return state.stats.byMission[id];
}

// ---------- 画面共通 ----------
let screen = 'home';
function shell(content) {
  return `
  <div class="lab-app">
    <header class="app-header">
      <div class="app-header-inner">
        <button class="app-brand" data-action="home" aria-label="ホームへ">
          <span class="brand-mark">円</span>
          <span><strong>円の面積</strong><small>TT-sensei · 6年生 算数</small></span>
        </button>
        <div class="header-actions">
          ${screen !== 'home' ? '<button class="header-btn" data-action="home">ホーム</button>' : ''}
          <button class="header-btn" data-action="formula">こうしき</button>
          <button class="header-btn sound-btn" data-action="sound" aria-pressed="${state.sound}">${state.sound ? '🔊 音 ON' : '🔇 音 OFF'}</button>
        </div>
      </div>
    </header>
    <main class="app-main" id="main">${content}</main>
    <footer class="app-footer">記録は、この端末の中にだけ保存されます。</footer>
  </div>`;
}
function naviComment(naviKey, text) {
  const n = NAVI[naviKey];
  return `<div class="navi-comment"><img src="${n.face}" alt="${n.name}"><div><b>${n.name}</b><p>${escapeHtml(text)}</p></div></div>`;
}

// ---------- ホーム ----------
function homeHTML() {
  const total = state.stats;
  const tagQ = `固定問題 ${FIXED_COMPOSITE.length + FIXED_WORD.length}問 ＋ 作られる問題`;
  const cards = MISSIONS.map((m, i) => {
    const n = NAVI[m.navi];
    const st = total.byMission[m.id] || { a: 0, c: 0 };
    return `
    <button class="mission-card" data-action="mission" data-id="${m.id}">
      <span class="mission-num">${String(i + 1).padStart(2, '0')}</span>
      <img class="mission-face" src="${n.face}" alt="${n.name}">
      <span class="mission-body">
        <strong>${m.name}</strong>
        <small>${m.sub}</small>
        <span class="mission-navi">${n.name}：${m.comment}</span>
        <span class="mission-stat">${st.a ? `解いた数 ${st.a}問 ・ 正解 ${st.c}問` : 'まだ解いていない'}</span>
      </span>
      <span class="mission-arrow">→</span>
    </button>`;
  }).join('');
  const earnedBadges = BADGES.filter(b => state.badges.includes(b.id));
  return shell(`
    <section class="hero card">
      <img class="hero-img" src="${NAVI_BASE}/groups/group-thinking.webp" alt="考えるナビキャラたち">
      <div class="hero-body">
        <h1>円を、長方形に<br>へんしんさせよう。</h1>
        <p>円を細かく切って並べ替えると、長方形に近づく。だから円の面積は <b>半径 × 半径 × 3.14</b>。まずは「へんしんラボ」で、その理由を体感しよう。</p>
        <div class="hero-tags">
          <span class="tag tag-main">練習5種類</span>
          <span class="tag">${tagQ}</span>
          <span class="tag">バッジ${BADGES.length}種</span>
        </div>
      </div>
    </section>

    <button class="lab-card" data-action="lab">
      <img src="${NAVI.tsuki.face}" alt="つき">
      <span class="lab-card-body">
        <strong>へんしんラボ <span class="lab-badge">この単元の心臓</span></strong>
        <small>円を 8・12・18・24・36 等分して並べ替え、長方形に近づく変化を確かめる</small>
        <span class="mission-navi">つき：細かく分けるほど、本当の長方形に近づくよ。今は ${state.stats.labMax ? `最大 ${state.stats.labMax}等分まで変形` : 'まだ変形していない'}。</span>
      </span>
      <span class="mission-arrow">→</span>
    </button>

    <h2 class="section-title">練習を選ぼう <small>（考える順序で並んでいるよ）</small></h2>
    <div class="mission-grid">${cards}</div>

    <button class="mission-card mix-card" data-action="mission" data-id="mix">
      <span class="mission-num">＋</span>
      <img class="mission-face" src="${expr('kai', '08-celebrating')}" alt="かい">
      <span class="mission-body">
        <strong>まぜまぜ</strong>
        <small>5種類から まぜて 10問</small>
        <span class="mission-navi">かい：仕上げに、種類を見分ける力も試そう。</span>
      </span>
      <span class="mission-arrow">→</span>
    </button>

    <h2 class="section-title">記録と再挑戦</h2>
    <div class="record-row">
      <button class="record-card" data-action="retry">
        <strong>まちがえた問題</strong>
        <span class="record-count">${state.mistakes.length}</span>
        <small>まちがえた問題は ここに たまります。再挑戦して正解すると 消えます。</small>
      </button>
      <button class="record-card" data-action="records">
        <strong>学習の記録</strong>
        <small>解いた数 ${total.answered}問 ・ 正解 ${total.correct}問${total.answered ? ` ・ 正答率 ${Math.round((total.correct / total.answered) * 100)}％` : ''}</small>
        <small>バッジ ${earnedBadges.length} / ${BADGES.length}</small>
      </button>
    </div>
    ${earnedBadges.length ? `<div class="badge-strip">${earnedBadges.map(b => `<img src="${b.img}" alt="${escapeHtml(b.name)}" title="${escapeHtml(b.name)}">`).join('')}</div>` : ''}
  `);
}

// ---------- へんしんラボ ----------
function labHTML() {
  return shell(`
    <button class="back-btn" data-action="home">← ホームへ</button>
    <section class="card lab-wrap">
      <h1 class="screen-title">へんしんラボ</h1>
      ${naviComment('tsuki', '円を細かく切って、上下交互に並べ替えてみよう。分け方を変えると、形の近づき方が変わるよ。')}
      <div id="labRoot"></div>
      <div class="lab-point">
        <h2>わかったこと</h2>
        <ul>
          <li>並べ替えた形の <b>たて</b> は、円の <b>半径</b> と同じ。</li>
          <li><b>横</b> は、円周の半分。円周は 直径 × 3.14 だから、横 ＝ 半径 × 3.14。</li>
          <li>長方形の面積は たて × 横。だから円の面積は <b>半径 × 半径 × 3.14</b>。</li>
        </ul>
      </div>
    </section>
  `);
}

// ---------- 練習（クイズ） ----------
let session = null;
function buildSession(missionId) {
  const rand = Math.random;
  const list = [];
  const push = q => { if (q && !list.some(x => x.sig === q.sig)) list.push(q); };
  if (missionId === 'm4') {
    const shuffled = [...FIXED_COMPOSITE].sort(() => rand() - 0.5);
    for (const q of shuffled) { push(finalizeFixed(rand, q)); if (list.length >= 10) break; }
  } else if (missionId === 'm5') {
    const words = [...FIXED_WORD].sort(() => rand() - 0.5).map(q => finalizeFixed(rand, q));
    for (const q of words) push(q);
    let guard = 0;
    while (list.length < 10 && guard++ < 60) push(GENERATORS.m5(rand));
  } else if (missionId === 'mix') {
    for (const mid of ['m1', 'm2', 'm3']) {
      let guard = 0;
      const before = list.length;
      while (list.length < before + 2 && guard++ < 40) push(GENERATORS[mid](rand));
    }
    const comp = [...FIXED_COMPOSITE].sort(() => rand() - 0.5);
    for (const q of comp) { push(finalizeFixed(rand, q)); if (list.filter(x => x.mission === 'm4').length >= 2) break; }
    const words = [...FIXED_WORD].sort(() => rand() - 0.5);
    for (const q of words) { push(finalizeFixed(rand, q)); if (list.filter(x => x.mission === 'm5').length >= 1) break; }
    let guard = 0;
    while (list.length < 10 && guard++ < 60) push(GENERATORS.m5(rand));
  } else {
    let guard = 0;
    while (list.length < 10 && guard++ < 80) push(GENERATORS[missionId](rand));
  }
  return list.sort(() => rand() - 0.5);
}
function startSession(missionId, retryList = null) {
  const isRetry = Array.isArray(retryList);
  session = {
    mission: missionId, isRetry,
    list: isRetry ? retryList : buildSession(missionId),
    idx: 0, score: 0, hintStage: 0, answered: false, chosen: -1
  };
  if (!session.list.length) { screen = 'home'; render(); return; }
  screen = 'quiz';
  sounds.play('start');
  render();
}
function quizHTML() {
  const q = session.list[session.idx];
  const m = session.isRetry ? null : missionById(session.mission === 'mix' ? q.mission : session.mission);
  const faceKey = session.isRetry ? 'saku' : (missionById(q.mission) || {}).navi || 'sora';
  const n = NAVI[faceKey];
  const total = session.list.length;
  const pct = Math.round((session.idx / total) * 100);
  const title = session.isRetry ? '再挑戦' : session.mission === 'mix' ? 'まぜまぜ' : m.name;
  let face = n.face;
  let comment = session.isRetry ? '前にまちがえた問題だよ。今度こそ こくふくしよう。' : (missionById(q.mission) || {}).comment || '';
  if (session.answered) {
    const ok = session.chosen === q.answer;
    face = expr(CHAR_KEY[n.name], ok ? '08-celebrating' : '07-encouraging');
    comment = ok ? 'その調子！' : 'だいじょうぶ。解説で確かめよう。';
  }
  const choices = q.choices.map((c, i) => {
    let cls = 'choice-btn';
    if (session.answered) {
      if (i === q.answer) cls += ' correct';
      else if (i === session.chosen) cls += ' wrong';
      else cls += ' dim';
    }
    return `<button class="${cls}" data-action="choose" data-i="${i}" ${session.answered ? 'disabled' : ''}>${fmt(c.v)}<span class="choice-unit">${q.unit === 'm' ? 'm²' : 'cm²'}</span></button>`;
  }).join('');
  let feedback = '';
  if (session.answered) {
    const ok = session.chosen === q.answer;
    const chosenTag = q.choices[session.chosen]?.tag;
    const note = !ok && q.wrongNotes && q.wrongNotes[chosenTag]
      ? `<div class="wrong-note"><b>まちがいポイント</b><p>${escapeHtml(q.wrongNotes[chosenTag])}</p></div>` : '';
    feedback = `
    <div class="feedback ${ok ? 'ok' : 'ng'}">
      <div class="feedback-head">${ok ? '⭕ 正解！' : '❌ ちがうよ'} <span>答えは ${fmt(q.choices[q.answer].v)}${q.unit === 'm' ? 'm²' : 'cm²'}</span></div>
      ${note}
      <ol class="steps">${q.steps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ol>
      <button class="next-btn" data-action="next">${session.idx + 1 >= total ? '結果を見る' : '次へ →'}</button>
    </div>`;
  }
  const hintBox = !session.answered && session.hintStage > 0
    ? `<div class="hint-box">${q.hint.slice(0, session.hintStage).map(h => `<p>💡 ${escapeHtml(h)}</p>`).join('')}</div>` : '';
  return shell(`
    <div class="quiz-head">
      <button class="back-btn" data-action="home">← やめる</button>
      <div class="quiz-title">${title}</div>
      <div class="quiz-progress"><span>${session.idx + 1} / ${total} 問目</span><div class="progress-bar"><i style="width:${pct}%"></i></div></div>
    </div>
    <section class="card quiz-card">
      ${naviComment(faceKey, comment)}
      ${figureSVG(q.fig)}
      <p class="question-text">${escapeHtml(q.text)}</p>
      ${hintBox}
      <div class="choices">${choices}</div>
      ${!session.answered ? `<button class="hint-btn" data-action="hint" ${session.hintStage >= q.hint.length ? 'disabled' : ''}>💡 ヒント（${session.hintStage}/${q.hint.length}）</button>` : ''}
      ${feedback}
    </section>
  `);
}
function answerQuestion(i) {
  const q = session.list[session.idx];
  if (session.answered) return;
  session.answered = true;
  session.chosen = i;
  const ok = i === q.answer;
  const st = statMission(q.mission);
  st.a += 1;
  state.stats.answered += 1;
  if (ok) {
    st.c += 1;
    state.stats.correct += 1;
    session.score += 1;
    sounds.play('correct');
    const before = state.mistakes.length;
    state.mistakes = state.mistakes.filter(m => m.q.sig !== q.sig);
    if (before !== state.mistakes.length) state.stats.retryCleared += 1;
  } else {
    sounds.play('wrong');
    if (!state.mistakes.some(m => m.q.sig === q.sig)) {
      state.mistakes.push({ sig: q.sig, mission: q.mission, q: JSON.parse(JSON.stringify(q)), ts: Date.now() });
    }
  }
  persist();
  checkBadges();
  render();
  if (ok) fxPop(document.querySelector('.feedback'));
}
function nextQuestion() {
  session.idx += 1;
  session.answered = false;
  session.chosen = -1;
  session.hintStage = 0;
  if (session.idx >= session.list.length) {
    screen = 'result';
    if (!session.isRetry) {
      if (session.score === session.list.length) state.stats.perfectSessions += 1;
      if (session.mission === 'mix') state.stats.mixFinished += 1;
      persist();
      checkBadges();
    }
    sounds.play(session.score >= 7 ? 'clear' : 'page');
  } else {
    sounds.play('page');
  }
  render();
  if (screen === 'result' && session.score >= 7) fxConfetti(document.querySelector('.result-card'), session.score === session.list.length ? 28 : 16);
}

// ---------- 結果 ----------
function resultHTML() {
  const total = session.list.length;
  const score = session.score;
  const pose = score >= Math.ceil(total * 0.7)
    ? `${NAVI_BASE}/characters/riku/fullbody/correct.webp`
    : `${NAVI_BASE}/characters/saku/fullbody/retry.webp`;
  const msg = session.isRetry
    ? (score === total ? 'ぜんぶ こくふくできた！' : `${score}問 こくふく！ 残りは ${state.mistakes.length}問`)
    : score === total ? '全問正解！パーフェクト！'
      : score >= 7 ? 'よくできました！'
        : 'おつかれさま。まちがえた問題は「再挑戦」に残っているよ。';
  return shell(`
    <section class="card result-card">
      <img class="result-pose" src="${pose}" alt="">
      <h1>${session.isRetry ? '再挑戦の結果' : '結果'}</h1>
      <p class="result-score">${total}問中 <b>${score}問</b> 正解</p>
      <p class="result-msg">${msg}</p>
      <div class="result-btns">
        ${session.isRetry
          ? '<button class="next-btn" data-action="home">ホームへ</button>'
          : `<button class="next-btn" data-action="again">もう一度</button><button class="sub-btn" data-action="home">ホームへ</button>`}
        ${state.mistakes.length ? '<button class="sub-btn" data-action="retry">まちがえた問題へ</button>' : ''}
      </div>
    </section>
  `);
}

// ---------- 再挑戦リスト ----------
function retryHTML() {
  const groups = {};
  for (const m of state.mistakes) {
    const name = m.mission === 'mix' ? 'まぜまぜ' : (missionById(m.mission)?.name || m.mission);
    (groups[name] = groups[name] || []).push(m);
  }
  const items = Object.entries(groups).map(([name, arr]) => `
    <div class="retry-group"><h3>${escapeHtml(name)}（${arr.length}問）</h3>
    ${arr.map(m => `<div class="retry-item"><span>${escapeHtml(m.q.text)}</span><button class="mini-del" data-action="del-mistake" data-sig="${escapeHtml(m.q.sig)}" aria-label="記録から消す">✕</button></div>`).join('')}
    </div>`).join('');
  return shell(`
    <button class="back-btn" data-action="home">← ホームへ</button>
    <section class="card">
      <h1 class="screen-title">まちがえた問題</h1>
      ${naviComment('saku', state.mistakes.length ? '再挑戦して正解すると、記録から消えるよ（こくふく）。' : '今は記録がないよ。練習でまちがえると、ここにたまるよ。')}
      ${state.mistakes.length ? `
        <button class="next-btn retry-start" data-action="retry-start">再挑戦をはじめる（${Math.min(10, state.mistakes.length)}問）</button>
        ${items}` : ''}
    </section>
  `);
}

// ---------- 学習の記録 ----------
function recordsHTML() {
  const t = state.stats;
  const rows = MISSIONS.map(m => {
    const st = t.byMission[m.id] || { a: 0, c: 0 };
    return `<div class="record-line"><span>${m.name}</span><b>${st.a}問中 ${st.c}問 正解</b></div>`;
  }).join('');
  const badgeGrid = BADGES.map(b => {
    const got = state.badges.includes(b.id);
    return `<div class="badge-cell ${got ? 'got' : ''}"><img src="${b.img}" alt=""><b>${escapeHtml(b.name)}</b><small>${escapeHtml(b.desc)}</small></div>`;
  }).join('');
  return shell(`
    <button class="back-btn" data-action="home">← ホームへ</button>
    <section class="card">
      <h1 class="screen-title">学習の記録</h1>
      <div class="record-lines">
        <div class="record-line"><span>解いた数</span><b>${t.answered}問</b></div>
        <div class="record-line"><span>正解</span><b>${t.correct}問${t.answered ? `（正答率 ${Math.round((t.correct / t.answered) * 100)}％）` : ''}</b></div>
        <div class="record-line"><span>こくふくした問題</span><b>${t.retryCleared}問</b></div>
        <div class="record-line"><span>へんしんラボの最大</span><b>${t.labMax ? `${t.labMax}等分` : 'まだ'}</b></div>
        ${rows}
      </div>
      <h2 class="section-title">バッジ（${state.badges.length} / ${BADGES.length}）</h2>
      <div class="badge-grid">${badgeGrid}</div>
    </section>
  `);
}

// ---------- 公式モーダル ----------
function formulaModalHTML() {
  return `
  <div class="modal-backdrop" data-action="close-formula">
    <div class="modal card" role="dialog" aria-modal="true" aria-label="公式一覧">
      <h2>こうしき</h2>
      <ul class="formula-list">
        <li><b>円の面積</b> ＝ 半径 × 半径 × 3.14</li>
        <li><b>円周</b> ＝ 直径 × 3.14（＝ 2 × 半径 × 3.14）</li>
        <li><b>おうぎ形の面積</b> ＝ 円の面積 ×（中心角 ÷ 360）</li>
        <li><b>ドーナツ型</b> ＝ 外の円の面積 − 内の円の面積</li>
        <li><b>半径の逆算</b>：面積 ÷ 3.14 ＝ 半径 × 半径</li>
      </ul>
      <button class="next-btn" data-action="close-formula">とじる</button>
    </div>
  </div>`;
}

// ---------- 描画とイベント ----------
function render() {
  let html;
  if (screen === 'home') html = homeHTML();
  else if (screen === 'lab') html = labHTML();
  else if (screen === 'quiz') html = quizHTML();
  else if (screen === 'result') html = resultHTML();
  else if (screen === 'retry') html = retryHTML();
  else if (screen === 'records') html = recordsHTML();
  else html = homeHTML();
  root.innerHTML = html;
  if (screen === 'lab') {
    mountLab(document.querySelector('#labRoot'), {
      onTransform: d => {
        if (d > state.stats.labMax) {
          state.stats.labMax = d;
          persist();
          checkBadges();
        }
        sounds.play('sparkle');
      }
    });
  }
  window.scrollTo(0, 0);
}

document.addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  if (action === 'home') { screen = 'home'; session = null; sounds.play('click'); render(); }
  else if (action === 'sound') {
    state.sound = !state.sound;
    persist();
    render();
    if (state.sound) sounds.play('click');
  } else if (action === 'formula') {
    document.body.insertAdjacentHTML('beforeend', formulaModalHTML());
    sounds.play('click');
  } else if (action === 'close-formula') {
    if (e.target.classList.contains('modal-backdrop') || btn.classList.contains('next-btn')) {
      document.querySelector('.modal-backdrop')?.remove();
    }
  } else if (action === 'lab') { screen = 'lab'; sounds.play('decide'); render(); }
  else if (action === 'mission') { startSession(btn.dataset.id); }
  else if (action === 'choose') { answerQuestion(Number(btn.dataset.i)); }
  else if (action === 'hint') {
    if (session && session.hintStage < session.list[session.idx].hint.length) {
      session.hintStage += 1;
      sounds.play('hint');
      render();
    }
  } else if (action === 'next') { nextQuestion(); }
  else if (action === 'again') { startSession(session.mission); }
  else if (action === 'retry') { screen = 'retry'; sounds.play('decide'); render(); }
  else if (action === 'records') { screen = 'records'; sounds.play('decide'); render(); }
  else if (action === 'retry-start') {
    const list = state.mistakes.slice(0, 10).map(m => JSON.parse(JSON.stringify(m.q)));
    startSession('retry', list);
  } else if (action === 'del-mistake') {
    state.mistakes = state.mistakes.filter(m => m.q.sig !== btn.dataset.sig);
    persist();
    render();
  }
});

render();
