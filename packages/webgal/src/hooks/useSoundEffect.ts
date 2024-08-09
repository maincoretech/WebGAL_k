import { setStage } from '@/store/stageReducer';

import se_pageFlip from '@/assets/se/switch.opus';
import se_switch from '@/assets/se/switch.opus';
import se_mouseEnter from '@/assets/se/mouse-enter.opus';
import se_dialog from '@/assets/se/click.opus';
import se_click from '@/assets/se/click.opus';
import { useDispatch } from 'react-redux';
import { webgalStore } from '@/store/store';

/**
 * 调用音效
 */
const useSoundEffect = () => {
  const dispatch = useDispatch();

  const playSeEnter = () => {
    dispatch(setStage({ key: 'uiSe', value: se_mouseEnter }));
  };
  const playSeClick = () => {
    dispatch(setStage({ key: 'uiSe', value: se_click }));
  };
  const playSeSwitch = () => {
    dispatch(setStage({ key: 'uiSe', value: se_switch }));
  };
  const playSePageChange = () => {
    dispatch(setStage({ key: 'uiSe', value: se_pageFlip }));
  };

  const playSeDialogOpen = () => {
    dispatch(setStage({ key: 'uiSe', value: se_dialog }));
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
    webgalStore.dispatch(setStage({ key: 'uiSe', value: se_mouseEnter }));
  };
  const playSeClick = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: se_click }));
  };
  return {
    playSeEnter, // 鼠标进入
    playSeClick, // 鼠标点击
  };
};

export default useSoundEffect;
