import {
  commandType,
  IAsset,
  IScene,
  ISentence,
} from './interface/sceneInterface';
import { scriptParser } from './scriptParser/scriptParser';
import { fileType } from './interface/assets';
import { ConfigMap } from './config/scriptConfig';

/**
 * 场景解析器
 * @param rawScene 原始场景
 * @param sceneName 场景名称
 * @param sceneUrl 场景url
 * @param assetsPrefetcher
 * @param assetSetter
 * @param ADD_NEXT_ARG_LIST
 * @param SCRIPT_CONFIG_MAP
 * @return {IScene} 解析后的场景
 */
export const sceneParser = (
  rawScene: string,
  sceneName: string,
  sceneUrl: string,
  assetsPrefetcher: (assetList: Array<IAsset>) => void,
  assetSetter: (fileName: string, assetType: fileType) => string,
  ADD_NEXT_ARG_LIST: commandType[],
  SCRIPT_CONFIG_MAP: ConfigMap,
): IScene => {
  const rawSentenceList = rawScene.replaceAll('\r', '').split('\n'); // 原始句子列表

  const assetsList: Array<IAsset> = []; // 场景资源列表
  const subSceneList: Array<string> = []; // 子场景列表
  const sentenceList: Array<ISentence> = rawSentenceList.map(
    (sentence, index) => {
      const returnSentence: ISentence = scriptParser(
        sentence,
        assetSetter,
        ADD_NEXT_ARG_LIST,
        SCRIPT_CONFIG_MAP,
        index,
      );
      // 在这里解析出语句可能携带的资源和场景，合并到 assetsList 和 subSceneList
      for (const a of returnSentence.sentenceAssets) assetsList.push(a);
      for (const s of returnSentence.subScene) subSceneList.push(s);
      return returnSentence;
    },
  );

  // 开始资源的预加载（按 url 去重）
  const seen = new Set<string>();
  const uniqueAssets = assetsList.filter((a) => {
    if (seen.has(a.url)) return false;
    seen.add(a.url);
    return true;
  });
  assetsPrefetcher(uniqueAssets);

  return {
    sceneName: sceneName, // 场景名称
    sceneUrl: sceneUrl,
    sentenceList: sentenceList, // 语句列表
    assetsList: uniqueAssets, // 资源列表
    subSceneList: subSceneList, // 子场景列表
  };
};
