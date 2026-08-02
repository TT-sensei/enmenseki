import {STRATEGIES} from '../constants.js';
export function makeProblem(spec){
  const base={difficulty:1,type:'circle-area',title:'円の面積',instruction:'色のついた部分の面積を求めよう。',choices:[],strategyChoices:Object.keys(STRATEGIES),unit:'cm²',tolerance:.01,reflectionChoices:['円全体を先に求めた','おうぎ形の割合を先に考えた','大きい図形から引いた','図形を分けた','同じ形を何個分か考えた','途中で半径を求めた'],tags:[]};
  const p={...base,...spec};
  p.hints=p.hints||['図の数値と、求める部分に注目しよう。','円全体・割合・差のどれを使うか考えよう。',p.expression?.replace(/[0-9.]+/g,'□')||'半径×半径×3.14',p.expression||'式を組み立てよう。','整数の部分を先に計算してから、3.14をかけよう。'];
  p.explanation=p.explanation||`「${STRATEGIES[p.validStrategies?.[0]]||'図形の関係'}」と考える問題です。`;
  return p;
}
