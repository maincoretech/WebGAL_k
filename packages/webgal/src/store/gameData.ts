import { IUserData } from '@/store/userDataInterface';
import { getStorage } from '@/Core/controller/storage/storageController';
import { useSelector } from 'react-redux';
import { RootState, webgalStore } from '@/store/store';
import { showGlogalDialog } from '@/UI/GlobalDialog/GlobalDialog';
import localforage from 'localforage';
import { logger } from '@/Core/util/logger';
import useTrans from '@/hooks/useTrans';
import { WebGAL } from '@/Core/WebGAL';
import useSoundEffect from '@/hooks/useSoundEffect';
import savesReducer, { ISavesData, saveActions } from '@/store/savesReducer';
import { dumpFastSaveToStorage, dumpSavesToStorage } from '@/Core/controller/storage/savesController';

interface IExportGameData {
  userData: IUserData;
  saves: ISavesData;
}

// const userDataState = useSelector((state: RootState) => state.userData);
// const userSavesState = useSelector((state: RootState) => state.saveData);
// const dispatch = useDispatch();
// const setLanguage = useLanguage();
const t = useTrans('menu.options.pages.system.options.');
const { playSeDialogOpen } = useSoundEffect();

export function exportSaves(userData: IUserData, saves: ISavesData) {
  const gameData: IExportGameData = {
    userData,
    saves,
  };

  const savesJson = JSON.stringify(gameData);
  if (savesJson !== null) {
    downloadSave(savesJson);
  }
}

function downloadSave(savesJson: string) {
  const blob = new Blob([savesJson], { type: 'application/json' });
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = 'saves.json';
  a.click();
  a.remove();
}

function importSavesEventHandler(ev: any) {
  // const t = useTrans('menu.options.pages.system.options.');

  const file = ev.target.files[0];
  const reader = new FileReader();
  reader.onload = (evR) => {
    const saves = evR!.target!.result as string;
    try {
      const saveAsObj: IExportGameData = JSON.parse(saves);
      playSeDialogOpen();
      showGlogalDialog({
        title: t('gameSave.dialogs.import.title'),
        leftText: t('$common.yes'),
        rightText: t('$common.no'),
        leftFunc: async () => {
          await localforage.setItem(WebGAL.gameKey, saveAsObj.userData).then(() => {
            logger.info(t('gameSave.dialogs.import.tip'));
          });
          getStorage();
          webgalStore.dispatch(saveActions.replaceSaveGame(saveAsObj.saves.saveData));
          webgalStore.dispatch(saveActions.setFastSave(saveAsObj.saves.quickSaveData));
          dumpFastSaveToStorage();
          dumpSavesToStorage(0, 200);
        },
        rightFunc: () => {},
      });
    } catch (e) {
      logger.error(t('gameSave.dialogs.import.error'), e);
    }
    window.location.reload(); // dirty: 强制刷新 UI
  };
  reader.readAsText(file, 'UTF-8');
}

export function importSaves(userDataState: IUserData, userSavesState: ISavesData) {
  const inputElement = document.createElement('input');
  inputElement.type = 'file';
  inputElement.onchange = importSavesEventHandler;
  inputElement.click();
}
