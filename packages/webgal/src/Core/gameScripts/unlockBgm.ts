import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { createNonePerform, IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';
import { unlockBgmInUserData } from '@/store/userDataReducer';
import { storeSet } from '@/Core/util/lite';
import { logger } from '@/Core/util/logger';

import { WebGAL } from '@/Core/WebGAL';
import { getStringArgByKey } from '../util/getSentenceArg';

/**
 * 解锁bgm
 * @param sentence
 */
export const unlockBgm = (sentence: ISentence): IPerform => {
  const url = sentence.content;
  const name = getStringArgByKey(sentence, 'name') ?? sentence.content;
  const series = getStringArgByKey(sentence, 'series') ?? 'default';
  logger.info(`解锁BGM：${name}，路径：${url}，所属系列：${series}`);
  webgalStore.dispatch(unlockBgmInUserData({ name, url, series }));
  const userDataState = webgalStore.getState().userData;
  storeSet(WebGAL.gameKey, userDataState);
  return createNonePerform();
};
