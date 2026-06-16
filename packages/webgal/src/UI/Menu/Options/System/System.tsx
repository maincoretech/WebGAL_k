import styles from '@/UI/Menu/Options/options.module.scss';
import { NormalOption } from '@/UI/Menu/Options/NormalOption';
import { NormalButton } from '@/UI/Menu/Options/NormalButton';
import { resetAllData, resetOptionSet, setOptionData } from '@/store/userDataReducer';
import { IUserData, playSpeed } from '@/store/userDataInterface';
import { backupSaves, getStorage, setStorage, dumpToStorageFast } from '@/Core/controller/storage/storageController';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, webgalStore } from '@/store/store';
import { showGlogalDialog } from '@/UI/GlobalDialog/GlobalDialog';
import localforage from 'localforage';
import { logger } from '@/Core/util/logger';
import useTrans from '@/hooks/useTrans';
import useLanguage from '@/hooks/useLanguage';
import languages, { language } from '@/config/language';
import { useState } from 'react';
import About from '@/UI/Menu/Options/System/About';
import { WebGAL } from '@/Core/WebGAL';
import useSoundEffect from '@/hooks/useSoundEffect';
import savesReducer, { ISavesData, saveActions } from '@/store/savesReducer';
import { dumpFastSaveToStorage, dumpSavesToStorage } from '@/Core/controller/storage/savesController';
import { OptionSlider } from '@/UI/Menu/Options/OptionSlider';
import { save, open } from '@tauri-apps/plugin-dialog';
import { writeTextFile, readTextFile } from '@tauri-apps/plugin-fs';

interface IExportGameData {
  userData: IUserData;
  saves: ISavesData;
}

export function System() {
  const userDataState = useSelector((state: RootState) => state.userData);
  const userSavesState = useSelector((state: RootState) => state.saveData);
  const dispatch = useDispatch();
  const setLanguage = useLanguage();
  const t = useTrans('menu.options.pages.system.options.');
  const { playSeDialogOpen, playSeEnter, playSeSwitch } = useSoundEffect();

  async function exportSaves() {
    const filePath = await save({
      filters: [{ name: 'JSON', extensions: ['json'] }],
      defaultPath: 'saves.json',
    });
    if (!filePath) return;
    await writeTextFile(filePath, JSON.stringify({ userData: userDataState, saves: userSavesState }));
  }

  async function importSaves() {
    const filePath = await open({
      filters: [{ name: 'JSON', extensions: ['json'] }],
      multiple: false,
    });
    if (!filePath) return;
    const content = await readTextFile(filePath as string);
    try {
      const saveAsObj: IExportGameData = JSON.parse(content);
      playSeDialogOpen();
      showGlogalDialog({
        title: t('gameSave.dialogs.import.title'),
        leftText: t('$common.yes'),
        rightText: t('$common.no'),
        leftFunc: async () => {
          await localforage.setItem(WebGAL.gameKey, saveAsObj.userData);
          logger.info(t('gameSave.dialogs.import.tip'));
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
  }

  const [showAbout, setShowAbout] = useState(false);
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);

  function toggleAbout() {
    setShowAbout(!showAbout);
  }

  return (
    <div className={styles.Options_main_content_half}>
      {showAbout && <About onClose={toggleAbout} />}
      {!showAbout && (
        <>
          <NormalOption key="option1" title={t('autoSpeed.title')}>
            <OptionSlider
              initValue={userDataState.optionData.autoSpeed}
              uniqueID={t('autoSpeed.title')}
              onChange={(event) => {
                const newValue = event.target.value;
                dispatch(setOptionData({ key: 'autoSpeed', value: Number(newValue) }));
                setStorage();
              }}
            />
          </NormalOption>
          <NormalOption key="skipAll" title={t('skipAll.title')}>
            <NormalButton
              textList={t('skipAll.options.read', 'skipAll.options.all')}
              functionList={[() => {
                dispatch(setOptionData({ key: 'skipAll', value: false }));
                setStorage();
              }, () => {
                dispatch(setOptionData({ key: 'skipAll', value: true }));
                setStorage();
              }]}
              currentChecked={userDataState.optionData.skipAll ? 1 : 0}
            />
          </NormalOption>
          <NormalOption key="option7" title={t('language.title')} style={{ zIndex: showLanguageSelect ? 1 : undefined }}>
            <div
              className={styles.Option_select}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setShowLanguageSelect(false);
              }}
            >
              <button
                type="button"
                className={`${styles.Option_select_button} ${
                  showLanguageSelect ? styles.Option_select_button_active : ''
                }`}
                onClick={() => {
                  playSeSwitch();
                  setShowLanguageSelect(!showLanguageSelect);
                }}
                onMouseEnter={playSeEnter}
              >
                {languages[language[userDataState.optionData.language]]}
              </button>
              <div className={`${styles.Option_select_menu} ${showLanguageSelect ? styles.Option_select_menu_open : ''}`}>
                  {Object.entries(languages).map(([key, name]) => {
                    const value = language[key as keyof typeof language] as language;
                    return (
                      <button
                        type="button"
                        key={key}
                        className={`${styles.Option_select_item} ${
                          value === userDataState.optionData.language
                            ? styles.Option_select_item_active
                            : ''
                        }`}
                        onClick={() => {
                          playSeSwitch();
                          setLanguage(value);
                          setShowLanguageSelect(false);
                        }}
                        onMouseEnter={playSeEnter}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
            </div>
          </NormalOption>
          <NormalOption key="option2" title={t('resetData.title')}>
            <NormalButton
              textList={t(
                'resetData.options.clearGameSave',
                'resetData.options.resetSettings',
                'resetData.options.clearAll',
              )}
              functionList={[
                () => {
                  playSeDialogOpen();
                  showGlogalDialog({
                    title: t('resetData.dialogs.clearGameSave'),
                    leftText: t('$common.yes'),
                    rightText: t('$common.no'),
                    leftFunc: () => {
                      backupSaves();
                      dispatch(saveActions.resetSaves());
                      dumpSavesToStorage(0, 200);
                      dumpFastSaveToStorage();
                    },
                    rightFunc: () => {},
                  });
                },
                () => {
                  playSeDialogOpen();
                  showGlogalDialog({
                    title: t('resetData.dialogs.resetSettings'),
                    leftText: t('$common.yes'),
                    rightText: t('$common.no'),
                    leftFunc: () => {
                      backupSaves();
                      dispatch(resetOptionSet());
                      dumpToStorageFast();
                    },
                    rightFunc: () => {},
                  });
                },
                () => {
                  playSeDialogOpen();
                  showGlogalDialog({
                    title: t('resetData.dialogs.clearAll'),
                    leftText: t('$common.yes'),
                    rightText: t('$common.no'),
                    leftFunc: () => {
                      backupSaves();
                      dispatch(resetAllData());
                      dumpToStorageFast();
                      dispatch(saveActions.resetSaves());
                      dumpSavesToStorage(0, 200);
                      dumpFastSaveToStorage();
                    },
                    rightFunc: () => {},
                  });
                },
              ]}
              currentChecked={3}
            />
          </NormalOption>
          <NormalOption key="option3" title={t('gameSave.title')}>
            <NormalButton
              textList={t('gameSave.options.export', 'gameSave.options.import')}
              functionList={[exportSaves, importSaves]}
              currentChecked={2}
            />
          </NormalOption>
          <div className={styles.About_title_text} onClick={toggleAbout}>
            <span className={styles.About_text}>{t('about.title')}</span>
          </div>
        </>
      )}
    </div>
  );
}
