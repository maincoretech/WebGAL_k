import se_pageFlip from '@/assets/se/switch.webm';
import se_switch from '@/assets/se/switch.webm';
import se_mouseEnter from '@/assets/se/mouse-enter.webm';
import se_dialog from '@/assets/se/click.webm';
import se_click from '@/assets/se/click.webm';

import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';

/**
 * 调用音效
 */
const useSoundEffect = () => {
  const playSeEnter = () => {
    stageStateManager.setStageAndCommit('uiSe', se_mouseEnter);
  };
  const playSeClick = () => {
    stageStateManager.setStageAndCommit('uiSe', se_click);
  };
  const playSeSwitch = () => {
    stageStateManager.setStageAndCommit('uiSe', se_switch);
  };
  const playSePageChange = () => {
    stageStateManager.setStageAndCommit('uiSe', se_pageFlip);
  };

  const playSeDialogOpen = () => {
    stageStateManager.setStageAndCommit('uiSe', se_dialog);
  };

  return {
    playSeEnter,
    playSeClick,
    playSePageChange,
    playSeDialogOpen,
    playSeSwitch,
  };
};

/**
 * 调用音效（只供 choose.tsx 使用）
 */
export const useSEByWebgalStore = () => {
  const playSeEnter = () => {
    stageStateManager.setStageAndCommit('uiSe', se_mouseEnter);
  };
  const playSeClick = () => {
    stageStateManager.setStageAndCommit('uiSe', se_click);
  };
  return {
    playSeEnter, // 鼠标进入
    playSeClick, // 鼠标点击
  };
};

export default useSoundEffect;
