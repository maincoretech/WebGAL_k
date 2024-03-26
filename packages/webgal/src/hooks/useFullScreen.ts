import { setStorage } from '@/Core/controller/storage/storageController';
import { RootState } from '@/store/store';
import { fullScreenOption } from '@/store/userDataInterface';
import { setOptionData } from '@/store/userDataReducer';
import { getCurrent } from '@tauri-apps/api/window';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { keyboard } from './useHotkey';
import { FullScreen } from '@icon-park/react';

export function useFullScreen() {
  const userDataState = useSelector((state: RootState) => state.userData);
  const GUIState = useSelector((state: RootState) => state.GUI);
  const dispatch = useDispatch();
  const fullScreen = userDataState.optionData.fullScreen;
  const isEnterGame = GUIState.isEnterGame;

  useEffect(() => {
    switch (fullScreen) {
      case fullScreenOption.on: {
        if (isEnterGame) {
          //getCurrent().maximize();
          document.documentElement.requestFullscreen();
          if (keyboard) keyboard.lock(['Escape', 'F11']);
        }
        break;
      }
      case fullScreenOption.off: {
        if (document.fullscreenElement) {
          //getCurrent().setFullscreen(false);
          document.exitFullscreen();
          if (keyboard) keyboard.unlock();
        }
        break;
      }
    }
  }, [fullScreen]);
}
