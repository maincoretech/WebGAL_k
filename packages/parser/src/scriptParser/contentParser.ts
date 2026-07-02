import { commandType } from '../interface/sceneInterface';
import { fileType } from '../interface/assets';

/** Maps command types to their asset file type for content path resolution. */
const CONTENT_FILE_TYPE: Partial<Record<commandType, fileType>> = {
  [commandType.playEffect]: fileType.vocal,
  [commandType.changeBg]: fileType.background,
  [commandType.changeFigure]: fileType.figure,
  [commandType.bgm]: fileType.bgm,
  [commandType.callScene]: fileType.scene,
  [commandType.changeScene]: fileType.scene,
  [commandType.miniAvatar]: fileType.figure,
  [commandType.video]: fileType.video,
  [commandType.unlockBgm]: fileType.bgm,
  [commandType.unlockCg]: fileType.background,
};

/**
 * 解析语句内容的函数，主要作用是把文件名改为绝对地址或相对地址（根据使用情况而定）
 * @param contentRaw 原始语句内容
 * @param type 语句类型
 * @param assetSetter
 * @return {string} 解析后的语句内容
 */
export const contentParser = (
  contentRaw: string,
  type: commandType,
  assetSetter: (name: string, ft: fileType) => string,
) => {
  if (contentRaw === 'none' || contentRaw === '') {
    return '';
  }
  if (type === commandType.choose) {
    return getChooseContent(contentRaw, assetSetter);
  }
  const ft = CONTENT_FILE_TYPE[type];
  return ft ? assetSetter(contentRaw, ft) : contentRaw;
};

function getChooseContent(contentRaw: string, assetSetter: (name: string, ft: fileType) => string): string {
  const chooseList = contentRaw.split(/(?<!\\)\|/);
  const parts: string[] = [];
  for (const e of chooseList) {
    const colonIdx = e.search(/(?<!\\):/);
    const key = colonIdx >= 0 ? e.slice(0, colonIdx) : e;
    const val = colonIdx >= 0 ? e.slice(colonIdx + 1) : '';
    const resolved = val.includes('.') ? assetSetter(val, fileType.scene) : val;
    parts.push(`${key}:${resolved}`);
  }
  return parts.join('|');
}
