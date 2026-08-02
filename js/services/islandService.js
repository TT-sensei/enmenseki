import { loadData, saveData } from '../storage.js';

export function getIslandProgress() {
  return loadData().island;
}

export function awardPiece(area) {
  const data = loadData();
  data.island ??= { pizza: 0, cake: 0, rescue: 0, total: 0 };
  data.island[area] = (data.island[area] || 0) + 1;
  data.island.total = (data.island.total || 0) + 1;
  saveData(data);
  return data.island;
}

export function buildingLevel(count) {
  if (count <= 0) return 0;
  if (count < 3) return 1;
  if (count < 6) return 2;
  return 3;
}
