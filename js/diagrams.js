// 円の面積アプリ：問題図（SVG）の描画。
// 図は模式図だが、寸法ラベルは問題の数値と一致させる。
const NS = 'http://www.w3.org/2000/svg';

export function fmt(v) {
  const r = Math.round(v * 100) / 100;
  return Number.isInteger(r) ? String(r) : String(r);
}

function svgWrap(inner, vb = '0 0 320 240') {
  return `<svg class="fig-svg" viewBox="${vb}" role="img" aria-label="問題の図">${inner}</svg>`;
}
function dimLine(x1, y1, x2, y2, label, lx, ly, color = '#c94f26') {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2.5"/>` +
    `<circle cx="${x1}" cy="${y1}" r="3.5" fill="${color}"/><circle cx="${x2}" cy="${y2}" r="3.5" fill="${color}"/>` +
    `<text x="${lx}" y="${ly}" class="fig-label" fill="${color}">${label}</text>`;
}
const pt = (cx, cy, R, deg) => {
  const t = (deg * Math.PI) / 180;
  return [cx + R * Math.cos(t), cy + R * Math.sin(t)];
};

// 円（半径 or 直径の寸法つき）
export function circleFig({ r, show = 'r', caption = '' }) {
  const cx = 160, cy = 118, R = 82;
  let s = `<circle cx="${cx}" cy="${cy}" r="${R}" class="fig-fill"/>`;
  if (show === 'r') {
    const [x2, y2] = pt(cx, cy, R, -45);
    s += dimLine(cx, cy, x2, y2, `半径 ${fmt(r)}cm`, cx + 34, cy - 34);
  } else if (show === 'd') {
    s += dimLine(cx - R, cy, cx + R, cy, `直径 ${fmt(r * 2)}cm`, cx - 30, cy - 12);
    s += `<circle cx="${cx}" cy="${cy}" r="3.5" fill="#c94f26"/>`;
  }
  if (caption) s += `<text x="${cx}" y="${cy + R + 30}" class="fig-caption">${caption}</text>`;
  return svgWrap(s);
}

// おうぎ形（中心角と分数）
export function sectorFig({ r, angle, fracText }) {
  const cx = 160, cy = 128, R = 88;
  const a0 = -90 - angle / 2, a1 = -90 + angle / 2;
  const [x0, y0] = pt(cx, cy, R, a0);
  const [x1, y1] = pt(cx, cy, R, a1);
  const large = angle > 180 ? 1 : 0;
  let s = `<path d="M ${cx} ${cy} L ${x0.toFixed(1)} ${y0.toFixed(1)} A ${R} ${R} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z" class="fig-fill"/>`;
  // 中心角の弧
  const ar = 34;
  const [ax0, ay0] = pt(cx, cy, ar, a0);
  const [ax1, ay1] = pt(cx, cy, ar, a1);
  s += `<path d="M ${ax0.toFixed(1)} ${ay0.toFixed(1)} A ${ar} ${ar} 0 ${large} 1 ${ax1.toFixed(1)} ${ay1.toFixed(1)}" fill="none" stroke="#c94f26" stroke-width="2.5"/>`;
  s += `<text x="${cx}" y="${cy - ar - 8}" class="fig-label" fill="#c94f26">${angle}°</text>`;
  const [mx, my] = pt(cx, cy, R, a1);
  s += dimLine(cx, cy, mx, my, `半径 ${fmt(r)}cm`, mx - 6, my + 22);
  if (fracText) s += `<text x="${cx}" y="228" class="fig-caption">円の ${fracText}</text>`;
  return svgWrap(s);
}

// ドーナツ型（2つの同心円）
export function donutFig({ R, r }) {
  const cx = 160, cy = 120;
  const px = 88, qx = 88 * (r / R);
  let s = `<circle cx="${cx}" cy="${cy}" r="${px}" class="fig-fill"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${qx.toFixed(1)}" fill="#fff" stroke="#7a4a21" stroke-width="2"/>`;
  const [ox, oy] = pt(cx, cy, px, -35);
  s += dimLine(cx, cy, ox, oy, `半径 ${fmt(R)}cm`, cx + 40, cy - 52);
  const [ix, iy] = pt(cx, cy, qx, 160);
  s += dimLine(cx, cy, ix, iy, `半径 ${fmt(r)}cm`, cx - 88, cy + 44, '#1f78c2');
  return svgWrap(s);
}

// 半円＋長方形（横長の上に半円）
export function halfRectFig({ w, h, r }) {
  // rect: w x h, semicircle radius r = w/2 on top
  const x0 = 60, y0 = 118, W = 200, H = 78;
  const cx = x0 + W / 2, cy = y0;
  let s = `<path d="M ${x0} ${cy} A ${W / 2} ${W / 2} 0 0 1 ${x0 + W} ${cy} Z" class="fig-fill"/>` +
    `<rect x="${x0}" y="${y0}" width="${W}" height="${H}" class="fig-fill"/>`;
  s += dimLine(cx, cy, cx, cy - W / 2, `半径 ${fmt(r)}cm`, cx + 8, cy - 52);
  s += `<text x="${cx}" y="${y0 + H + 26}" class="fig-label fig-center">長さ ${fmt(w)}cm</text>`;
  s += `<text x="${x0 + W + 8}" y="${y0 + H / 2}" class="fig-label">高さ ${fmt(h)}cm</text>`;
  return svgWrap(s);
}

// 長方形から円をくりぬく
export function rectMinusCircleFig({ w, h, r }) {
  const x0 = 40, y0 = 42, W = 240, H = 150;
  const cx = x0 + W / 2, cy = y0 + H / 2, R = 56;
  let s = `<rect x="${x0}" y="${y0}" width="${W}" height="${H}" class="fig-fill"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#fff" stroke="#7a4a21" stroke-width="2"/>`;
  const [ex, ey] = pt(cx, cy, R, -45);
  s += dimLine(cx, cy, ex, ey, `半径 ${fmt(r)}cm`, cx + 30, cy - 30);
  s += `<text x="${cx}" y="${y0 + H + 24}" class="fig-label fig-center">長さ ${fmt(w)}cm</text>`;
  s += `<text x="${x0 + W + 8}" y="${cy}" class="fig-label">高さ ${fmt(h)}cm</text>`;
  return svgWrap(s);
}

// 家の形（正方形＋半円の屋根）
export function houseFig({ side, r }) {
  const x0 = 95, y0 = 118, W = 130, H = 96;
  const cx = x0 + W / 2;
  let s = `<path d="M ${x0} ${y0} A ${W / 2} ${W / 2} 0 0 1 ${x0 + W} ${y0} Z" class="fig-fill"/>` +
    `<rect x="${x0}" y="${y0}" width="${W}" height="${H}" class="fig-fill"/>`;
  s += dimLine(cx, y0, cx, y0 - W / 2, `半径 ${fmt(r)}cm`, cx + 8, y0 - 44);
  s += `<text x="${cx}" y="${y0 + H + 26}" class="fig-label fig-center">一辺 ${fmt(side)}cm</text>`;
  return svgWrap(s);
}

// スタジアム型（長方形＋両端の半円）
export function stadiumFig({ w, h, r }) {
  const x0 = 55, y0 = 78, W = 150, H = 84;
  const cx1 = x0, cx2 = x0 + W, cy = y0 + H / 2;
  let s = `<path d="M ${cx1} ${y0} L ${cx2} ${y0} A ${H / 2} ${H / 2} 0 0 1 ${cx2} ${y0 + H} L ${cx1} ${y0 + H} A ${H / 2} ${H / 2} 0 0 1 ${cx1} ${y0} Z" class="fig-fill"/>`;
  s += dimLine(cx1, cy, cx1 - H / 2, cy, `半径 ${fmt(r)}cm`, cx1 - 62, cy - 10);
  s += `<text x="${(cx1 + cx2) / 2}" y="${y0 + H + 28}" class="fig-label fig-center">長方形の部分：長さ ${fmt(w)}cm ・ 高さ ${fmt(h)}cm</text>`;
  return svgWrap(s);
}

// 半円ドーナツ（大きい半円から小さい半円を引く）
export function halfDonutFig({ R, r }) {
  const cx = 160, cy = 168, px = 120, qx = 120 * (r / R);
  let s = `<path d="M ${cx - px} ${cy} A ${px} ${px} 0 0 1 ${cx + px} ${cy} L ${cx + qx} ${cy} A ${qx} ${qx} 0 0 0 ${cx - qx} ${cy} Z" class="fig-fill"/>`;
  s += dimLine(cx, cy, cx + px, cy, `半径 ${fmt(R)}cm`, cx + 52, cy + 22);
  s += dimLine(cx, cy, cx - qx, cy, `半径 ${fmt(r)}cm`, cx - 108, cy + 22, '#1f78c2');
  return svgWrap(s);
}

// 葉っぱ型（正方形の中で重なる部分）
export function leafFig({ r }) {
  const x0 = 85, y0 = 35, S = 150;
  const A = [x0, y0], C = [x0 + S, y0 + S];
  let s = `<rect x="${x0}" y="${y0}" width="${S}" height="${S}" fill="#fff" stroke="#7a4a21" stroke-width="2"/>`;
  s += `<path d="M ${A[0]} ${A[1]} A ${S} ${S} 0 0 1 ${C[0]} ${C[1]} A ${S} ${S} 0 0 1 ${A[0]} ${A[1]} Z" class="fig-fill"/>`;
  s += `<text x="${x0 + S / 2}" y="${y0 + S + 26}" class="fig-label fig-center">正方形の一辺 ${fmt(r)}cm（四分円の半径も ${fmt(r)}cm）</text>`;
  return svgWrap(s);
}

// 正方形−四分円（残りの部分）
export function squareMinusQuarterFig({ r }) {
  const x0 = 85, y0 = 30, S = 155;
  let s = `<rect x="${x0}" y="${y0}" width="${S}" height="${S}" class="fig-fill"/>`;
  s += `<path d="M ${x0} ${y0} L ${x0 + S} ${y0} A ${S} ${S} 0 0 1 ${x0} ${y0 + S} Z" fill="#fff" stroke="#7a4a21" stroke-width="2"/>`;
  s += dimLine(x0, y0, x0 + S, y0, `半径 ${fmt(r)}cm`, x0 + 52, y0 - 8);
  s += `<text x="${x0 + S / 2}" y="${y0 + S + 26}" class="fig-label fig-center">正方形の一辺 ${fmt(r)}cm</text>`;
  return svgWrap(s);
}

// 長方形＋四分円
export function rectPlusQuarterFig({ w, h, r }) {
  const x0 = 45, y0 = 55, W = 170, H = 120;
  let s = `<rect x="${x0}" y="${y0}" width="${W}" height="${H}" class="fig-fill"/>`;
  s += `<path d="M ${x0 + W} ${y0 + H} L ${x0 + W} ${y0} A ${H} ${H} 0 0 1 ${x0 + W + H} ${y0 + H} Z" class="fig-fill"/>`;
  s += dimLine(x0 + W, y0 + H, x0 + W + H, y0 + H, `半径 ${fmt(r)}cm`, x0 + W + 34, y0 + H + 24);
  s += `<text x="${x0 + W / 2}" y="${y0 + H + 26}" class="fig-label fig-center">長さ ${fmt(w)}cm</text>`;
  s += `<text x="${x0 - 4}" y="${y0 - 10}" class="fig-label">高さ ${fmt(h)}cm</text>`;
  return svgWrap(s);
}

// 半円−三角形（半円の中の三角形を引いた残り）
export function semiMinusTriFig({ r }) {
  const cx = 160, cy = 158, R = 115;
  let s = `<path d="M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy} Z" class="fig-fill"/>`;
  s += `<path d="M ${cx - R} ${cy} L ${cx} ${cy - R} L ${cx + R} ${cy} Z" fill="#fff" stroke="#7a4a21" stroke-width="2"/>`;
  s += dimLine(cx, cy, cx + R, cy, `半径 ${fmt(r)}cm`, cx + 46, cy + 24);
  s += `<text x="${cx}" y="${cy + 44}" class="fig-label fig-center">三角形の高さは 半径と 同じ ${fmt(r)}cm</text>`;
  return svgWrap(s);
}

// 逆算用（面積が分かっている円）
export function reverseFig({ area, unit = 'cm' }) {
  const cx = 160, cy = 118, R = 82;
  let s = `<circle cx="${cx}" cy="${cy}" r="${R}" class="fig-fill"/>`;
  const [x2, y2] = pt(cx, cy, R, -45);
  s += `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="#c94f26" stroke-width="2.5" stroke-dasharray="6 5"/>` +
    `<circle cx="${cx}" cy="${cy}" r="3.5" fill="#c94f26"/>` +
    `<text x="${cx + 26}" y="${cy - 36}" class="fig-label" fill="#c94f26">半径は？</text>`;
  s += `<text x="${cx}" y="${cy + 42}" class="fig-caption">面積 ${fmt(area)}${unit}²</text>`;
  return svgWrap(s);
}

export function figureSVG(fig) {
  if (!fig) return '';
  switch (fig.type) {
    case 'circle': return circleFig(fig);
    case 'sector': return sectorFig(fig);
    case 'donut': return donutFig(fig);
    case 'halfRect': return halfRectFig(fig);
    case 'rectMinusCircle': return rectMinusCircleFig(fig);
    case 'house': return houseFig(fig);
    case 'stadium': return stadiumFig(fig);
    case 'halfDonut': return halfDonutFig(fig);
    case 'leaf': return leafFig(fig);
    case 'squareMinusQuarter': return squareMinusQuarterFig(fig);
    case 'rectPlusQuarter': return rectPlusQuarterFig(fig);
    case 'semiMinusTri': return semiMinusTriFig(fig);
    case 'reverse': return reverseFig(fig);
    default: return '';
  }
}
