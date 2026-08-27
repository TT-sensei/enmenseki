import { circleUnfoldingSvg, unfoldingDuration } from '../diagrams/rearrangedSlices.js?v=20260827-8';
import { awardPiece } from '../services/islandService.js';
import { toast } from '../components/toast.js';
import { naviGuide } from '../components/naviGuide.js';

const reducedMotion = () =>
  document.documentElement.dataset.motion === 'reduced' ||
  matchMedia('(prefers-reduced-motion: reduce)').matches;

function pizzaSvg(slices, phase) {
  const state = phase === 'ready' ? 'circle' : phase === 'animating' ? 'animate' : 'arranged';
  return circleUnfoldingSvg({
    slices,
    state,
    showMeasures: phase === 'done',
    sourceX: 145,
    sourceY: 142,
    targetX: 365,
    targetY: 70,
    radius: 92,
    idPrefix: `pizza-${slices}`
  });
}

export function pizzaFactoryView() {
  const app = document.querySelector('#app');
  const rounds = [12, 18, 36];
  let round = 0;
  let phase = 'ready';
  let message = '円を同じ大きさに分けました。「並べてみる」を押そう。';
  let messageKind = '';
  let animationTimer;

  function startAnimation() {
    clearTimeout(animationTimer);
    messageKind = '';
    if (reducedMotion()) {
      phase = 'guess';
      message = '上下交互に並びました。全体は何の形に見える？';
      draw();
      return;
    }
    phase = 'animating';
    message = 'おうぎ形が、上向き・下向きに交互に動いています。';
    draw();
    animationTimer = setTimeout(() => {
      if (location.hash === '#play/pizza' && phase === 'animating') {
        phase = 'guess';
        message = '全部並びました。全体は何の形に見える？';
        draw();
      }
    }, (unfoldingDuration(rounds[round]) + .16) * 1000);
  }

  function draw() {
    const slices = rounds[round];
    const heading = phase === 'ready'
      ? '円を並べかえてみよう'
      : phase === 'animating'
        ? '一切れずつ動いているよ'
        : phase === 'guess'
          ? '何の形に見える？'
          : '平行四辺形のような形になった！';
    const eyebrow = phase === 'ready'
      ? '分けて見る'
      : phase === 'animating'
        ? '動きを見る'
        : phase === 'guess'
          ? '形を見つける'
          : 'ひみつ発見！';
    const guide = phase === 'ready'
      ? '一切れずつは、おうぎ形になっているね。'
      : phase === 'animating'
        ? '弧が上・下・上・下と交互になるところを見よう。'
        : phase === 'guess'
          ? '上下のでこぼこを、少し遠くから見てみよう。'
          : '細かく分けるほど、でこぼこと端の傾きが小さくなるよ。';

    app.innerHTML = `<div class="page play-shell"><div class="mission-banner"><div><strong>ピザこうじょう</strong><p>ミッション ${round + 1}/3　${slices}等分した円</p></div><a class="btn btn-secondary" href="#home">ホームへ戻る</a></div>
      <div class="play-board"><section class="game-stage">${pizzaSvg(slices, phase)}</section><aside class="panel game-panel"><p class="eyebrow">${eyebrow}</p><h1>${heading}</h1><div class="piece-counter">${slices}等分</div><div class="game-message ${messageKind}">${message}</div>${naviGuide(guide)}
      ${phase === 'ready' ? '<button class="btn btn-primary" data-start>並べてみる</button><p class="small-note">式の計算はまだしません。扇形の動きだけを見よう。</p>' : ''}
      ${phase === 'animating' ? '<button class="btn btn-primary" disabled>並べかえ中…</button>' : ''}
      ${phase === 'guess' ? `<div class="choice-list">${['三角形','平行四辺形','円'].map(choice => `<button class="choice game-choice" data-shape="${choice}">${choice}</button>`).join('')}</div>` : ''}
      ${phase === 'done' ? `<div class="feedback success"><p><strong>たては半径</strong></p><p><strong>よこは円周の半分</strong></p><p>細かく分けるほど、長方形に近い平行四辺形として考えられます。</p></div><span class="reward-pop">◔ まるのかけらを1こゲット！</span><button class="btn btn-primary" data-next>${round === rounds.length - 1 ? 'ホームへ戻る' : 'もっと細かく分ける'}</button>` : ''}
      </aside></div></div>`;
    bind();
  }

  function bind() {
    app.querySelector('[data-start]')?.addEventListener('click', startAnimation);
    app.querySelectorAll('[data-shape]').forEach(button => {
      button.onclick = () => {
        if (button.dataset.shape === '平行四辺形') {
          phase = 'done';
          messageKind = 'good';
          message = 'その通り！ 扇形がかみ合って、平行四辺形のような形になったね。';
          awardPiece('pizza');
          toast('まるのかけらをゲット！');
        } else {
          messageKind = 'oops';
          message = 'おしい！ 左右の端が同じ向きに傾いていることに注目しよう。';
        }
        draw();
      };
    });
    app.querySelector('[data-next]')?.addEventListener('click', () => {
      clearTimeout(animationTimer);
      if (round === rounds.length - 1) {
        location.hash = '#home';
        return;
      }
      round++;
      phase = 'ready';
      messageKind = '';
      message = '今度はもっと細かく分けた円です。形の違いを比べよう。';
      draw();
    });
  }

  draw();
}
