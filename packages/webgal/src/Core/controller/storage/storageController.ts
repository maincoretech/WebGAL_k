import * as localforage from 'localforage';
import { IUserData } from '@/store/userDataInterface';
import { logger } from '../../util/logger';
import { webgalStore } from '@/store/store';
import { initState, resetUserData } from '@/store/userDataReducer';
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
  localforage.setItem(WebGAL.gameKey, userDataState).then(() => {
    logger.info('写入本地存储');
    syncSaves();
  });
}, 100);

/**
 * 从本地存储获取数据
 */
export const getStorage = debounce(() => {
  localforage.getItem(WebGAL.gameKey).then((newUserData) => {
    // 如果没有数据或者属性不完全，重新初始化
    if (!newUserData || !checkUserDataProperty(newUserData)) {
      logger.warn('现在重置数据');
      setStorage();
      return;
    }
    webgalStore.dispatch(resetUserData(newUserData as IUserData));
  });
}, 100);

/**
 * 防抖函数
 * @param func 要执行的函数
 * @param wait 防抖等待时间
 */
function debounce<T, K>(func: (...args: T[]) => K, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;

  function context(...args: T[]): K {
    clearTimeout(timeout);
    let ret!: K;
    timeout = setTimeout(() => {
      ret = func.apply(context, args);
    }, wait);
    return ret;
  }

  return context;
}

export const dumpToStorageFast = () => {
  const userDataState = webgalStore.getState().userData;
  localforage.setItem(WebGAL.gameKey, userDataState).then(() => {
    localforage.getItem(WebGAL.gameKey).then((newUserData) => {
      // 如果没有数据，初始化
      if (!newUserData) {
        setStorage();
        return;
      }
      webgalStore.dispatch(resetUserData(newUserData as IUserData));
    });
    logger.info('同步本地存储');
  });
};

/**
 * 检查用户数据属性是否齐全
 * @param userData 需要检查的数据
 */
function checkUserDataProperty(userData: any) {
  let result = true;
  for (const key in initState) {
    if (!userData.hasOwnProperty(key)) {
      result = false;
    }
  }
  return result;
}

export async function setStorageAsync() {
  const userDataState = webgalStore.getState().userData;
  return await localforage.setItem(WebGAL.gameKey, userDataState);
}

export async function getStorageAsync() {
  const newUserData = await localforage.getItem(WebGAL.gameKey);
  if (!newUserData || !checkUserDataProperty(newUserData)) {
    const userDataState = webgalStore.getState().userData;
    logger.warn('现在重置数据');
    return await localforage.setItem(WebGAL.gameKey, userDataState);
  } else webgalStore.dispatch(resetUserData(newUserData as IUserData));
  return;
}
