import { storeSet, storeGet } from '@/Core/util/lite';
import { IUserData } from '@/store/userDataInterface';
import { logger } from '../../util/logger';
import { webgalStore } from '@/store/store';
import { initState, resetUserData } from '@/store/userDataReducer';
import { cloneDeep } from '@/Core/util/lite';

import { WebGAL } from '@/Core/WebGAL';
import savesReducer, { ISavesData } from '@/store/savesReducer';
import { mkdir, exists, remove, copyFile, writeTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';

interface IExportGameData {
  userData: IUserData;
  saves: ISavesData;
}

const savesDir = { baseDir: BaseDirectory.AppData };

/**
 * 备份外部存储
 */
export async function backupSaves() {
  let savesExists = await exists('saves.json', savesDir);
  let backupDirExists = await exists('backups', savesDir);
  let now = new Date();
  const savesDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(
    now.getSeconds(),
  ).padStart(2, '0')}`;
  if (!backupDirExists) {
    mkdir('backups', {
      baseDir: BaseDirectory.AppData,
    });
  }
  if (savesExists) {
    await copyFile('saves.json', `backups/saves_${savesDate}.json`, {
      fromPathBaseDir: BaseDirectory.AppData,
      toPathBaseDir: BaseDirectory.AppData,
    });
    logger.info(`外部存储已备份`);
  }
}

/**
 * 写入外部存储
 */
export async function syncSaves() {
  const userDataState = webgalStore.getState().userData;
  const userSavesState = webgalStore.getState().saveData;
  let gameData: IExportGameData = {
    userData: userDataState,
    saves: userSavesState,
  };
  const saves = JSON.stringify(gameData);
  if (saves !== null) {
    let savesExists = await exists('saves.json', savesDir);
    if (savesExists) {
      await remove('saves.json', savesDir);
      await writeTextFile('saves.json', saves, savesDir);
      logger.info(`外部存储已同步`);
    }
  }
}

/**
 * 写入本地存储
 */
export const setStorage = debounce(() => {
  const userDataState = webgalStore.getState().userData;
  storeSet(WebGAL.gameKey, userDataState).then(() => {
    logger.info('写入本地存储');
    syncSaves();
  });
}, 100);

/**
 * 从本地存储获取数据
 */
export const getStorage = debounce(() => {
  storeGet(WebGAL.gameKey).then((newUserData) => {
    // 如果没有数据，重新初始化
    if (!newUserData) {
      logger.warn('现在重置数据');
      setStorage();
      return;
    }
    const shouldMigrate = !checkUserDataProperty(newUserData);
    const normalizedUserData = normalizeUserData(newUserData as Partial<IUserData>);
    webgalStore.dispatch(resetUserData(normalizedUserData));
    if (shouldMigrate) {
      logger.warn('检测到旧版本用户数据，已补齐默认字段');
      setStorage();
    }
  });
}, 100);

/**
 * 防抖函数
 * @param fn 要执行的函数
 * @param wait 防抖等待时间（毫秒）
 */
function debounce(fn: () => void, wait: number): () => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return () => {
    if (timeout !== null) clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      fn();
    }, wait);
  };
}

export const dumpToStorageFast = () => {
  const userDataState = webgalStore.getState().userData;
  storeSet(WebGAL.gameKey, userDataState).then(() => {
    storeGet(WebGAL.gameKey).then((newUserData) => {
      // 如果没有数据，初始化
      if (!newUserData) {
        setStorage();
        return;
      }
      webgalStore.dispatch(resetUserData(normalizeUserData(newUserData as Partial<IUserData>)));
    });
    logger.info('同步本地存储');
  });
};

/**
 * 检查用户数据属性是否齐全
 * @param userData 需要检查的数据
 */
function checkUserDataProperty(userData: any) {
  return (
    checkStateProperty(userData, initState) &&
    checkStateProperty(userData.optionData, initState.optionData) &&
    checkStateProperty(userData.appreciationData, initState.appreciationData)
  );
}

function checkStateProperty(currentData: any, templateData: object) {
  if (!isObject(currentData)) {
    return false;
  }
  for (const key in templateData) {
    if (!Object.prototype.hasOwnProperty.call(currentData, key)) {
      return false;
    }
  }
  return true;
}

function normalizeUserData(userData: Partial<IUserData>): IUserData {
  const defaultUserData = cloneDeep(initState);
  const optionData: Record<string, any> = isObject(userData.optionData) ? userData.optionData : {};
  const appreciationData: Record<string, any> = isObject(userData.appreciationData) ? userData.appreciationData : {};

  return {
    ...defaultUserData,
    ...userData,
    scriptManagedGlobalVar: Array.isArray(userData.scriptManagedGlobalVar) ? userData.scriptManagedGlobalVar : [],
    globalGameVar: isObject(userData.globalGameVar) ? userData.globalGameVar : {},
    optionData: {
      ...defaultUserData.optionData,
      ...optionData,
    },
    appreciationData: {
      ...defaultUserData.appreciationData,
      ...appreciationData,
      bgm: Array.isArray(appreciationData.bgm) ? appreciationData.bgm : defaultUserData.appreciationData.bgm,
      cg: Array.isArray(appreciationData.cg) ? appreciationData.cg : defaultUserData.appreciationData.cg,
    },
    gameConfigInit: isObject(userData.gameConfigInit) ? userData.gameConfigInit : {},
    readHistory: isObject(userData.readHistory) ? userData.readHistory : {},
  };
}

function isObject(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function setStorageAsync() {
  const userDataState = webgalStore.getState().userData;
  return await storeSet(WebGAL.gameKey, userDataState);
}

export async function getStorageAsync() {
  const newUserData = await storeGet(WebGAL.gameKey);
  if (!newUserData) {
    const userDataState = webgalStore.getState().userData;
    logger.warn('现在重置数据');
    return await storeSet(WebGAL.gameKey, userDataState);
  }
  const shouldMigrate = !checkUserDataProperty(newUserData);
  const normalizedUserData = normalizeUserData(newUserData as Partial<IUserData>);
  webgalStore.dispatch(resetUserData(normalizedUserData));
  if (shouldMigrate) {
    logger.warn('检测到旧版本用户数据，已补齐默认字段');
    return await storeSet(WebGAL.gameKey, normalizedUserData);
  }
  return;
}
