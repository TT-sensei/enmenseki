import {nearlyEqual} from './math.js';

// 数字・四則・括弧・小数・分数だけを扱う安全な再帰下降パーサー。
export function parseMathExpression(source){
  const text=String(source).replace(/[×xX]/g,'*').replace(/[÷]/g,'/').replace(/−/g,'-').replace(/\s/g,'');
  if(!text||!/^[0-9.+\-*/()]+$/.test(text))throw new Error('使えるのは数字と四則記号、括弧だけです');
  let i=0;
  const number=()=>{const start=i;while(/[0-9.]/.test(text[i]||''))i++;const token=text.slice(start,i);if(!token||token.split('.').length>2)throw new Error('数字を確認してください');return Number(token)};
  const factor=()=>{if(text[i]==='-'){i++;return-factor()}if(text[i]==='('){i++;const v=expression();if(text[i]!==')')throw new Error('括弧を閉じてください');i++;return v}return number()};
  const term=()=>{let v=factor();while(text[i]==='*'||text[i]==='/'){const op=text[i++],r=factor();if(op==='/'&&r===0)throw new Error('0では割れません');v=op==='*'?v*r:v/r}return v};
  const expression=()=>{let v=term();while(text[i]==='+'||text[i]==='-'){const op=text[i++],r=term();v=op==='+'?v+r:v-r}return v};
  const value=expression();if(i!==text.length||!Number.isFinite(value))throw new Error('式を確認してください');return value;
}
export const validateExpression=(source,expected,tolerance=.01)=>{try{const value=parseMathExpression(source);return{valid:true,value,correct:nearlyEqual(value,expected,tolerance)}}catch(error){return{valid:false,error:error.message,correct:false}}};
export function diagnoseAnswer(problem,answer,unit){
  const value=Number(answer),correct=problem.answer,t=problem.tolerance??.01;
  if(!Number.isFinite(value))return{correct:false,message:'答えの数を入力しよう。'};
  if(unit!==problem.unit)return{correct:false,kind:'unit',message:`計算を確認したら、単位にも注目しよう。面積の単位には「²」がつきます。`};
  if(nearlyEqual(value,correct,t))return{correct:true,message:'正解！ 図形の見方と計算がつながりました。'};
  const v=problem.values||{};
  if(v.diameter&&nearlyEqual(value,v.diameter*v.diameter*3.14,t))return{correct:false,kind:'diameter',message:`${v.diameter}cmは直径です。半径はその半分になります。`};
  if(v.radius&&nearlyEqual(value,v.radius*3.14,t))return{correct:false,kind:'radius-once',message:'円の面積では、半径を2回かけます。'};
  if(v.angle&&nearlyEqual(value,v.radius*v.radius*3.14,t))return{correct:false,kind:'fraction',message:'円全体ではなく、おうぎ形の部分だけを求めます。中心角の割合をかけよう。'};
  return{correct:false,kind:'calculation',message:'考え方を見直すか、3.14をかける計算をもう一度確認しよう。'};
}
