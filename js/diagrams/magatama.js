export function magatamaSvg(data = {}) {
  const smallDiameter = data.smallDiameter ?? 2;
  const largeDiameter = data.largeDiameter ?? 6;
  const totalDiameter = smallDiameter + largeDiameter;
  const x = 48, right = 302, baseline = 125, width = right - x;
  const notchEnd = x + width * smallDiameter / totalDiameter;
  const lowerDepth = 122;
  const bigRise = Math.min(112, (right - notchEnd) * .58);
  const notchDepth = Math.min(62, (notchEnd - x) * .58);
  const shape = `M${x} ${baseline} C${x} ${baseline + lowerDepth},${right} ${baseline + lowerDepth},${right} ${baseline} C${right} ${baseline - bigRise},${notchEnd} ${baseline - bigRise},${notchEnd} ${baseline} C${notchEnd} ${baseline + notchDepth},${x} ${baseline + notchDepth},${x} ${baseline}Z`;
  return `<svg viewBox="0 0 350 320" role="img" aria-label="くぼんだ半円の直径${smallDiameter}センチメートル、ふくらんだ半円の直径${largeDiameter}センチメートルのまがたま型"><defs><pattern id="magatamaPattern" width="11" height="11" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><rect width="11" height="11" fill="#cfe69d"/><line y2="11" stroke="#fff" stroke-width="3"/></pattern></defs><path d="${shape}" fill="url(#magatamaPattern)" stroke="#17324d" stroke-width="4"/><line class="measure-line" x1="${x}" y1="${baseline}" x2="${right}" y2="${baseline}"/><circle cx="${x}" cy="${baseline}" r="5" fill="#17324d"/><circle cx="${notchEnd}" cy="${baseline}" r="5" fill="#17324d"/><circle cx="${right}" cy="${baseline}" r="5" fill="#17324d"/><path d="M${x} ${baseline - 12}v-18M${notchEnd} ${baseline - 12}v-18M${right} ${baseline - 12}v-18" stroke="#376b87" stroke-width="2"/><text x="${(x + notchEnd) / 2}" y="${baseline - 37}" text-anchor="middle" font-size="17">${smallDiameter} cm</text><text x="${(notchEnd + right) / 2}" y="${baseline - 37}" text-anchor="middle" font-size="17">${largeDiameter} cm</text><text x="175" y="300" text-anchor="middle" font-size="17">全体の直径 ${totalDiameter} cm</text></svg>`;
}
