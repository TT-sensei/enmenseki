import{circleArea,radiusFromArea,diameterFromCircumference,sectorArea,sectorAreaFromArc,ringArea,squareArea,triangleArea}from'../utils/geometry.js';import{simplifyFraction}from'../utils/fractions.js';import{nearlyEqual}from'../utils/math.js';import{parseMathExpression}from'../utils/validator.js';
const test=(name,actual,expected,t=.01)=>({name,actual,expected,pass:nearlyEqual(actual,expected,t)});
export function mathTests(){return[
test('半径6の円',circleArea(6),113.04),test('直径10の円',circleArea(5),78.5),test('面積200.96から半径',radiusFromArea(200.96),8),test('円周25.12から直径',diameterFromCircumference(25.12),8),test('円周25.12から面積',circleArea(diameterFromCircumference(25.12)/2),50.24),
test('半径9・120度',sectorArea(9,120),84.78),test('半径6・弧8',sectorAreaFromArc(6,8),24),test('半径10・216度',sectorArea(10,216),188.4),test('半径8・弧18',sectorAreaFromArc(8,18),72),
test('同じ割合の外半径12・内半径8',ringArea(12,8)*120/360,83.7333333333),test('円−小円',ringArea(12,8),251.2),test('正方形−4分の1円',squareArea(8)-sectorArea(8,90),13.76),test('おうぎ形−三角形',sectorArea(10,90)-triangleArea(10,10),28.5),
test('同値な式1',parseMathExpression('10×10×3.14×1/3'),104.6666666667),test('同値な式2',parseMathExpression('10×10×3.14÷3'),104.6666666667),
...[[90,1,4],[120,1,3],[216,3,5],[270,3,4]].map(([a,n,d])=>{const f=simplifyFraction(a,360);return{name:`${a}/360の約分`,actual:`${f.numerator}/${f.denominator}`,expected:`${n}/${d}`,pass:f.numerator===n&&f.denominator===d}})
]}
