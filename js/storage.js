import {DEFAULT_SETTINGS,STORAGE_KEY,STORAGE_VERSION} from './constants.js';
export const freshData=()=>({version:STORAGE_VERSION,stats:{},mistakes:[],weakTags:{},lastRoute:'#home',settings:{...DEFAULT_SETTINGS},cards:[],island:{pizza:0,cake:0,rescue:0,total:0},currentStreak:0,bestStreak:0});
export function loadData(){try{const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return freshData();const parsed=JSON.parse(raw);if(parsed.version!==STORAGE_VERSION)return migrate(parsed);return{...freshData(),...parsed,settings:{...DEFAULT_SETTINGS,...parsed.settings},island:{...freshData().island,...parsed.island}}}catch(error){console.warn('進捗データを復旧しました',error);return freshData()}}
export function saveData(data){try{localStorage.setItem(STORAGE_KEY,JSON.stringify({...data,version:STORAGE_VERSION}));return true}catch(error){console.warn('進捗を保存できませんでした',error);return false}}
export function migrate(old){const next=freshData();if(old&&typeof old==='object'){next.stats=old.stats||{};next.settings={...next.settings,...(old.settings||{})}}saveData(next);return next}
export function clearData(){localStorage.removeItem(STORAGE_KEY);return freshData()}
