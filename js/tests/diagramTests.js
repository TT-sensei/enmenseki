import { compositeProblems } from '../data/compositeProblems.js';
import { leafSvg } from '../diagrams/leaf.js';
import { magatamaSvg } from '../diagrams/magatama.js';
import { parseMathExpression } from '../utils/validator.js';
import { nearlyEqual } from '../utils/math.js';

export function diagramTests() {
  const leaf = leafSvg({ radius: 10, side: 10 });
  const magatama = magatamaSvg({ smallDiameter: 2, largeDiameter: 6 });
  const stage8 = compositeProblems.filter(problem => problem.stageId === 8);
  const magatamaProblems = stage8.filter(problem => problem.type === 'magatama');
  return [
    { name: '葉っぱ型は正方形と2つの中心を表示', actual: leaf.includes('<rect') && (leaf.match(/中心/g) || []).length >= 2, expected: true, pass: leaf.includes('<rect') && (leaf.match(/中心/g) || []).length >= 2 },
    { name: 'まがたま型は3つの直径端点を表示', actual: (magatama.match(/<circle/g) || []).length, expected: 3, pass: (magatama.match(/<circle/g) || []).length === 3 },
    { name: '組み合わせ図形から花を削除', actual: stage8.some(problem => problem.type === 'flower'), expected: false, pass: !stage8.some(problem => problem.type === 'flower') },
    { name: 'まがたま型を5問登録', actual: magatamaProblems.length, expected: 5, pass: magatamaProblems.length === 5 },
    { name: 'まがたま型の式と答えが一致', actual: magatamaProblems.every(problem => nearlyEqual(parseMathExpression(problem.expression), problem.answer, problem.tolerance)), expected: true, pass: magatamaProblems.every(problem => nearlyEqual(parseMathExpression(problem.expression), problem.answer, problem.tolerance)) }
  ];
}
