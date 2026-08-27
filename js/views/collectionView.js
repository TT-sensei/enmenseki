import { loadData } from '../storage.js';
import { cardCatalog, badgeUnlocks } from '../services/achievementService.js';
import { buildingLevel } from '../services/islandService.js';
import { progressSummary } from '../services/progressService.js';

const badgeSymbols = { circle: '○', sector: '◔', ring: '◎', leaf: '◈', magatama: '◐' };

export function collectionView() {
  const data = loadData();
  const unlocked = new Set(Array.isArray(data.cards) ? data.cards : []);
  const island = data.island || {};
  const progress = progressSummary();
  const earnedCount = badgeUnlocks.filter(badge => unlocked.has(badge.id)).length;
  const fragments = [
    { symbol: '◔', name: 'ピザのかけら', count: island.pizza || 0, description: '円を切って並べる体験で見つかる。' },
    { symbol: '◕', name: 'ケーキのかけら', count: island.cake || 0, description: '分数と中心角をつなぐ体験で見つかる。' },
    { symbol: '◎', name: 'レスキューのかけら', count: island.rescue || 0, description: '図形を分けて考える体験で見つかる。' }
  ];

  const badgeCards = badgeUnlocks.map(badge => {
    const card = cardCatalog[badge.id];
    const earned = unlocked.has(badge.id);
    const current = Math.min(progress.correct, badge.correct);
    return '<article class="badge-card ' + (earned ? 'is-earned' : 'is-locked') + '" data-badge-id="' + badge.id + '">' +
      '<div class="badge-emblem badge-' + badge.id + '" aria-hidden="true">' + (earned ? badgeSymbols[badge.id] : '?') + '</div>' +
      '<p class="badge-status">' + (earned ? '獲得済み' : 'ロック中') + '</p>' +
      '<h3>' + (earned ? card.name : '？？？') + '</h3>' +
      '<p class="badge-description">' + (earned ? card.description : '正解を重ねると開きます。') + '</p>' +
      '<p class="badge-condition">' + (earned ? '正解数 ' + badge.correct + '問で獲得' : '正解数 ' + current + '/' + badge.correct + '問') + '</p>' +
    '</article>';
  }).join('');

  const fragmentCards = fragments.map(item =>
    '<article class="fragment-card"><div class="mode-icon" aria-hidden="true">' + item.symbol + '</div><div><h3>' + item.name + '</h3><p>' + item.description + '</p></div><strong>' + item.count + 'こ・島レベル' + buildingLevel(item.count) + '</strong></article>'
  ).join('');

  document.querySelector('#app').innerHTML =
    '<div class="page badge-page">' +
      '<div class="toolbar"><div><p class="eyebrow">集める</p><h1>バッジ</h1><p class="lead">学習を進めると、円のひみつを表すバッジが開きます。</p></div><a class="btn btn-secondary" href="#home">島へ戻る</a></div>' +
      '<section class="panel badge-overview"><div class="badge-overview-stat"><strong>' + earnedCount + '/' + badgeUnlocks.length + '</strong><span>獲得バッジ</span></div><div class="badge-overview-stat"><strong>' + progress.correct + '</strong><span>正解数</span></div><p>バッジの手に入る条件はこれまでと同じです。できる問題から、少しずつ集めよう。</p></section>' +
      '<section class="section"><div class="section-heading"><div><p class="eyebrow">正解数で開く</p><h2>円のひみつバッジ</h2><p>ロック中のバッジも、条件を達成すると自動で開きます。</p></div><span class="route-number">' + earnedCount + '/' + badgeUnlocks.length + '</span></div><div class="badge-grid">' + badgeCards + '</div></section>' +
      '<section class="panel section fragment-panel"><div class="section-heading"><div><p class="eyebrow">学習のごほうび</p><h2>島のかけら</h2><p>ピザ・ケーキ・レスキューで手に入るかけらは、島の成長に使われます。</p></div></div><div class="fragment-grid">' + fragmentCards + '</div></section>' +
    '</div>';
}
