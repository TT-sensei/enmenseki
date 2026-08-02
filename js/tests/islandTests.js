import { STORAGE_KEY } from '../constants.js';
import { freshData, saveData } from '../storage.js';
import { awardPiece, buildingLevel, getIslandProgress } from '../services/islandService.js';

export function islandTests() {
  const backup = localStorage.getItem(STORAGE_KEY);
  const results = [];
  try {
    saveData(freshData());
    results.push({ name: '島の初期データ', actual: getIslandProgress().total, expected: 0, pass: getIslandProgress().total === 0 });
    awardPiece('pizza');
    results.push({ name: 'かけらの保存', actual: getIslandProgress().pizza, expected: 1, pass: getIslandProgress().pizza === 1 && getIslandProgress().total === 1 });
    results.push({ name: '最初のかけらで建物レベル1', actual: buildingLevel(1), expected: 1, pass: buildingLevel(1) === 1 });
    results.push({ name: '建物レベル3上限', actual: buildingLevel(20), expected: 3, pass: buildingLevel(20) === 3 });
  } finally {
    backup === null ? localStorage.removeItem(STORAGE_KEY) : localStorage.setItem(STORAGE_KEY, backup);
  }
  return results;
}
