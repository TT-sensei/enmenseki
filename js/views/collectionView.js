import { loadData } from '../storage.js';
import { cardCatalog } from '../services/achievementService.js';
import { buildingLevel } from '../services/islandService.js';

export function collectionView() {
  const data = loadData();
  const unlocked = data.cards;
  const island = data.island;
  const fragments = [
    { id: 'pizza', symbol: '◔', name: 'まるのかけら', count: island.pizza, description: '円を切って並べると、長方形に近づく。' },
    { id: 'cake', symbol: '◕', name: 'おうぎ形のかけら', count: island.cake, description: 'ぬった切れ数が、円の何分のいくつかを表す。' },
    { id: 'rescue', symbol: '◎', name: 'ずけいのかけら', count: island.rescue, description: '図の動きが、足す・引く・何個分の式になる。' }
  ];
  document.querySelector('#app').innerHTML = `<div class="page"><p class="eyebrow">かけら図鑑</p><h1>見つけたまるのひみつ</h1><p class="lead">集めたかけらには、遊びながら見つけた算数のひみつが記録されます。</p><div class="card-grid">${fragments.map(item => `<article class="card"><div class="mode-icon" aria-hidden="true">${item.symbol}</div><h2>${item.name}</h2><p>${item.description}</p><strong>${item.count}こ・島レベル${buildingLevel(item.count)}</strong></article>`).join('')}</div><section class="section"><h2>チャレンジで見つけた図形</h2><div class="card-grid">${Object.entries(cardCatalog).map(([id,card]) => `<article class="card" style="opacity:${unlocked.includes(id) ? 1 : .48}"><div class="mode-icon" aria-hidden="true">${unlocked.includes(id) ? '◉' : '◌'}</div><h3>${unlocked.includes(id) ? card.name : 'まだ見つけていない図形'}</h3><p>${unlocked.includes(id) ? card.description : 'チャレンジタワーで見つけよう。'}</p></article>`).join('')}</div></section></div>`;
}
