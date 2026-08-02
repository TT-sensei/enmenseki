import { sectorPath } from '../diagrams/sector.js';
import { awardPiece } from '../services/islandService.js';
import { toast } from '../components/toast.js';

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
    // 弧を外側、中心（とがった部分）を内側へ向け、上下交互に並べる。
    const d = top
      ? `M${x} 88 A78 78 0 0 0 ${x + width} 88 L${x + width / 2} 218Z`
      : `M${x} 218 A78 78 0 0 1 ${x + width} 218 L${x + width / 2} 88Z`;
    return `<path class="arranged-piece" d="${d}" fill="${index % 2 ? '#f7b17e' : '#ffd28f'}" stroke="#fff" stroke-width="2"/>`;
  }).join('');
  return `<svg viewBox="0 0 640 310" role="img" aria-label="${slices}切れのピザを、弧を上下にして交互に並べ替える図"><g>${pieces}<circle cx="${cx}" cy="${cy}" r="5" fill="#17324d"/><text x="135" y="286" text-anchor="middle" font-size="18">のこり ${slices - moved}切れ</text></g><path d="M255 150 H315" stroke="#e96524" stroke-width="4"/><path d="M305 140 L318 150 L305 160" fill="none" stroke="#e96524" stroke-width="4"/>${arranged}<g opacity="${revealed ? 1 : .18}"><line x1="340" y1="75" x2="600" y2="75" stroke="#17324d" stroke-width="2" stroke-dasharray="6 6"/><line x1="340" y1="232" x2="600" y2="232" stroke="#17324d" stroke-width="2" stroke-dasharray="6 6"/><line x1="340" y1="249" x2="600" y2="249" stroke="#17324d" stroke-width="3"/><text x="470" y="278" text-anchor="middle" font-size="18">よこ＝円周の半分</text><text x="324" y="154" text-anchor="middle" transform="rotate(-90 324 154)" font-size="18">たて＝半径</text></g></svg>`;
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
      <div class="play-board"><section class="game-stage">${pizzaSvg(slices, moved, phase === 'done')}</section><aside class="panel game-panel"><p class="eyebrow">${phase === 'move' ? 'さわって動かす' : phase === 'guess' ? '見た形を当てる' : 'ひみつ発見！'}</p><h1>${phase === 'move' ? 'ピザをならべよう' : phase === 'guess' ? '何の形に見える？' : '長方形に近づいた！'}</h1><div class="piece-counter">${moved}/${slices} 切れ</div><div class="game-message ${messageKind}">${message}</div>
      ${phase === 'guess' ? `<div class="choice-list">${['さんかく','長方形','台形'].map(choice => `<button class="choice game-choice" data-shape="${choice}">${choice}</button>`).join('')}</div>` : ''}
      ${phase === 'done' ? `<div class="feedback success"><p><strong>たては半径</strong></p><p><strong>よこは円周の半分</strong></p><p>切れ目を細かくすると、もっと長方形に近づくよ。</p></div><span class="reward-pop">◔ まるのかけらを1こゲット！</span><button class="btn btn-primary" data-next>${round === rounds.length - 1 ? '島へ戻る' : 'もっと細かく切る'}</button>` : ''}
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
        if (button.dataset.shape === '長方形') {
          phase = 'done';
          messageKind = 'good';
          message = 'その通り！ ギザギザが小さくなるほど長方形に近づくね。';
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
