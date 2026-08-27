const NAVI_BASE_URL = 'https://tt-sensei.github.io/navi-character-/assets/web/characters';

const naviImages = Object.freeze({
  pointing: NAVI_BASE_URL + '/kai/fullbody/pointing.webp',
  thinking: NAVI_BASE_URL + '/kai/fullbody/thinking.webp'
});

function imageFor(pose) {
  return naviImages[pose] || naviImages.pointing;
}

export function naviGuide(message, pose = 'pointing', variant = '') {
  const text = message || '図の変化をよく見てみよう。';
  const className = variant ? 'navi-guide navi-guide--' + variant : 'navi-guide';
  return '<div class="' + className + '"><img src="' + imageFor(pose) + '" alt="" loading="lazy" onerror="this.remove()"><span>' + text + '</span></div>';
}
