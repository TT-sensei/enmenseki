function rounded(value) {
  return Number(value.toFixed(2));
}

/*
 * 円の切片を、上下の帯として隣り合わせに置く。
 * 上下の基準線を同じ centerY にそろえることで、
 * 旧実装のように切片が反対側まで伸びてひし形になるのを防ぐ。
 */
export function rearrangedSlicePath({ x, width, topY, centerY, bottomY, top }) {
  const left = rounded(x);
  const right = rounded(x + width);
  const middle = rounded(x + width / 2);
  const curve = Math.min(10, Math.max(2, width * 0.12));

  if (top) {
    return 'M ' + left + ' ' + topY +
      ' Q ' + middle + ' ' + rounded(topY - curve) + ' ' + right + ' ' + topY +
      ' L ' + right + ' ' + centerY + ' L ' + left + ' ' + centerY + ' Z';
  }

  return 'M ' + left + ' ' + centerY +
    ' L ' + right + ' ' + centerY +
    ' L ' + right + ' ' + bottomY +
    ' Q ' + middle + ' ' + rounded(bottomY + curve) + ' ' + left + ' ' + bottomY +
    ' Z';
}
