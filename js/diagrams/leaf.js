export function leafSvg(data = {}) {
  const side = data.radius ?? data.side ?? '?';
  const x = 52, y = 32, size = 226;
  const leftBottom = `${x} ${y + size}`;
  const rightTop = `${x + size} ${y}`;
  // 対角の2頂点を中心にした4分円の弧で、中央の葉っぱができる。
  const leafPath = `M${leftBottom} A${size} ${size} 0 0 0 ${rightTop} A${size} ${size} 0 0 0 ${leftBottom}Z`;
  return `<svg viewBox="0 0 340 330" role="img" aria-label="一辺${side}センチメートルの正方形。対角の2頂点を中心とする4分円が重なった葉っぱ型"><defs><pattern id="leafPattern" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="10" height="10" fill="#f3aa7d"/><line y2="10" stroke="#fff" stroke-width="3"/></pattern></defs><rect x="${x}" y="${y}" width="${size}" height="${size}" fill="#fff" stroke="#17324d" stroke-width="4"/><path d="M${x} ${y + size} A${size} ${size} 0 0 0 ${x + size} ${y}" fill="none" stroke="#376b87" stroke-width="4"/><path d="M${x} ${y + size} A${size} ${size} 0 0 1 ${x + size} ${y}" fill="none" stroke="#376b87" stroke-width="4"/><path d="${leafPath}" fill="url(#leafPattern)" stroke="#a63d12" stroke-width="4"/><line class="decompose-line" x1="${x}" y1="${y + size}" x2="${x + size}" y2="${y}"/><path d="M${x} ${y + 18}h18v-18M${x + size - 18} ${y + size}v-18h18" fill="none" stroke="#17324d" stroke-width="3"/><circle cx="${x}" cy="${y}" r="6" fill="#17324d"/><circle cx="${x + size}" cy="${y + size}" r="6" fill="#17324d"/><text class="geometry-key" x="${x + 12}" y="${y + 22}">中心</text><text class="geometry-key" x="${x + size - 54}" y="${y + size - 12}">中心</text><text x="${x + size / 2}" y="304" text-anchor="middle" font-size="17">正方形の一辺＝4分円の半径＝${side} cm</text></svg>`;
}
