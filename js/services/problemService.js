import{circleProblems}from'../data/circleProblems.js';import{sectorProblems}from'../data/sectorProblems.js';import{arcProblems}from'../data/arcProblems.js';import{compositeProblems}from'../data/compositeProblems.js';import{wordProblems}from'../data/wordProblems.js';import{challengeProblems}from'../data/challengeProblems.js';import{generateCircleProblem}from'../generators/circleGenerator.js';import{generateSectorProblem}from'../generators/sectorGenerator.js';import{generateReverseProblem}from'../generators/reverseGenerator.js';import{generateArcProblem}from'../generators/arcGenerator.js';import{generateCompositeProblem}from'../generators/compositeGenerator.js';import{randomItem,shuffle}from'../utils/math.js';
export const allProblems=[...circleProblems,...sectorProblems,...arcProblems,...compositeProblems,...wordProblems,...challengeProblems];
export function validateProblem(p){const needed=['id','stageId','type','title','instruction','diagram','values','strategyChoices','expression','answer','unit','tolerance','hints','explanation','reflectionChoices','tags'];const missing=needed.filter(k=>p[k]===undefined);if(missing.length)console.warn(`問題 ${p.id||'(idなし)'} に不足: ${missing.join(', ')}`);return!missing.length}
allProblems.forEach(validateProblem);
export const getStageProblems=id=>allProblems.filter(p=>p.stageId===Number(id));
export const getProblem=id=>allProblems.find(p=>p.id===id);
export const randomFromStage=id=>randomItem(getStageProblems(id));
export const randomCourse=count=>shuffle(allProblems.filter(p=>p.stageId<10)).slice(0,count);
export function generateRandom(){return randomItem([generateCircleProblem,generateSectorProblem,generateReverseProblem,generateArcProblem,generateCompositeProblem])()}
