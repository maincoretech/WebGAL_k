/**
 * @file 资源的引入可能是绝对链接，也可能是文件名，必须做必要的处理。
 */

/**
 * 内置资源类型的枚举
 */
export enum fileType {
  background,
  bgm,
  figure,
  scene,
  tex,
  vocal,
  video,
}

/**
 * 获取资源路径
 * @param fileName 资源的名称或地址
 * @param assetType 资源类型
 * @return {string} 处理后的资源路径（绝对或相对）
 */
// On Tauri desktop: WKWebView → MacIntel, WebView2 → Win32
const isWindows = /win/i.test(navigator.platform ?? '');
const PREFIX = isWindows ? './game/' : 'hexz://localhost/';

/** Resolve a hexz-archive path to the platform-appropriate URL. */
export const resolveHexzUrl = (relativePath: string) => `${PREFIX}${relativePath}`;

export const assetSetter = (fileName: string, assetType: fileType): string => {
  if (fileName.startsWith('http://') || fileName.startsWith('https://')) {
    return fileName;
  } else {
    let returnFilePath: string;
    switch (assetType) {
      case fileType.background:
        returnFilePath = `${PREFIX}background/${fileName}`;
        break;
      case fileType.scene:
        returnFilePath = `${PREFIX}scene/${fileName}`;
        break;
      case fileType.vocal:
        returnFilePath = `${PREFIX}vocal/${fileName}`;
        break;
      case fileType.figure:
        returnFilePath = `${PREFIX}figure/${fileName}`;
        break;
      case fileType.bgm:
        returnFilePath = `${PREFIX}bgm/${fileName}`;
        break;
      case fileType.video:
        returnFilePath = `${PREFIX}video/${fileName}`;
        break;
      default:
        returnFilePath = ``;
        break;
    }
    return returnFilePath;
  }
};
