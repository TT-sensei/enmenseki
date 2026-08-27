import { compositeProblems } from '../data/compositeProblems.js';
import { leafSvg } from '../diagrams/leaf.js';
import { magatamaSvg } from '../diagrams/magatama.js';
import { unfoldingGeometry } from '../diagrams/rearrangedSlices.js?v=20260827-8';
import { parseMathExpression } from '../utils/validator.js';
import { nearlyEqual } from '../utils/math.js';

export function diagramTests() {
  const leaf = leafSvg({ radius: 10, side: 10 });
  const magatama = magatamaSvg({ smallDiameter: 2, largeDiameter: 6 });
  const stage8 = compositeProblems.filter(problem => problem.stageId === 8);
  const magatamaProblems = stage8.filter(problem => problem.type === 'magatama');
  const unfold12 = unfoldingGeometry(12, 90);
  const unfold36 = unfoldingGeometry(36, 90);
  const halfCircumference = Math.PI * 90;
  const alternating = unfold12.pieces.every((piece, index) =>
    piece.pointsDown === (index % 2 === 0)
  );
  const widthGetsCloser =
    Math.abs(unfold36.width - halfCircumference) <
    Math.abs(unfold12.width - halfCircumference);

  return [
    { name: '葉っぱ型は正方形と2つの中心を表示', actual: leaf.includes('<rect') && (leaf.match(/中心/g) || []).length >= 2, expected: true, pass: leaf.includes('<rect') && (leaf.match(/中心/g) || []).length >= 2 },
    { name: 'まがたま型は3つの直径端点を表示', actual: (magatama.match(/<circle/g) || []).length, expected: 3, pass: (magatama.match(/<circle/g) || []).length === 3 },
    { name: '組み合わせ図形から花を削除', actual: stage8.some(problem => problem.type === 'flower'), expected: false, pass: !stage8.some(problem => problem.type === 'flower') },
    { name: 'まがたま型を5問登録', actual: magatamaProblems.length, expected: 5, pass: magatamaProblems.length === 5 },
    { name: 'まがたま型の式と答えが一致', actual: magatamaProblems.every(problem => nearlyEqual(parseMathExpression(problem.expression), problem.answer, problem.tolerance)), expected: true, pass: magatamaProblems.every(problem => nearlyEqual(parseMathExpression(problem.expression), problem.answer, problem.tolerance) },
    { name: '円の展開は扇形を上下交互に配置', actual: alternating, expected: true, pass: alternating },
    { name: '細かく分けるほど端のずれが小さい', actual: unfold36.skew < unfold12.skew, expected: true, pass: unfold36.skew < unfold12.skew },
    { name: '細かく分けるほど横が円周の半分に近づく', actual: widthGetsCloser, expected: true, pass: widthGetsCloser }
  ];
}
