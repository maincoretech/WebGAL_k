import { webgalStore } from '@/store/store';
import { getStorageAsync } from '@/Core/controller/storage/storageController';
import { ISaveData } from '@/store/userDataInterface';
import { loadGameFromStageData } from '@/Core/controller/storage/loadGame';
import { generateCurrentStageData } from '@/Core/controller/storage/saveGame';
import cloneDeep from 'lodash/cloneDeep';
import throttle from 'lodash/throttle';
import { WebGAL } from '@/Core/WebGAL';
import { saveActions } from '@/store/savesReducer';
import { dumpFastSaveToStorage, getFastSaveFromStorage } from '@/Core/controller/storage/savesController';

export let fastSaveGameKey = '';
export let isFastSaveKey = '';
let lock = true;
let dumpFastSaveTask = Promise.resolve();

export function initKey() {
  lock = false;
  fastSaveGameKey = `FastSaveKey-${WebGAL.gameName}-${WebGAL.gameKey}`;
  isFastSaveKey = `FastSaveActive-${WebGAL.gameName}-${WebGAL.gameKey}`;
}

function dumpFastSaveToStorageSerial() {
  dumpFastSaveTask = dumpFastSaveTask.catch(() => {}).then(dumpFastSaveToStorage);
  return dumpFastSaveTask;
}

/**
 * 用于紧急回避时的数据存储 & 快速保存
 */
export async function fastSaveGame() {
  // TODO: 需要同步 Tauri 的退出前事件，进行快速存档
  const saveData: ISaveData = generateCurrentStageData(-1, true);
  const newSaveData = cloneDeep(saveData);
  webgalStore.dispatch(saveActions.setFastSave(newSaveData));
  await dumpFastSaveToStorageSerial();
}

export const autoFastSaveGame = throttle(() => {
  void fastSaveGame();
}, 1000);

/**
 * 判断是否有无存储紧急回避时的数据
 */
export async function hasFastSaveRecord() {
  // return await localforage.getItem(isFastSaveKey);
  await getStorageAsync();
  return webgalStore.getState().saveData.quickSaveData !== null;
}

/**
 * 获取紧急回避时的数据
 */
export async function getFastSaveRecord() {
  await getFastSaveFromStorage();
  return webgalStore.getState().saveData.quickSaveData;
}

/**
 * 加载紧急回避时的数据
 */
export async function loadFastSaveGame() {
  // 获得存档文件
  // const loadFile: ISaveData | null = await localforage.getItem(fastSaveGameKey);
  // await getFastSaveFromStorage();
  // const loadFile: ISaveData | null = webgalStore.getState().saveData.quickSaveData;
  const data = await getFastSaveRecord();
  if (!data) {
    return;
  }
  loadGameFromStageData(data);
}

/**
 * 移除紧急回避的数据
 */
export async function removeFastSaveGameRecord() {
  autoFastSaveGame.cancel();
  webgalStore.dispatch(saveActions.resetFastSave());
  await dumpFastSaveToStorageSerial();
}
