import { sectorPath } from '../diagrams/sector.js';
import { simplifyFraction } from '../utils/fractions.js';
import { awardPiece } from '../services/islandService.js';
import { toast } from '../components/toast.js';
import { naviGuide } from '../components/naviGuide.js';

// 色塗りから分数へ進み、続けて中心角を選ぶ6つの短いミッション。
const missions = [
  { total: 8, target: 2, title: '8切れのうち、2切れをぬろう', angleChoices: [45, 90, 180] },
  { total: 6, target: 2, title: '6切れのうち、2切れをぬろう', angleChoices: [60, 120, 180] },
  { total: 4, target: 1, title: '円の4分の1をぬろう', angleChoices: [45, 90, 120] },
  { total: 6, target: 1, title: '円の6分の1をぬろう', angleChoices: [30, 60, 90] },
  { total: 3, target: 1, title: '円の3分の1をぬろう', angleChoices: [90, 120, 180] },
  { total: 8, target: 3, title: '8切れのうち、3切れをぬろう', angleChoices: [90, 135, 180] }
].map(mission => ({ ...mission, angle: 360 * mission.target / mission.total }));

function angleGuide(cx, cy, radius, angle) {
  const endRadians = (angle - 90) * Math.PI / 180;
  const endX = cx + radius * Math.cos(endRadians);
  const endY = cy + radius * Math.sin(endRadians);
  const arcRadius = 66;
  const arcEndX = cx + arcRadius * Math.cos(endRadians);
  const arcEndY = cy + arcRadius * Math.sin(endRadians);
  const largeArc = angle > 180 ? 1 : 0;
  return `<g class="center-angle-guide" fill="none" stroke="#17324d" stroke-width="5" stroke-linecap="round"><line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - radius}"/><line x1="${cx}" y1="${cy}" x2="${endX}" y2="${endY}"/><path d="M${cx} ${cy - arcRadius} A${arcRadius} ${arcRadius} 0 ${largeArc} 1 ${arcEndX} ${arcEndY}"/><circle cx="${cx}" cy="${cy}" r="8" fill="#17324d"/><text x="${cx + 16}" y="${cy - 14}" fill="#17324d" stroke="none" font-size="17" font-weight="800">中心</text></g>`;
}

function cakeSvg(mission, selected, phase) {
  const cx = 200, cy = 185, radius = 135, sliceAngle = 360 / mission.total;
  const pieces = Array.from({ length: mission.total }, (_, index) => `<path class="cake-piece ${selected.has(index) ? 'selected' : ''}" data-cake-piece="${index}" tabindex="${phase === 'paint' ? '0' : '-1'}" role="button" aria-pressed="${selected.has(index)}" aria-label="${index + 1}切れ目${selected.has(index) ? '、選択中' : ''}" d="${sectorPath(cx, cy, radius, sliceAngle)}" transform="rotate(${index * sliceAngle} ${cx} ${cy})" fill="${selected.has(index) ? '#f09a65' : '#fff4c9'}" stroke="#fff" stroke-width="4"/>`).join('');
  const showAngle = phase === 'angle' || phase === 'done';
  return `<svg viewBox="0 0 400 390" role="img" aria-label="${mission.total}切れに分けた円。中心角は${showAngle ? `${mission.angle}度` : 'これから考える'}">${pieces}<circle cx="${cx}" cy="${cy}" r="6" fill="#17324d"/>${showAngle ? angleGuide(cx, cy, radius, mission.angle) : ''}<text data-cake-count x="200" y="354" text-anchor="middle" font-size="20">${mission.total}切れのうち ${selected.size}切れ</text>${showAngle ? `<text x="200" y="382" text-anchor="middle" font-size="18" font-weight="800">円1周 360° のうち、色の部分は何度？</text>` : ''}</svg>`;
}

export function cakeShopView() {
  const app = document.querySelector('#app');
  let missionIndex = 0;
  let selected = new Set();
  let phase = 'paint';
  let message = 'ケーキをタップして、色をぬろう。';
  let messageKind = '';

  function fractionResult(mission) {
    const fraction = simplifyFraction(mission.target, mission.total);
    return `<div class="built-expression"><span class="fraction"><span>${mission.target}</span><span>${mission.total}</span></span>　→　<span class="fraction"><span>${fraction.numerator}</span><span>${fraction.denominator}</span></span>　→　<strong>中心角 ${mission.angle}°</strong></div>`;
  }

  function draw() {
    const mission = missions[missionIndex];
    const heading = phase === 'paint' ? mission.title : phase === 'angle' ? '色の部分の中心角は？' : '分数と中心角がつながった！';
    app.innerHTML = `<div class="page play-shell"><div class="mission-banner"><div><strong>ケーキショップ</strong><p>注文 ${missionIndex + 1}/${missions.length}</p></div><a class="btn btn-secondary" href="#home">島へ戻る</a></div><div class="play-board"><section class="game-stage">${cakeSvg(mission, selected, phase)}</section><aside class="panel game-panel"><p class="eyebrow">${phase === 'paint' ? 'ぬって見つける' : '中心角を見つける'}</p><h1>${heading}</h1><div class="piece-counter" data-piece-counter>${phase === 'paint' ? `ぬった数 ${selected.size}/${mission.target}` : `円1周は360°`}</div><div class="game-message ${messageKind}" data-game-message>${message}</div>${naviGuide(phase === 'paint' ? 'ぬった切れ数は、円全体の何分のいくつかな？' : phase === 'angle' ? '中心からの開きに注目しよう。' : '分数と中心角がつながったね。')}${phase === 'paint' ? '<button class="btn btn-primary" data-check>これでOK</button><p class="small-note">多くぬったときは、もう一度タップすると消せます。</p>' : phase === 'angle' ? `<div class="choice-list">${mission.angleChoices.map(angle => `<button class="choice game-choice" data-angle="${angle}">${angle}°</button>`).join('')}</div><p class="small-note">中心からのびる2本の線と、その間の開きに注目しよう。</p>` : `${fractionResult(mission)}<div class="feedback success">${mission.target}/${mission.total}は円全体の${simplifyFraction(mission.target, mission.total).denominator}分の${simplifyFraction(mission.target, mission.total).numerator}。360°の同じ割合が中心角${mission.angle}°だね。</div><span class="reward-pop">◕ おうぎ形のかけらを1こゲット！</span><button class="btn btn-primary" data-next>${missionIndex === missions.length - 1 ? '島へ戻る' : '次の注文'}</button>`}</aside></div></div>`;
    bind();
  }

  function updatePaintScreen() {
    const mission = missions[missionIndex];
    app.querySelectorAll('[data-cake-piece]').forEach(piece => {
      const index = Number(piece.dataset.cakePiece);
      const isSelected = selected.has(index);
      piece.classList.toggle('selected', isSelected);
      piece.setAttribute('aria-pressed', String(isSelected));
      piece.setAttribute('aria-label', `${index + 1}切れ目${isSelected ? '、選択中' : ''}`);
      piece.setAttribute('fill', isSelected ? '#f09a65' : '#fff4c9');
    });
    app.querySelector('[data-cake-count]').textContent = `${mission.total}切れのうち ${selected.size}切れ`;
    app.querySelector('[data-piece-counter]').textContent = `ぬった数 ${selected.size}/${mission.target}`;
    const gameMessage = app.querySelector('[data-game-message]');
    gameMessage.className = `game-message ${messageKind}`;
    gameMessage.textContent = message;
  }

  function togglePiece(index) {
    if (phase !== 'paint') return;
    selected.has(index) ? selected.delete(index) : selected.add(index);
    messageKind = '';
    message = selected.size > missions[missionIndex].target ? '少し多いみたい。色が多すぎるところをタップして戻そう。' : 'いいね。ぬった切れの数を数えてみよう。';
    updatePaintScreen();
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
        // 中心角を見やすくするため、選んだ切れを中心から連続する位置へ集める。
        selected = new Set(Array.from({ length: mission.target }, (_, index) => index));
        phase = 'angle'; messageKind = 'good'; message = 'ぴったり！ 色の部分をひとつに集めたよ。中心の開きを見よう。';
      } else if (selected.size < mission.target) {
        messageKind = 'oops'; message = `あと${mission.target - selected.size}切れ。色のついていないケーキをタップしよう。`;
      } else {
        messageKind = 'oops'; message = `${selected.size - mission.target}切れ多いよ。ぬったところをタップして戻そう。`;
      }
      draw();
    });
    app.querySelectorAll('[data-angle]').forEach(button => {
      button.onclick = () => {
        const mission = missions[missionIndex];
        if (Number(button.dataset.angle) === mission.angle) {
          phase = 'done'; messageKind = 'good'; message = `正解！ 360°の${mission.target}/${mission.total}は${mission.angle}°。`; awardPiece('cake'); toast('おうぎ形のかけらをゲット！');
        } else {
          messageKind = 'oops'; message = `円1周360°を${mission.total}こに同じように分け、${mission.target}こ分を考えよう。`;
        }
        draw();
      };
    });
    app.querySelector('[data-next]')?.addEventListener('click', () => {
      if (missionIndex === missions.length - 1) { location.hash = '#home'; return; }
      missionIndex++; selected = new Set(); phase = 'paint'; messageKind = ''; message = 'ケーキをタップして、色をぬろう。'; draw();
    });
  }
  draw();
}
