/**
 * @file 引擎初始化时会执行的脚本，包括获取游戏信息，初始化运行时变量，初始化用户数据存储
 */
import { logger } from './util/logger';
import { infoFetcher } from './util/coreInitialFunction/infoFetcher';
import { assetSetter, fileType, resolveHexzUrl } from './util/gameAssetsAccess/assetSetter';
import { sceneFetcher } from './controller/scene/sceneFetcher';
import { sceneParser } from './parser/sceneParser';
import { bindExtraFunc } from '@/Core/util/coreInitialFunction/bindExtraFunc';
import { startPreviewSyncRuntime } from '@/Core/util/syncWithEditor/previewSyncRuntime';
import PixiStage from '@/Core/controller/stage/pixi/PixiController';
import { syncPixiStageState } from '@/Core/controller/stage/pixi/syncPixiStageState';
import { hexzJson } from './util/hexzFetch';
import { __INFO } from '@/config/info';
import { WebGAL } from '@/Core/WebGAL';
import { loadTemplate } from '@/Core/util/coreInitialFunction/templateLoader';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';
import { autoFastSaveGame } from './controller/storage/fastSaveLoad';

export const isIOS = window.__WEBGAL_DEVICE_INFO__?.isIOS ?? false; // 判断是否是 iOS 终端

/**
 * 引擎初始化函数
 */
export const initializeScript = (): void => {
  // 打印初始log信息
  logger.info(`WebGAL v${__INFO.version}`);
  logger.info('Github: https://github.com/OpenWebGAL/WebGAL ');
  logger.info('Made with ❤ by OpenWebGAL');
  logger.info('The K mode (Modified)');
  loadTemplate().catch(() => {});
  // 激活强制缩放
  // 在调整窗口大小时重新计算宽高，设计稿按照 1600*900。
  if (isIOS && window.innerWidth <= window.innerHeight) {
    /**
     * iOS
     */
    alert(
      `iOS 用户请横屏后刷新页面，以获得最佳体验
| Please rotate to landscape and refresh the page on iOS for the best experience
| iOS ユーザーは横画面にしてからページを再読み込みしてください`,
    );
  }

  // 获得 userAnimation
  loadStyle(resolveHexzUrl('userStyleSheet.css'));
  getUserAnimation();
  const sceneUrl: string = assetSetter('start.txt', fileType.scene);
  sceneFetcher(sceneUrl).then((rawScene) => {
    WebGAL.sceneManager.sceneData.currentScene = sceneParser(rawScene, 'start.txt', sceneUrl);
    WebGAL.sceneManager.settledScenes.add(sceneUrl);
  });
  infoFetcher(resolveHexzUrl('config.txt'));
  /**
   * 启动Pixi
   */
  WebGAL.gameplay.pixiStage = new PixiStage();
  stageStateManager.setCommitHandler((stageState, options) => {
    syncPixiStageState(stageState, options);
    if (options.notifyReact) autoFastSaveGame();
  });

  /**
   * iOS 设备 卸载所有 Service Worker
   */
  // if ('serviceWorker' in navigator && isIOS) {
  //   navigator.serviceWorker.getRegistrations().then((registrations) => {
  //     for (const registration of registrations) {
  //       registration.unregister().then(() => {
  //         logger.info('已卸载 Service Worker');
  //       });
  //     }
  //   });
  // }

  /**
   * 绑定工具函数
   */
  bindExtraFunc();
  startPreviewSyncRuntime();
};

function loadStyle(url: string) {
  const link = document.createElement('link');
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = url;
  const head = document.getElementsByTagName('head')[0];
  head.appendChild(link);
}

function getUserAnimation() {
  hexzJson<string[]>('animation/animationTable.json').then((animations) => {
    for (const animationName of animations) {
      hexzJson(`animation/${animationName}.json`).then((data) => {
        if (data) {
          const userAnimation = {
            name: animationName,
            effects: data,
          };
          WebGAL.animationManager.addAnimation(userAnimation);
        }
      });
    }
  });
}
