import {round} from './math.js';
export function formatNumber(value,digits=2){const n=round(value,digits);return Number.isInteger(n)?String(n):String(n).replace(/0+$/,'').replace(/\.$/,'')}
export const escapeHtml=value=>String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
export const fractionHtml=(n,d)=>`<span class="fraction" aria-label="${d}分の${n}"><span>${n}</span><span>${d}</span></span>`;
