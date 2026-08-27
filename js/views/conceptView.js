import { sectorSvg } from '../diagrams/sector.js';
import { circleUnfoldingSvg, unfoldingDuration } from '../diagrams/rearrangedSlices.js?v=20260827-7';
import { fractionSteps } from '../components/fractionView.js';
import { naviGuide } from '../components/naviGuide.js';

const reducedMotion = () =>
  document.documentElement.dataset.motion === 'reduced' ||
  matchMedia('(prefers-reduced-motion: reduce)').matches;

export function conceptView(kind = 'circle') {
  const app = document.querySelector('#app');
  if (kind === 'sector') {
    let angle = 120;
    let step = 5;
    const drawSector = () => {
      app.innerHTML = `<div class="page"><div class="toolbar"><div><p class="eyebrow">しくみを知る</p><h1>おうぎ形は円の何分のいくつ？</h1></div><a class="btn btn-secondary" href="#concept/circle">円のしくみへ</a></div>
        <div class="learning-layout"><section class="panel"><div class="diagram-box">${sectorSvg({ radius: 10, angle })}</div><div class="concept-controls">${[30,45,60,90,120,135,180,216,240,270].map(value => `<button class="btn btn-secondary angle-button" data-angle="${value}" aria-pressed="${value === angle}">${value}°</button>`).join('')}</div></section>
        <section class="panel"><h2>割合への変身</h2>${naviGuide('色の部分は、円全体の何分のいくつかな？', 'thinking')}${fractionSteps(angle, step)}<div class="actions"><button class="btn btn-secondary" data-prev ${step <= 0 ? 'disabled' : ''}>一つ戻る</button><button class="btn btn-primary" data-next ${step >= 5 ? 'disabled' : ''}>次へ</button><a class="btn btn-secondary" href="#classify">見分ける練習へ</a></div></section></div></div>`;
      app.querySelectorAll('[data-angle]').forEach(button => {
        button.onclick = () => { angle = Number(button.dataset.angle); step = 0; drawSector(); };
      });
      app.querySelector('[data-prev]').onclick = () => { step--; drawSector(); };
      app.querySelector('[data-next]').onclick = () => { step++; drawSector(); };
    };
    drawSector();
    return;
  }

  let slices = 12;
  let phase = 'circle';
  let step = 0;
  let animationTimer;
  const explanations = [
    '円を同じ大きさのおうぎ形に分けます。',
    '上向き・下向きを交互に並べると、平行四辺形のような形になります。',
    '細かく分けるほど、上下のでこぼこと端の傾きが小さくなります。',
    'たては半径、よこは円周の半分です。',
    '長方形に近い形として、円の面積の式が見えてきます。'
  ];

  function startAnimation() {
    clearTimeout(animationTimer);
    step = 1;
    if (reducedMotion()) {
      phase = 'arranged';
      drawCircle();
      return;
    }
    phase = 'animating';
    drawCircle();
    animationTimer = setTimeout(() => {
      if (location.hash === '#concept/circle' && phase === 'animating') {
        phase = 'arranged';
        drawCircle();
      }
    }, (unfoldingDuration(slices) + .16) * 1000);
  }

  function drawCircle() {
    const svgState = phase === 'animating' ? 'animate' : phase;
    const showMeasures = phase === 'arranged' && step >= 3;
    const guide = phase === 'circle'
      ? '円の一切れ一切れが、どこへ動くか見てみよう。'
      : phase === 'animating'
        ? '弧を外側にして、上向き・下向きに交互に並んでいくよ。'
        : '分ける数を変えて、端とでこぼこの違いを比べよう。';
    const actionHtml = phase === 'circle'
      ? '<button class="btn btn-primary" data-arrange>並べてみる</button>'
      : phase === 'animating'
        ? '<button class="btn btn-primary" disabled>並べかえ中…</button>'
        : `<button class="btn btn-secondary" data-reset>円に戻す</button><button class="btn btn-secondary" data-replay>もう一度動かす</button>${step < 4 ? '<button class="btn btn-primary" data-next-step>次の発見</button>' : ''}`;

    app.innerHTML = `<div class="page"><div class="toolbar"><div><p class="eyebrow">しくみを知る</p><h1>円を並べかえると？</h1></div><a class="btn btn-secondary" href="#concept/sector">おうぎ形の割合へ</a></div>
      <div class="learning-layout"><section class="panel"><div class="diagram-box">${circleUnfoldingSvg({ slices, state: svgState, showMeasures, idPrefix: `concept-${slices}` })}</div><p class="figure-note">※ 図は、円を分けて並べたときの形のイメージです。</p><div class="concept-controls">${[12,18,36].map(value => `<button class="btn btn-secondary slice-button" data-slices="${value}" aria-pressed="${value === slices}">${value}等分</button>`).join('')}</div></section>
      <section class="panel"><p class="eyebrow">${phase === 'animating' ? '並べかえ中' : `${step + 1}/5`}</p>${naviGuide(guide, 'thinking')}<h2>${phase === 'animating' ? 'おうぎ形が交互に動いています。' : explanations[step]}</h2>${step >= 3 && phase === 'arranged' ? '<p><strong>たて ＝ 半径</strong></p><p><strong>よこ ＝ 円周÷2 ＝ 半径×3.14</strong></p>' : ''}${step >= 4 && phase === 'arranged' ? '<div class="feedback success"><strong>半径 × 半径 × 3.14</strong></div>' : ''}<div class="actions">${actionHtml}</div></section></div></div>`;

    app.querySelectorAll('[data-slices]').forEach(button => {
      button.onclick = () => {
        clearTimeout(animationTimer);
        slices = Number(button.dataset.slices);
        phase = 'circle';
        step = 0;
        drawCircle();
      };
    });
    app.querySelector('[data-arrange]')?.addEventListener('click', startAnimation);
    app.querySelector('[data-replay]')?.addEventListener('click', startAnimation);
    app.querySelector('[data-reset]')?.addEventListener('click', () => {
      clearTimeout(animationTimer);
      phase = 'circle';
      step = 0;
      drawCircle();
    });
    app.querySelector('[data-next-step]')?.addEventListener('click', () => {
      step = Math.min(4, step + 1);
      drawCircle();
    });
  }

  drawCircle();
}
