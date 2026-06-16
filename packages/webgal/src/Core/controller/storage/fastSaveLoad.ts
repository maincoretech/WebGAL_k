import { webgalStore } from '@/store/store';
import { ISaveData } from '@/store/userDataInterface';
import { loadGameFromStageData } from '@/Core/controller/storage/loadGame';
import { generateCurrentStageData } from '@/Core/controller/storage/saveGame';
import { cloneDeep, throttle } from '@/Core/util/lite';
import { WebGAL } from '@/Core/WebGAL';
import { saveActions } from '@/store/savesReducer';
import { dumpFastSaveToStorage, getFastSaveFromStorage } from '@/Core/controller/storage/savesController';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';

export let fastSaveGameKey = '';
export let isFastSaveKey = '';
let lock = true;
let dumpFastSaveTask = Promise.resolve();
let gameEntered = false;
export function markGameEntered() { gameEntered = true; }

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
  // 冷启动后首次标题页不存档，避免用空场景覆盖有效存档
  if (!gameEntered && webgalStore.getState().GUI.showTitle) return;

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
  await getFastSaveFromStorage();
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
  const data = await getFastSaveRecord();
  if (!data) {
    return;
  }
  loadGameFromStageData(data);
}

// Tauri close guard: auto-save before exit
listen('hexz-before-close', async () => {
  await fastSaveGame();
  invoke('allow_close');
});

/**
 * 移除紧急回避的数据
 */
export async function removeFastSaveGameRecord() {
  autoFastSaveGame.cancel();
  webgalStore.dispatch(saveActions.resetFastSave());
  await dumpFastSaveToStorageSerial();
}
