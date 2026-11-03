// へんしんラボ：円を等分した扇形を、上下交互に並べ替えて長方形に近づける操作。
// 円の面積＝半径×半径×3.14 の「なぜ」を体感するための、このアプリの心臓部。
import { fmt } from './diagrams.js';

const DIVISIONS = [8, 12, 18, 24, 36];
const RADII = [2, 3, 4, 5, 6, 10];
const R = 92; // 図の半径（px、模式図）
const CX = 108, CY = 150; // 元の円の中心
const BAND_Y = 196; // 並べ替え後の帯の下端
const COLORS = ['#f6a04d', '#ef7d54'];

export function mountLab(root, { onTransform } = {}) {
  let divisions = 12;
  let radius = 6;
  let transformed = false;
  let animId = null;

  root.innerHTML = `
    <div class="lab-controls">
      <div class="lab-ctl-group" role="group" aria-label="等分の数">
        <span class="lab-ctl-label">何等分にする？</span>
        <div class="lab-div-btns">${DIVISIONS.map(d => `<button class="chip-btn${d === divisions ? ' on' : ''}" data-div="${d}">${d}等分</button>`).join('')}</div>
      </div>
      <button class="lab-go-btn" data-act="go">へんしん！</button>
    </div>
    <div class="lab-stage"></div>
    <div class="lab-readout" aria-live="polite"></div>
    <div class="lab-radius">
      <span class="lab-ctl-label">半径を変えて、数を確かめよう</span>
      <div class="lab-div-btns">${RADII.map(r => `<button class="chip-btn${r === radius ? ' on' : ''}" data-r="${r}">半径${r}cm</button>`).join('')}</div>
      <p class="lab-calc"></p>
    </div>`;

  const stage = root.querySelector('.lab-stage');
  const readout = root.querySelector('.lab-readout');
  const calc = root.querySelector('.lab-calc');
  const goBtn = root.querySelector('[data-act="go"]');

  function wedgePath() {
    const th = (2 * Math.PI) / divisions;
    const s = R * Math.sin(th / 2), c = R * Math.cos(th / 2);
    return `M 0 0 L ${-s.toFixed(2)} ${-c.toFixed(2)} A ${R} ${R} 0 0 1 ${s.toFixed(2)} ${-c.toFixed(2)} Z`;
  }

  function placements() {
    // 各扇形の「円の姿」と「並べ替え後」の transform を返す
    const th = (2 * Math.PI) / divisions;
    const chord = 2 * R * Math.sin(th / 2);
    const totalW = (divisions / 2) * chord + chord / 2;
    const x0 = 330 - totalW / 2 + 130;
    return Array.from({ length: divisions }, (_, i) => {
      const srcRot = (i + 0.5) * (360 / divisions) + 90;
      const up = i % 2 === 0;
      const m = Math.floor(i / 2);
      const tx = up ? x0 + m * chord + chord / 2 : x0 + m * chord + chord;
      const ty = up ? BAND_Y : BAND_Y - R;
      const base = up ? 0 : 180;
      const tgtRot = base + 360 * Math.round((srcRot - base) / 360);
      return { src: { x: CX, y: CY, rot: srcRot }, tgt: { x: tx, y: ty, rot: tgtRot } };
    });
  }

  function render(t) {
    // t: 0=円の姿, 1=並べ替え後
    const places = placements();
    const d = wedgePath();
    const pieces = places.map((p, i) => {
      const x = p.src.x + (p.tgt.x - p.src.x) * t;
      const y = p.src.y + (p.tgt.y - p.src.y) * t;
      const rot = p.src.rot + (p.tgt.rot - p.src.rot) * t;
      return `<path d="${d}" fill="${COLORS[i % 2]}" stroke="#fff" stroke-width="1.6" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)})"/>`;
    }).join('');
    const th = (2 * Math.PI) / divisions;
    const chord = 2 * R * Math.sin(th / 2);
    const totalW = (divisions / 2) * chord + chord / 2;
    const rx = 330 - totalW / 2 + 130 - chord / 2;
    const rectOp = Math.max(0, (t - 0.65) / 0.35).toFixed(2);
    const circleOp = (1 - t).toFixed(2);
    stage.innerHTML = `
    <svg class="lab-svg" viewBox="0 0 660 300" role="img" aria-label="円を等分して並べ替える図">
      <g opacity="${circleOp}">
        <circle cx="${CX}" cy="${CY}" r="${R + 7}" fill="none" stroke="#b9c8d8" stroke-width="2" stroke-dasharray="5 5"/>
        <text x="${CX}" y="${CY + R + 26}" class="fig-caption">円（半径 ${radius}cm のつもり）</text>
      </g>
      <g opacity="${rectOp}">
        <rect x="${rx.toFixed(1)}" y="${BAND_Y - R}" width="${(totalW + chord / 2).toFixed(1)}" height="${R}" fill="none" stroke="#1f9d74" stroke-width="2.5" stroke-dasharray="7 5" rx="4"/>
        <text x="${(rx + (totalW + chord / 2) / 2).toFixed(1)}" y="${BAND_Y + 24}" class="fig-label" fill="#1f9d74" style="text-anchor:middle">横 ＝ 円周の半分 ＝ 半径 × 3.14</text>
        <text x="${(rx - 8).toFixed(1)}" y="${BAND_Y - R / 2}" class="fig-label" fill="#1f9d74" style="text-anchor:end">たて ＝ 半径</text>
      </g>
      ${pieces}
    </svg>`;
  }

  function updateReadout() {
    const half = fmt(radius * 3.14);
    const area = fmt(radius * radius * 3.14);
    calc.innerHTML = transformed
      ? `半径 ${radius}cm なら、横 ＝ ${radius} × 3.14 ＝ <b>${half}cm</b>。面積 ＝ たて × 横 ＝ ${radius} × ${half} ＝ <b>${area}cm²</b>。つまり <b>半径 × 半径 × 3.14</b> と同じだね。`
      : `半径 ${radius}cm の円周の半分は、${radius} × 3.14 ＝ <b>${half}cm</b>。並べ替えると、横の長さになるよ。`;
    readout.innerHTML = transformed
      ? `<b>${divisions}等分</b> して並べ替えると、<b>長方形に近い形</b> になったね。細かく分けるほど、まっすぐな長方形に近づくよ。たては半径、横は円周の半分（半径 × 3.14）。だから円の面積は <b>半径 × 半径 × 3.14</b> で求められるんだ。`
      : `円を ${divisions}等分 したよ。「へんしん！」を押すと、おうぎ形が上下交互に並んで、長方形みたいな形になるよ。`;
  }

  function animate(toTransformed) {
    if (animId) cancelAnimationFrame(animId);
    const from = transformed ? 1 : 0;
    const to = toTransformed ? 1 : 0;
    const start = performance.now();
    const dur = 950;
    const step = now => {
      const p = Math.min(1, (now - start) / dur);
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      render(from + (to - from) * e);
      if (p < 1) animId = requestAnimationFrame(step);
      else { transformed = toTransformed; updateReadout(); }
    };
    animId = requestAnimationFrame(step);
  }

  root.addEventListener('click', e => {
    const divBtn = e.target.closest('[data-div]');
    const rBtn = e.target.closest('[data-r]');
    if (divBtn) {
      divisions = Number(divBtn.dataset.div);
      root.querySelectorAll('[data-div]').forEach(b => b.classList.toggle('on', Number(b.dataset.div) === divisions));
      transformed = false;
      goBtn.textContent = 'へんしん！';
      render(0); updateReadout();
      return;
    }
    if (rBtn) {
      radius = Number(rBtn.dataset.r);
      root.querySelectorAll('[data-r]').forEach(b => b.classList.toggle('on', Number(b.dataset.r) === radius));
      updateReadout();
      return;
    }
    if (e.target.closest('[data-act="go"]')) {
      const next = !transformed;
      goBtn.textContent = next ? 'もとにもどす' : 'へんしん！';
      animate(next);
      if (next && onTransform) onTransform(divisions);
    }
  });

  render(0);
  updateReadout();
  return { get divisions() { return divisions; } };
}
