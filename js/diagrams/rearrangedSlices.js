function rounded(value) {
  return Number(value.toFixed(2));
}

/*
 * 円を切り開いてできる切片を、上下交互に並べるための形。
 * 円の弧を残したまま、中心側を少し右へずらすことで、
 * 長方形ではなく「平行四辺形に近い形」へ変わる見え方にする。
 */
export function rearrangedSlicePath({ x, width, topY, centerY, bottomY, top, skew = 16 }) {
  const topLeft = rounded(x);
  const topRight = rounded(x + width);
  const centerLeft = rounded(x + skew / 2);
  const centerRight = rounded(x + width + skew / 2);
  const bottomLeft = rounded(x + skew);
  const bottomRight = rounded(x + width + skew);
  const middle = rounded(x + width / 2);
  const curve = Math.min(9, Math.max(2.5, width * 0.16));

  if (top) {
    return 'M ' + topLeft + ' ' + topY +
      ' Q ' + middle + ' ' + rounded(topY - curve) + ' ' + topRight + ' ' + topY +
      ' L ' + centerRight + ' ' + centerY + ' L ' + centerLeft + ' ' + centerY + ' Z';
  }

  return 'M ' + centerLeft + ' ' + centerY +
    ' L ' + centerRight + ' ' + centerY +
    ' L ' + bottomRight + ' ' + bottomY +
    ' Q ' + rounded(middle + skew) + ' ' + rounded(bottomY + curve) + ' ' + bottomLeft + ' ' + bottomY +
    ' Z';
}

export function rearrangedGuidePath({ x, width, topY, bottomY, skew = 16 }) {
  return 'M ' + rounded(x) + ' ' + topY +
    ' L ' + rounded(x + width) + ' ' + topY +
    ' L ' + rounded(x + width + skew) + ' ' + bottomY +
    ' L ' + rounded(x + skew) + ' ' + bottomY + ' Z';
}
