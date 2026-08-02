import { stages } from '../data/stages.js';
import { progressSummary } from '../services/progressService.js';
import { getIslandProgress, buildingLevel } from '../services/islandService.js';

const dots = level => `<span class="level-dots" aria-label="島の成長レベル${level}">${[1,2,3].map(n => `<span class="level-dot ${n <= level ? 'on' : ''}"></span>`).join('')}</span>`;

function building(icon, name, count) {
  const level = buildingLevel(count);
  return `<div class="island-building ${level ? 'unlocked' : ''} ${level >= 3 ? 'complete' : ''}"><div class="building-shape" aria-hidden="true">${icon}</div><span>${name}</span></div>`;
}

export function homeView() {
  const app = document.querySelector('#app');
  const progress = progressSummary();
  const island = getIslandProgress();
  const levels = {
    pizza: buildingLevel(island.pizza),
    cake: buildingLevel(island.cake),
    rescue: buildingLevel(island.rescue),
    tower: Math.min(3, Math.floor(progress.correct / 5))
  };
  app.innerHTML = `<div class="page">
    <section class="island-hero">
      <span class="island-cloud" style="top:52px;right:13%" aria-hidden="true"></span>
      <span class="island-cloud" style="top:135px;right:38%;transform:scale(.65)" aria-hidden="true"></span>
      <div class="island-copy"><p class="eyebrow">小学6年生・円の面積</p><h1>まるのひみつ島</h1><p class="lead">さわって、動かして、ひみつを見つけよう。できることが増えると、島も少しずつ育つよ。</p><div class="actions"><a class="btn btn-primary" href="#play/pizza">島をたんけんする</a><span class="chip">集めたかけら ${island.total}こ</span></div></div>
      <div class="island-map" aria-hidden="true"></div>
      <div class="island-buildings">${building('◔','ピザ',island.pizza)}${building('◕','ケーキ',island.cake)}${building('◎','レスキュー',island.rescue)}${building('△','タワー',progress.correct)}</div>
    </section>
    <section class="section"><div class="toolbar"><div><h2>どこへ行く？</h2><p>最初は「見る・動かす」だけで大丈夫。少しずつ式へ進みます。</p></div><span class="chip">おすすめ：ピザこうじょう</span></div>
      <div class="adventure-grid">
        <a class="adventure-card pizza" href="#play/pizza"><span class="adventure-art" aria-hidden="true">◔</span><p class="eyebrow">さわって動かす</p><h3>ピザこうじょう</h3><p>円を切って、長方形に変身させよう。</p>${dots(levels.pizza)}</a>
        <a class="adventure-card cake" href="#play/cake"><span class="adventure-art" aria-hidden="true">◕</span><p class="eyebrow">ぬって見つける</p><h3>ケーキショップ</h3><p>何切れ分かをぬって、分数を見つけよう。</p>${dots(levels.cake)}</a>
        <a class="adventure-card rescue" href="#play/rescue"><span class="adventure-art" aria-hidden="true">◎</span><p class="eyebrow">図で考える</p><h3>ずけいレスキュー</h3><p>道具を選んで、色の部分を助けよう。</p>${dots(levels.rescue)}</a>
        <a class="adventure-card tower" href="#challenge"><span class="adventure-art" aria-hidden="true">△</span><p class="eyebrow">じぶんで挑戦</p><h3>チャレンジタワー</h3><p>式や答えまで、自分の力で考えよう。</p>${dots(levels.tower)}</a>
      </div>
    </section>
    <section class="panel section"><div class="toolbar"><div><h2>先生・じっくり学びたい人へ</h2><p>これまでの10ステージと詳しい学習も、ここから続けられます。</p></div><div class="actions"><a class="btn btn-secondary" href="#stages">10ステージを見る</a><a class="btn btn-secondary" href="#concept/circle">しくみを詳しく見る</a></div></div></section>
  </div>`;
}

export function stagesView() {
  const app = document.querySelector('#app');
  app.innerHTML = `<div class="page"><div class="toolbar"><div><p class="eyebrow">チャレンジタワー</p><h1>じっくり考える10ステージ</h1><p class="lead">操作で分かってきたら、式や答えまで自分で考えよう。</p></div><a class="btn btn-secondary" href="#home">島へ戻る</a></div><div class="stage-grid section">${stages.map(stage => `<a class="card stage-card" href="#practice/${stage.id}"><span class="stage-number">${stage.id}</span><h3>${stage.name}</h3><p>${stage.description}</p></a>`).join('')}</div></div>`;
}
