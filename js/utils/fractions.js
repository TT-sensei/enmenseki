export function gcd(a,b){a=Math.abs(Math.trunc(a));b=Math.abs(Math.trunc(b));while(b)[a,b]=[b,a%b];return a||1}
export function simplifyFraction(numerator,denominator){if(!denominator)throw new Error('分母は0にできません');const d=gcd(numerator,denominator);const sign=denominator<0?-1:1;return{numerator:sign*numerator/d,denominator:Math.abs(denominator)/d,divisor:d}}
export const angleFraction=angle=>simplifyFraction(angle,360);
export const equalFractions=(a,b)=>a.numerator*b.denominator===b.numerator*a.denominator;
export const fractionText=f=>`${f.numerator}/${f.denominator}`;
