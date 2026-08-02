export const nearlyEqual=(a,b,tolerance=.01)=>Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=tolerance;
export const round=(value,digits=2)=>{const p=10**digits;return Math.round((value+Number.EPSILON)*p)/p};
export const randomItem=items=>items[Math.floor(Math.random()*items.length)];
export const shuffle=items=>{const copy=[...items];for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}return copy};
export const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
