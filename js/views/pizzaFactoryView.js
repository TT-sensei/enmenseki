import { sectorPath } from '../diagrams/sector.js';
import { rearrangedGuidePath, rearrangedSlicePath } from '../diagrams/rearrangedSlices.js';
import { awardPiece } from '../services/islandService.js';
import { toast } from '../components/toast.js';
import { naviGuide } from '../components/naviGuide.js';

function pizzaSvg(slices, moved, revealed) {
  const cx = 135, cy = 150, radius = 104, angle = 360 / slices;
  const pieces = Array.from({ length: slices }, (_, index) => {
    const isMoved = index < moved;
    return `<path class="pizza-piece ${isMoved ? 'moved' : ''}" data-pizza-piece="${index}" tabindex="${isMoved ? '-1' : '0'}" role="button" aria-label="ピザの${index + 1}切れ目" d="${sectorPath(cx, cy, radius, angle)}" transform="rotate(${index * angle} ${cx} ${cy})" fill="${index % 2 ? '#f7b17e' : '#ffd28f'}" stroke="#fff" stroke-width="2"/>`;
  }).join('');
  const teeth = slices / 2;
  const width = 250 / teeth;
  const arranged = Array.from({ length: moved }, (_, index) => {
    const column = Math.floor(index / 2), top = index % 2 === 0;
    const x = 345 + column * width;
    // 弧を外側に残し、中心側を少しずらして平行四辺形に近づける。
    const d = rearrangedSlicePath({ x, width, topY: 76, centerY: 154, bottomY: 232, top });
    return `<path class="arranged-piece" d="${d}" fill="${index % 2 ? '#f7b17e' : '#ffd28f'}" stroke="#fff" stroke-width="2"/>`;
  }).join('');
  const guide = rearrangedGuidePath({ x: 340, width: 260, topY: 76, bottomY: 232 });
  return `<svg viewBox="0 0 640 310" role="img" aria-label="${slices}切れのピザを、弧を上下にして交互に並べ、平行四辺形に近づける図"><g>${pieces}<circle cx="${cx}" cy="${cy}" r="5" fill="#17324d"/><text x="135" y="286" text-anchor="middle" font-size="18">のこり ${slices - moved}切れ</text></g><path d="M255 150 H315" stroke="#e96524" stroke-width="4"/><path d="M305 140 L318 150 L305 160" fill="none" stroke="#e96524" stroke-width="4"/>${arranged}<g opacity="${revealed ? 1 : .18}"><path d="${guide}" fill="none" stroke="#17324d" stroke-width="2" stroke-dasharray="6 6"/><line x1="348" y1="154" x2="608" y2="154" stroke="#17324d" stroke-width="1" stroke-dasharray="3 5"/><text x="478" y="278" text-anchor="middle" font-size="18">よこ＝円周の半分</text><text x="324" y="154" text-anchor="middle" transform="rotate(-90 324 154)" font-size="18">たて＝半径</text></g></svg>`;
}

export function pizzaFactoryView() {
  const app = document.querySelector('#app');
  const rounds = [8, 16, 32];
  let round = 0;
  let moved = 0;
  let phase = 'move';
  let message = 'ピザを1切れずつタップして、右へならべよう。';
  let messageKind = '';

  function draw() {
    const slices = rounds[round];
    app.innerHTML = `<div class="page play-shell"><div class="mission-banner"><div><strong>ピザこうじょう</strong><p>ミッション ${round + 1}/3　${slices}切れのピザ</p></div><a class="btn btn-secondary" href="#home">島へ戻る</a></div>
      <div class="play-board"><section class="game-stage">${pizzaSvg(slices, moved, phase === 'done')}</section><aside class="panel game-panel"><p class="eyebrow">${phase === 'move' ? 'さわって動かす' : phase === 'guess' ? '見た形を当てる' : 'ひみつ発見！'}</p><h1>${phase === 'move' ? 'ピザをならべよう' : phase === 'guess' ? '何の形に見える？' : '平行四辺形に近づいた！'}</h1><div class="piece-counter">${moved}/${slices} 切れ</div><div class="game-message ${messageKind}">${message}</div>${naviGuide(phase === 'move' ? '上と下をそろえていくと、形が見えてくるよ。' : phase === 'guess' ? 'ギザギザの外側を、少し遠くから見てみよう。' : '切れ目を細かくすると、もっと平行四辺形に近づくね。')}
      ${phase === 'guess' ? `<div class="choice-list">${['さんかく','平行四辺形','台形'].map(choice => `<button class="choice game-choice" data-shape="${choice}">${choice}</button>`).join('')}</div>` : ''}
      ${phase === 'done' ? `<div class="feedback success"><p><strong>たては半径</strong></p><p><strong>よこは円周の半分</strong></p><p>切れ目を細かくすると、もっと平行四辺形に近づくよ。</p></div><span class="reward-pop">◔ まるのかけらを1こゲット！</span><button class="btn btn-primary" data-next>${round === rounds.length - 1 ? '島へ戻る' : 'もっと細かく切る'}</button>` : ''}
      ${phase === 'move' ? `${slices > 8 && moved >= 4 ? '<button class="btn btn-secondary" data-auto>のこりは自動でならべる</button>' : ''}<p class="small-note">式の計算はまだしません。形の変化をよく見よう。</p>` : ''}</aside></div></div>`;
    bind();
  }

  function movePiece() {
    if (phase !== 'move') return;
    moved++;
    if (moved >= rounds[round]) {
      phase = 'guess';
      message = 'ギザギザしているけれど、だんだん何の形に見えてきた？';
    }
    draw();
  }

  function bind() {
    app.querySelectorAll('[data-pizza-piece]').forEach(piece => {
      piece.onclick = movePiece;
      piece.onkeydown = event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); movePiece(); } };
    });
    app.querySelectorAll('[data-shape]').forEach(button => {
      button.onclick = () => {
        if (button.dataset.shape === '平行四辺形') {
          phase = 'done';
          messageKind = 'good';
          message = 'その通り！ ギザギザが小さくなるほど平行四辺形に近づくね。';
          awardPiece('pizza');
          toast('まるのかけらをゲット！');
        } else {
          messageKind = 'oops';
          message = 'おしい！ 上と下のでこぼこを、少し遠くから見てみよう。';
        }
        draw();
      };
    });
    app.querySelector('[data-auto]')?.addEventListener('click', () => {
      moved = rounds[round]; phase = 'guess'; message = '全部ならんだ！ だんだん何の形に見えてきた？'; draw();
    });
    app.querySelector('[data-next]')?.addEventListener('click', () => {
      if (round === rounds.length - 1) { location.hash = '#home'; return; }
      round++; moved = 0; phase = 'move'; messageKind = ''; message = '今度はもっと細かいピザ。1切れずつ右へならべよう。'; draw();
    });
  }
  draw();
}
