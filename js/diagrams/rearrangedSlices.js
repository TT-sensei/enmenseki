import { sectorPath } from './sector.js';

const MOVE_SECONDS = 0.62;
const STAGGER_SECONDS = 0.035;

const rounded = value => Number(value.toFixed(3));

export function unfoldingDuration(slices) {
  return MOVE_SECONDS + Math.max(0, slices - 1) * STAGGER_SECONDS;
}

export function unfoldingGeometry(slices, radius = 90, targetX = 365, targetY = 68) {
  if (!Number.isInteger(slices) || slices < 4 || slices % 2 !== 0) {
    throw new Error('円の等分数は4以上の偶数にしてください。');
  }

  const angle = 360 / slices;
  const halfAngle = Math.PI / slices;
  const chord = 2 * radius * Math.sin(halfAngle);
  const height = radius * Math.cos(halfAngle);
  const pairs = slices / 2;
  const width = pairs * chord;
  const skew = chord / 2;
  const bottomY = targetY + height;
  const pieces = Array.from({ length: slices }, (_, index) => {
    const pair = Math.floor(index / 2);
    const pointsDown = index % 2 === 0;
    return {
      index,
      pointsDown,
      sourceRotation: index * angle,
      targetX: pointsDown ? targetX + pair * chord + skew : targetX + (pair + 1) * chord,
      targetY: pointsDown ? bottomY : targetY,
      targetRotation: pointsDown ? -angle / 2 : 180 - angle / 2
    };
  });

  return {
    slices,
    radius,
    angle,
    chord: rounded(chord),
    height: rounded(height),
    pairs,
    width: rounded(width),
    skew: rounded(skew),
    targetX,
    targetY,
    bottomY: rounded(bottomY),
    pieces,
    outlinePath: `M ${rounded(targetX)} ${rounded(targetY)} L ${rounded(targetX + width)} ${rounded(targetY)} L ${rounded(targetX + width + skew)} ${rounded(bottomY)} L ${rounded(targetX + skew)} ${rounded(bottomY)} Z`
  };
}

function nestedPiece(path, piece, sourceX, sourceY, state, fill) {
  const common = `<path d="${path}" fill="${fill}" stroke="#fff" stroke-width="1.6" vector-effect="non-scaling-stroke"/>`;
  if (state === 'circle') {
    return `<g class="unfold-piece" data-unfold-piece="${piece.index}" transform="translate(${sourceX} ${sourceY})"><g transform="rotate(${piece.sourceRotation})">${common}</g></g>`;
  }
  if (state === 'arranged') {
    return `<g class="unfold-piece" data-unfold-piece="${piece.index}" transform="translate(${rounded(piece.targetX)} ${rounded(piece.targetY)})"><g transform="rotate(${rounded(piece.targetRotation)})">${common}</g></g>`;
  }

  const begin = rounded(piece.index * STAGGER_SECONDS);
  return `<g class="unfold-piece unfold-piece-moving" data-unfold-piece="${piece.index}" transform="translate(${sourceX} ${sourceY})">
    <animateTransform attributeName="transform" type="translate" from="${sourceX} ${sourceY}" to="${rounded(piece.targetX)} ${rounded(piece.targetY)}" begin="${begin}s" dur="${MOVE_SECONDS}s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines=".22 .8 .25 1"/>
    <g transform="rotate(${piece.sourceRotation})">
      <animateTransform attributeName="transform" type="rotate" from="${piece.sourceRotation}" to="${rounded(piece.targetRotation)}" begin="${begin}s" dur="${MOVE_SECONDS}s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines=".22 .8 .25 1"/>
      ${common}
    </g>
  </g>`;
}

export function circleUnfoldingSvg({
  slices = 12,
  state = 'circle',
  showMeasures = false,
  sourceX = 145,
  sourceY = 140,
  targetX = 365,
  targetY = 68,
  radius = 90,
  idPrefix = 'circle-unfold'
} = {}) {
  const geometry = unfoldingGeometry(slices, radius, targetX, targetY);
  const path = sectorPath(0, 0, radius, geometry.angle);
  const colors = ['#82bad5', '#f4ad7e'];
  const ghost = geometry.pieces.map(piece =>
    `<g transform="translate(${sourceX} ${sourceY})"><g transform="rotate(${piece.sourceRotation})"><path d="${path}" fill="${colors[piece.index % 2]}" stroke="#fff" stroke-width="1.4" vector-effect="non-scaling-stroke"/></g></g>`
  ).join('');
  const pieces = geometry.pieces.map(piece =>
    nestedPiece(path, piece, sourceX, sourceY, state, colors[piece.index % 2])
  ).join('');
  const targetOpacity = state === 'circle' ? '.24' : '1';
  const aria = state === 'circle'
    ? `円を${slices}等分した図`
    : `円を${slices}等分し、扇形を上下交互に並べた図`;
  const measureY = geometry.bottomY + 30;
  const measureStart = geometry.targetX + geometry.skew;
  const measureEnd = geometry.targetX + geometry.width + geometry.skew;

  return `<svg class="circle-unfolding" viewBox="0 0 700 300" role="img" aria-label="${aria}">
    <g class="unfold-source-ghost" opacity=".14">${ghost}</g>
    <circle cx="${sourceX}" cy="${sourceY}" r="${radius}" fill="none" stroke="#17324d" stroke-width="2.5"/>
    <circle cx="${sourceX}" cy="${sourceY}" r="4" fill="#17324d"/>
    <text class="unfold-label" x="${sourceX}" y="270" text-anchor="middle">${slices}等分した円</text>
    <g class="unfold-arrow" aria-hidden="true"><line x1="260" y1="140" x2="326" y2="140"/><path d="M315 129 L328 140 L315 151"/></g>
    <g class="unfold-target-guide" opacity="${targetOpacity}">
      <path d="${geometry.outlinePath}" fill="none" stroke="#17324d" stroke-width="1.7" stroke-dasharray="6 5"/>
      <text class="unfold-label" x="${rounded(targetX + geometry.width / 2 + geometry.skew / 2)}" y="250" text-anchor="middle">上向き・下向きを交互に並べる</text>
    </g>
    <g id="${idPrefix}-pieces">${pieces}</g>
    ${showMeasures ? `<g class="unfold-measures">
      <line x1="${targetX - 18}" y1="${targetY}" x2="${targetX - 18}" y2="${geometry.bottomY}"/>
      <line x1="${targetX - 24}" y1="${targetY}" x2="${targetX - 12}" y2="${targetY}"/>
      <line x1="${targetX - 24}" y1="${geometry.bottomY}" x2="${targetX - 12}" y2="${geometry.bottomY}"/>
      <text x="${targetX - 28}" y="${rounded(targetY + geometry.height / 2)}" text-anchor="middle" transform="rotate(-90 ${targetX - 28} ${rounded(targetY + geometry.height / 2)})">半径</text>
      <line x1="${measureStart}" y1="${measureY}" x2="${measureEnd}" y2="${measureY}"/>
      <line x1="${measureStart}" y1="${measureY - 6}" x2="${measureStart}" y2="${measureY + 6}"/>
      <line x1="${measureEnd}" y1="${measureY - 6}" x2="${measureEnd}" y2="${measureY + 6}"/>
      <text x="${rounded((measureStart + measureEnd) / 2)}" y="${measureY + 22}" text-anchor="middle">円周の半分</text>
    </g>` : ''}
  </svg>`;
}

// GitHub Pagesの反映途中でも旧画面を開けるよう、以前の呼び出し口を残す。
export function rearrangedSlicePath({ x, width, topY, centerY, bottomY, top, skew = 16 }) {
  const topLeft = rounded(x);
  const topRight = rounded(x + width);
  const centerLeft = rounded(x + skew / 2);
  const centerRight = rounded(x + width + skew / 2);
  const bottomLeft = rounded(x + skew);
  const bottomRight = rounded(x + width + skew);
  const middle = rounded(x + width / 2);
  const curve = Math.min(9, Math.max(2.5, width * .16));
  if (top) {
    return `M ${topLeft} ${topY} Q ${middle} ${rounded(topY - curve)} ${topRight} ${topY} L ${centerRight} ${centerY} L ${centerLeft} ${centerY} Z`;
  }
  return `M ${centerLeft} ${centerY} L ${centerRight} ${centerY} L ${bottomRight} ${bottomY} Q ${rounded(middle + skew)} ${rounded(bottomY + curve)} ${bottomLeft} ${bottomY} Z`;
}

export function rearrangedGuidePath({ x, width, topY, bottomY, skew = 16 }) {
  return `M ${rounded(x)} ${topY} L ${rounded(x + width)} ${topY} L ${rounded(x + width + skew)} ${bottomY} L ${rounded(x + skew)} ${bottomY} Z`;
}
