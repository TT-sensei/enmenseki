import { sectorSvg } from '../diagrams/sector.js';
import { fractionSteps } from '../components/fractionView.js';

function circleConceptSvg(count, step) {
  const teeth = Math.min(count / 2, 32);
  const width = 250 / teeth;
  let radii = '';
  let top = '';
  let bottom = '';
  for (let index = 0; index < count; index++) {
    const angle = index * 360 / count * Math.PI / 180;
    radii += `<line x1="135" y1="125" x2="${135 + 93 * Math.cos(angle)}" y2="${125 + 93 * Math.sin(angle)}" stroke="#fff" stroke-width="2"/>`;
  }
  for (let index = 0; index < teeth; index++) {
    top += `<path class="slice-piece" d="M${345 + index * width} 125 l${width / 2} -72 l${width / 2} 72Z" fill="${index % 2 ? '#f7b68b' : '#82bad5'}" stroke="#fff"/>`;
    bottom += `<path class="slice-piece" d="M${345 + index * width} 125 l${width / 2} 72 l${width / 2} -72Z" fill="${index % 2 ? '#82bad5' : '#f7b68b'}" stroke="#fff"/>`;
  }
  return `<svg viewBox="0 0 640 255" role="img" aria-label="円を${count}分割し、上下交互に並べ替える図">
    <g><circle cx="135" cy="125" r="93" fill="#f7b68b" stroke="#17324d" stroke-width="4"/>${radii}<circle cx="135" cy="125" r="4" fill="#17324d"/><text x="135" y="240" text-anchor="middle">${count}等分した円</text></g>
    <path d="M250 125 H315" stroke="#e96524" stroke-width="4" marker-end="url(#arrow)"/>
    <defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10Z" fill="#e96524"/></marker></defs>
    <g opacity="${step === 0 ? '.25' : '1'}">${top}${bottom}<line x1="345" y1="211" x2="595" y2="211" stroke="#17324d"/><text x="470" y="240" text-anchor="middle">横＝円周の半分</text><text x="325" y="130" transform="rotate(-90 325 130)" text-anchor="middle">縦＝半径</text></g>
  </svg>`;
}

export function conceptView(kind = 'circle') {
  const app = document.querySelector('#app');
  if (kind === 'sector') {
    let angle = 120;
    let step = 5;
    const drawSector = () => {
      app.innerHTML = `<div class="page"><div class="toolbar"><div><p class="eyebrow">しくみを知る</p><h1>おうぎ形は円の何分のいくつ？</h1></div><a class="btn btn-secondary" href="#concept/circle">円のしくみへ</a></div>
        <div class="learning-layout"><section class="panel"><div class="diagram-box">${sectorSvg({ radius: 10, angle })}</div><div class="concept-controls">${[30,45,60,90,120,135,180,216,240,270].map(value => `<button class="btn btn-secondary angle-button" data-angle="${value}" aria-pressed="${value === angle}">${value}°</button>`).join('')}</div></section>
        <section class="panel"><h2>割合への変身</h2>${fractionSteps(angle, step)}<div class="actions"><button class="btn btn-secondary" data-prev ${step <= 0 ? 'disabled' : ''}>一つ戻る</button><button class="btn btn-primary" data-next ${step >= 5 ? 'disabled' : ''}>次へ</button><a class="btn btn-secondary" href="#classify">見分ける練習へ</a></div></section></div></div>`;
      app.querySelectorAll('[data-angle]').forEach(button => {
        button.onclick = () => { angle = Number(button.dataset.angle); step = 0; drawSector(); };
      });
      app.querySelector('[data-prev]').onclick = () => { step--; drawSector(); };
      app.querySelector('[data-next]').onclick = () => { step++; drawSector(); };
    };
    drawSector();
    return;
  }

  let slices = 16;
  let step = 0;
  const explanations = [
    '円を同じ大きさのおうぎ形に分けます。',
    '上下交互に並べると、長方形に近づきます。',
    '縦は円の半径です。',
    '横は円周の半分＝半径×3.14です。',
    '面積は 半径×半径×3.14 になります。'
  ];
  const drawCircle = () => {
    app.innerHTML = `<div class="page"><div class="toolbar"><div><p class="eyebrow">しくみを知る</p><h1>円は長方形に近づく</h1></div><a class="btn btn-secondary" href="#concept/sector">おうぎ形の割合へ</a></div>
      <div class="learning-layout"><section class="panel"><div class="diagram-box">${circleConceptSvg(slices, step)}</div><div class="concept-controls">${[8,16,32,64].map(value => `<button class="btn btn-secondary slice-button" data-slices="${value}" aria-pressed="${value === slices}">${value}分割</button>`).join('')}</div></section>
      <section class="panel"><p class="eyebrow">${step + 1}/5</p><h2>${explanations[step]}</h2>${step >= 2 ? '<p>縦 ＝ 半径</p>' : ''}${step >= 3 ? '<p>横 ＝ 円周÷2 ＝ 半径×3.14</p>' : ''}${step >= 4 ? '<div class="feedback success"><strong>半径 × 半径 × 3.14</strong></div>' : ''}<div class="actions"><button class="btn btn-secondary" data-prev ${step === 0 ? 'disabled' : ''}>戻る</button><button class="btn btn-primary" data-next ${step === 4 ? 'disabled' : ''}>次へ</button></div></section></div></div>`;
    app.querySelectorAll('[data-slices]').forEach(button => {
      button.onclick = () => { slices = Number(button.dataset.slices); drawCircle(); };
    });
    app.querySelector('[data-prev]').onclick = () => { step--; drawCircle(); };
    app.querySelector('[data-next]').onclick = () => { step++; drawCircle(); };
  };
  drawCircle();
}
