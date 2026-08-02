import { circleArea, magatamaArea, ringArea, squareArea, sectorArea, triangleArea } from '../utils/geometry.js';
import { makeProblem } from './problemFactory.js';

const rings = [[8, 4], [10, 6], [12, 8], [9, 3], [14, 10]];

const stage7 = [
  ...rings.map(([outerRadius, innerRadius], index) => makeProblem({
    id: `ring-${index + 1}`,
    stageId: 7,
    difficulty: 3,
    type: 'ring',
    title: 'ドーナツ型',
    instruction: '色のついた部分の面積を求めよう。',
    diagram: { kind: 'ring', outerRadius, innerRadius },
    values: { outerRadius, innerRadius },
    validStrategies: ['subtract'],
    expression: `${outerRadius}×${outerRadius}×3.14-${innerRadius}×${innerRadius}×3.14`,
    answer: ringArea(outerRadius, innerRadius),
    tags: ['引き算', 'ドーナツ型']
  })),
  ...[6, 8, 10, 12, 14].map((side, index) => makeProblem({
    id: `square-circle-${index + 1}`,
    stageId: 7,
    difficulty: 3,
    type: 'square-circle',
    title: '正方形から円を引く',
    instruction: '正方形の中の、円の外側の面積を求めよう。',
    diagram: { kind: 'square-circle', side },
    values: { side, radius: side / 2 },
    validStrategies: ['subtract'],
    expression: `${side}×${side}-${side / 2}×${side / 2}×3.14`,
    answer: squareArea(side) - circleArea(side / 2),
    tags: ['引き算', '正方形', '円']
  }))
];

const leafSides = [6, 8, 10, 12, 14];
const magatamaDiameters = [[2, 4], [2, 6], [4, 6], [4, 8], [6, 10]];

const stage8 = [
  ...leafSides.map((side, index) => {
    const onePiece = sectorArea(side, 90) - triangleArea(side, side);
    return makeProblem({
      id: `leaf-${index + 1}`,
      stageId: 8,
      difficulty: 4,
      type: 'leaf',
      title: '葉っぱ型',
      instruction: `一辺${side}cmの正方形で、対角の2頂点を中心に半径${side}cmの4分円をかきました。重なった葉っぱ型の面積を求めよう。`,
      diagram: { kind: 'leaf', radius: side, side },
      values: { radius: side, side },
      validStrategies: ['double', 'subtract', 'overlap'],
      expression: `(${side}×${side}×3.14÷4-${side}×${side}÷2)×2`,
      answer: onePiece * 2,
      hints: [
        '対角線で葉っぱを2つの同じ形に分けよう。',
        '1つ分は、4分円から直角三角形を引いた形だよ。',
        '(4分円の面積−三角形の面積)×2',
        `(${side}×${side}×3.14÷4-${side}×${side}÷2)×2`,
        `4分円と三角形を別々に計算してから、差を2倍しよう。`
      ],
      explanation: `対角線で2つに分けると、どちらも「半径${side}cmの4分円−底辺${side}cm・高さ${side}cmの直角三角形」です。その1つ分を2倍します。`,
      tags: ['葉っぱ型', '重なり', '4分円', '三角形']
    });
  }),
  ...magatamaDiameters.map(([smallDiameter, largeDiameter], index) => {
    const totalDiameter = smallDiameter + largeDiameter;
    return makeProblem({
      id: `magatama-${index + 1}`,
      stageId: 8,
      difficulty: 4,
      type: 'magatama',
      title: 'まがたま型',
      instruction: `くぼんだ半円の直径は${smallDiameter}cm、ふくらんだ半円の直径は${largeDiameter}cmです。色のついた面積を求めよう。`,
      diagram: { kind: 'magatama', smallDiameter, largeDiameter },
      values: { smallDiameter, largeDiameter, totalDiameter },
      validStrategies: ['split', 'subtract'],
      expression: `${totalDiameter / 2}×${totalDiameter / 2}×3.14÷2+${largeDiameter / 2}×${largeDiameter / 2}×3.14÷2-${smallDiameter / 2}×${smallDiameter / 2}×3.14÷2`,
      answer: magatamaArea(smallDiameter, largeDiameter),
      hints: [
        '点線を境に、3つの半円を見つけよう。',
        '下の大きな半円に、上のふくらみを足し、くぼみを引くよ。',
        '大きな半円＋ふくらんだ半円−くぼんだ半円',
        `${totalDiameter / 2}×${totalDiameter / 2}×3.14÷2+${largeDiameter / 2}×${largeDiameter / 2}×3.14÷2-${smallDiameter / 2}×${smallDiameter / 2}×3.14÷2`,
        `まず、3つの半円の直径を半径に直して計算しよう。`
      ],
      explanation: `全体の直径は${smallDiameter}+${largeDiameter}=${totalDiameter}cmです。下の大きな半円に直径${largeDiameter}cmの半円を足し、直径${smallDiameter}cmの白い半円を引きます。`,
      tags: ['まがたま型', '半円', '足し算', '引き算']
    });
  })
];

export const compositeProblems = [...stage7, ...stage8];
