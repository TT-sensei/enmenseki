import { sectorPath } from '../diagrams/sector.js';
import { simplifyFraction } from '../utils/fractions.js';
import { awardPiece } from '../services/islandService.js';
import { toast } from '../components/toast.js';

const missions = [
  { total: 8, target: 2, title: '8切れのうち、2切れをぬろう', after: '2/8 は、上と下を2でわると 1/4。円の4分の1だね。' },
  { total: 4, target: 1, title: '円の4分の1をぬろう', after: '4つに同じように分けた1つ分。これが円の4分の1。' },
  { total: 4, target: 1, title: '1周360°の4分の1をぬろう', after: '360°を4人で同じように分けると、1人分は90°。' }
];

function cakeSvg(mission, selected, done) {
  const cx = 200, cy = 185, radius = 135, angle = 360 / mission.total;
  const pieces = Array.from({ length: mission.total }, (_, index) => `<path class="cake-piece ${selected.has(index) ? 'selected' : ''}" data-cake-piece="${index}" tabindex="0" role="button" aria-label="${index + 1}切れ目${selected.has(index) ? '、選択中' : ''}" d="${sectorPath(cx, cy, radius, angle)}" transform="rotate(${index * angle} ${cx} ${cy})" fill="${selected.has(index) ? '#f09a65' : '#fff4c9'}" stroke="#fff" stroke-width="4"/>`).join('');
  const angleLabel = done && mission === missions[2] ? `<path d="M200 185 L200 110 A75 75 0 0 1 275 185" fill="none" stroke="#17324d" stroke-width="4"/><text x="250" y="140" font-size="22" font-weight="800">90°</text>` : '';
  return `<svg viewBox="0 0 400 380" role="img" aria-label="${mission.total}切れに分けた円">${pieces}<circle cx="${cx}" cy="${cy}" r="6" fill="#17324d"/>${angleLabel}<text x="200" y="355" text-anchor="middle" font-size="20">${mission.total}切れのうち ${selected.size}切れ</text></svg>`;
}

export function cakeShopView() {
  const app = document.querySelector('#app');
  let missionIndex = 0;
  let selected = new Set();
  let done = false;
  let message = 'ケーキをタップして、色をぬろう。';
  let messageKind = '';

  function fractionResult(mission) {
    const fraction = simplifyFraction(mission.target, mission.total);
    return `<div class="built-expression"><span class="fraction"><span>${mission.target}</span><span>${mission.total}</span></span>　→　<span class="fraction"><span>${fraction.numerator}</span><span>${fraction.denominator}</span></span></div>`;
  }

  function draw() {
    const mission = missions[missionIndex];
    app.innerHTML = `<div class="page play-shell"><div class="mission-banner"><div><strong>ケーキショップ</strong><p>注文 ${missionIndex + 1}/3</p></div><a class="btn btn-secondary" href="#home">島へ戻る</a></div><div class="play-board"><section class="game-stage">${cakeSvg(mission, selected, done)}</section><aside class="panel game-panel"><p class="eyebrow">ぬって見つける</p><h1>${mission.title}</h1><div class="piece-counter">ぬった数 ${selected.size}/${mission.target}</div><div class="game-message ${messageKind}">${message}</div>${done ? `${fractionResult(mission)}<div class="feedback success">${mission.after}</div><span class="reward-pop">◕ おうぎ形のかけらを1こゲット！</span><button class="btn btn-primary" data-next>${missionIndex === missions.length - 1 ? '島へ戻る' : '次の注文'}</button>` : '<button class="btn btn-primary" data-check>これでOK</button><p class="small-note">多くぬったときは、もう一度タップすると消せます。</p>'}</aside></div></div>`;
    bind();
  }

  function togglePiece(index) {
    if (done) return;
    selected.has(index) ? selected.delete(index) : selected.add(index);
    messageKind = '';
    message = selected.size > missions[missionIndex].target ? 'おっと、少し多いみたい。色が多すぎるところをタップして戻そう。' : 'いいね。ぬった切れの数を数えてみよう。';
    draw();
  }

  function bind() {
    app.querySelectorAll('[data-cake-piece]').forEach(piece => {
      const action = () => togglePiece(Number(piece.dataset.cakePiece));
      piece.onclick = action;
      piece.onkeydown = event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); action(); } };
    });
    app.querySelector('[data-check]')?.addEventListener('click', () => {
      const mission = missions[missionIndex];
      if (selected.size === mission.target) {
        done = true; messageKind = 'good'; message = 'ぴったり！ ぬった部分と円全体を比べよう。'; awardPiece('cake'); toast('おうぎ形のかけらをゲット！');
      } else if (selected.size < mission.target) {
        messageKind = 'oops'; message = `あと${mission.target - selected.size}切れ。色のついていないケーキをタップしよう。`;
      } else {
        messageKind = 'oops'; message = `${selected.size - mission.target}切れ多いよ。ぬったところをタップして戻そう。`;
      }
      draw();
    });
    app.querySelector('[data-next]')?.addEventListener('click', () => {
      if (missionIndex === missions.length - 1) { location.hash = '#home'; return; }
      missionIndex++; selected = new Set(); done = false; messageKind = ''; message = 'ケーキをタップして、色をぬろう。'; draw();
    });
  }
  draw();
}
