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
export const assetSetter = (fileName: string, assetType: fileType): string => {
  // 是绝对链接，直接返回
  if (fileName.startsWith('http://') || fileName.startsWith('https://')) {
    return fileName;
  } else {
    // 根据类型拼接资源的相对路径
    let returnFilePath: string;
    switch (assetType) {
      case fileType.background:
        returnFilePath = `hexz://localhost/background/${fileName}`;
        break;
      case fileType.scene:
        returnFilePath = `hexz://localhost/scene/${fileName}`;
        break;
      case fileType.vocal:
        returnFilePath = `hexz://localhost/vocal/${fileName}`;
        break;
      case fileType.figure:
        returnFilePath = `hexz://localhost/figure/${fileName}`;
        break;
      case fileType.bgm:
        returnFilePath = `hexz://localhost/bgm/${fileName}`;
        break;
      case fileType.video:
        returnFilePath = `hexz://localhost/video/${fileName}`;
        break;
      default:
        returnFilePath = ``;
        break;
    }
    return returnFilePath;
  }
};
