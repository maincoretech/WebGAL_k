export {};

declare global {
  interface Window {
    __WEBGAL_DEVICE_INFO__?: {
      isIOS: boolean;
      isIOSPhone: boolean;
      isIPad: boolean;
    };
    /** 由 index.html 设置，Enter.tsx 调用以通知"用户已点击进入" */
    __enterPromiseResolve?: () => void;
    /** 由 index.html 设置，infoFetcher.ts 调用以通知"游戏配置已加载完毕" */
    renderPromiseResolve?: () => void;
    electronFuncs?: {
      steam?: {
        initialize: (appId: string) => boolean | Promise<boolean>;
        unlockAchievement: (achievementId: string) => boolean | Promise<boolean>;
      };
    };
  }
}
