import { storeGet, storeSet } from '@/Core/util/lite';
import { WebGAL } from '@/Core/WebGAL';
import { logger } from '@/Core/util/logger';
import { webgalStore } from '@/store/store';
import { saveActions } from '@/store/savesReducer';
import { ISaveData } from '@/store/userDataInterface';

const SAVES_KEY = '-saves-batch';
const FAST_KEY = '-saves-fast';

export async function dumpSavesToStorage(_start: number, _end: number) {
  const saveData = webgalStore.getState().saveData.saveData;
  // filter out empty slots to avoid storing nulls
  const compact: Record<number, ISaveData> = {};
  for (let i = _start; i <= _end; i++) {
    if (saveData[i] != null) compact[i] = saveData[i];
  }
  await storeSet(`${WebGAL.gameKey}${SAVES_KEY}`, compact);
  logger.info(`存档批量写入本地存储`);
}

export async function getSavesFromStorage(_start?: number, _end?: number) {
  const batch = await storeGet(`${WebGAL.gameKey}${SAVES_KEY}`);
  if (!batch || typeof batch !== 'object') return;
  const entries = Object.entries(batch as Record<string, ISaveData>);
  for (const [key, save] of entries) {
    webgalStore.dispatch(saveActions.saveGame({ index: parseInt(key), saveData: save }));
  }
  logger.info(`存档批量读取自本地存储`);
}

export async function dumpFastSaveToStorage() {
  const save = webgalStore.getState().saveData.quickSaveData;
  await storeSet(`${WebGAL.gameKey}${FAST_KEY}`, save);
  logger.info(`快速存档写入本地存储`);
}

export async function getFastSaveFromStorage() {
  const save = await storeGet(`${WebGAL.gameKey}${FAST_KEY}`);
  if (save) webgalStore.dispatch(saveActions.setFastSave(save as ISaveData));
  logger.info(`快速存档读取自本地存储`);
}
