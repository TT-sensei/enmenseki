import{circleProblems}from'./circleProblems.js';import{sectorProblems}from'./sectorProblems.js';import{arcProblems}from'./arcProblems.js';import{compositeProblems}from'./compositeProblems.js';import{wordProblems}from'./wordProblems.js';
const sources=[circleProblems[5],circleProblems[15],circleProblems[25],sectorProblems[2],sectorProblems[15],arcProblems[2],compositeProblems[2],compositeProblems[12],wordProblems[4],wordProblems[9]];
export const challengeProblems=sources.map((p,i)=>({...p,id:`challenge-${i+1}`,stageId:10,title:`総合 ${i+1}：${p.title}`}));
