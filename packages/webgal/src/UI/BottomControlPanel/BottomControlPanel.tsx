/* import {
  AlignTextLeftOne,
  DoubleRight,
  FolderOpen,
  Home,
  PlayOne,
  PreviewCloseOne,
  PreviewOpen,
  ReplayMusic,
  Save,
  SettingTwo,
  DoubleDown,
  DoubleUp,
  Lock,
  Unlock,
} from '@icon-park/react'; */
import styles from './bottomControlPanel.module.scss';
import { switchAuto } from '@/Core/controller/gamePlay/autoPlay';
import { switchFast } from '@/Core/controller/gamePlay/fastSkip';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setMenuPanelTag, setVisibility } from '@/store/GUIReducer';
import { componentsVisibility, MenuPanelTag } from '@/store/guiInterface';
import { backToTitle } from '@/Core/controller/gamePlay/backToTitle';
import { saveGame } from '@/Core/controller/storage/saveGame';
import { loadGame } from '@/Core/controller/storage/loadGame';
import useTrans from '@/hooks/useTrans';
import { useTranslation } from 'react-i18next';
import useSoundEffect from '@/hooks/useSoundEffect';
import { showGlogalDialog, switchControls } from '@/UI/GlobalDialog/GlobalDialog';
import { useEffect } from 'react';
import { getSavesFromStorage } from '@/Core/controller/storage/savesController';
import { easyCompile } from '@/UI/Menu/SaveAndLoad/Save/Save';

export const BottomControlPanel = () => {
  const t = useTrans('gaming.');
  const strokeWidth = 2.5;
  const { i18n } = useTranslation();
  const { playSeEnter, playSeClick, playSeDialogOpen } = useSoundEffect();
  const lang = i18n.language;
  const isFr = lang === 'fr';
  let size = 42;
  let fontSize = '150%';
  if (isFr) {
    fontSize = '125%';
    size = 40;
  }
  const GUIStore = useSelector((state: RootState) => state.GUI);
  const stageState = useSelector((state: RootState) => state.stage);
  const dispatch = useDispatch();
  const setComponentVisibility = (component: keyof componentsVisibility, visibility: boolean) => {
    dispatch(setVisibility({ component, visibility }));
  };
  const setMenuPanel = (menuPanel: MenuPanelTag) => {
    dispatch(setMenuPanelTag(menuPanel));
  };

  const saveData = useSelector((state: RootState) => state.saveData.saveData);
  let fastSlPreview = (
    <div style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ fontSize: '125%' }}>{t('noSaving')}</div>
    </div>
  );
  if (saveData[0]) {
    const data = saveData[0];
    fastSlPreview = (
      <div className={styles.slPreviewMain}>
        <div className={styles.imgContainer}>
          <img style={{ height: '100%' }} alt="q-save-preview image" src={data.previewImage} />
        </div>
        <div className={styles.textContainer}>
          <div>{easyCompile(data.nowStageState.showName)}</div>
          <div style={{ fontSize: '75%', color: '#ffffffaa' }}>{easyCompile(data.nowStageState.showText)}</div>
        </div>
      </div>
    );
  }

  return (
    // <div className={styles.ToCenter}>
    <>
      {GUIStore.showTextBox && stageState.enableFilm === '' && (
        <>
          <div className={styles.main_top} style={{ visibility: GUIStore.controlsVisibility ? 'visible' : 'hidden' }}>
            <span
              className={styles.singleButton}
              style={{ fontSize }}
              onClick={() => {
                setComponentVisibility('showBacklog', true);
                setComponentVisibility('showTextBox', false);
                playSeClick();
              }}
              onMouseEnter={playSeEnter}
            >
              <i className="bi bi-file-text" />
              {/* <span className={styles.button_text}>{t('buttons.backlog')}</span> */}
            </span>
            <span
              className={styles.singleButton}
              style={{ fontSize }}
              onClick={() => {
                let VocalControl: any = document.getElementById('currentVocal');
                if (VocalControl !== null) {
                  VocalControl.currentTime = 0;
                  VocalControl.pause();
                  VocalControl?.play();
                }
                playSeClick();
              }}
              onMouseEnter={playSeEnter}
            >
              <i className="bi bi-arrow-clockwise" />
              {/* <span className={styles.button_text}>{t('buttons.replay')}</span> */}
            </span>
            <span
              id="Button_ControlPanel_auto"
              className={styles.singleButton}
              style={{ fontSize }}
              onClick={() => {
                switchAuto();
                playSeClick();
              }}
              onMouseEnter={playSeEnter}
            >
              <i className="bi bi-play" />
              {/* <span className={styles.button_text}>{t('buttons.auto')}</span> */}
            </span>
            <span
              id="Button_ControlPanel_fast"
              className={styles.singleButton}
              style={{ fontSize }}
              onClick={() => {
                switchFast();
                playSeClick();
              }}
              onMouseEnter={playSeEnter}
            >
              <i className="bi bi-fast-forward" />
              {/* <span className={styles.button_text}>{t('buttons.forward')}</span> */}
            </span>
            {GUIStore.showTextBox && (
              <span
                className={styles.singleButton}
                style={{ fontSize }}
                onClick={() => {
                  setComponentVisibility('showTextBox', false);
                  playSeClick();
                }}
                onMouseEnter={playSeEnter}
              >
                <i className="bi bi-eye-slash" />
                {/* <span className={styles.button_text}>{t('buttons.hide')}</span> */}
              </span>
            )}
            {!GUIStore.showTextBox && (
              <span
                className={styles.singleButton}
                style={{ fontSize }}
                onClick={() => {
                  setComponentVisibility('showTextBox', true);
                  playSeClick();
                }}
                onMouseEnter={playSeEnter}
              >
                <i className="bi bi-eye" />
                {/* <span className={styles.button_text}>{t('buttons.show')}</span> */}
              </span>
            )}
            <span
              className={styles.singleButton}
              style={{ fontSize }}
              onClick={() => {
                switchControls();
                playSeClick();
              }}
              onMouseEnter={playSeEnter}
            >
              {GUIStore.showControls ? <i className="bi bi-lock" /> : <i className="bi bi-unlock" />}
            </span>
          </div>
          <div
            className={styles.main_bottom}
            style={{ visibility: GUIStore.controlsVisibility ? 'visible' : 'hidden' }}
          >
            <span
              className={styles.singleButton + ' ' + styles.fastsave}
              style={{ fontSize }}
              onClick={() => {
                showGlogalDialog({
                  title: t('buttons.qsTips'),
                  leftText: t('$common.yes'),
                  rightText: t('$common.no'),
                  leftFunc: () => {
                    saveGame(0);
                  },
                  rightFunc: () => {},
                });
                playSeClick();
              }}
              onMouseEnter={playSeEnter}
            >
              <i className="bi bi-chevron-double-down" />
              <span className={styles.button_text}>{t('buttons.quicklySave')}</span>
              <div className={styles.fastSlPreview + ' ' + styles.fastSPreview}>{fastSlPreview}</div>
            </span>
            <span
              className={styles.singleButton + ' ' + styles.fastload}
              style={{ fontSize }}
              onClick={() => {
                showGlogalDialog({
                  title: t('buttons.qlTips'),
                  leftText: t('$common.yes'),
                  rightText: t('$common.no'),
                  leftFunc: () => {
                    loadGame(0);
                  },
                  rightFunc: () => {},
                });
                playSeClick();
              }}
              onMouseEnter={playSeEnter}
            >
              <i className="bi bi-chevron-double-up" />
              <span className={styles.button_text}>{t('buttons.quicklyLoad')}</span>
              <div className={styles.fastSlPreview + ' ' + styles.fastLPreview}>{fastSlPreview}</div>
            </span>
            <span
              className={styles.singleButton}
              style={{ fontSize }}
              onClick={() => {
                setMenuPanel(MenuPanelTag.Save);
                setComponentVisibility('showMenuPanel', true);
                playSeClick();
              }}
              onMouseEnter={playSeEnter}
            >
              <i className="bi bi-floppy2" />
              <span className={styles.button_text}>{t('buttons.save')}</span>
            </span>
            <span
              className={styles.singleButton}
              style={{ fontSize }}
              onClick={() => {
                setMenuPanel(MenuPanelTag.Load);
                setComponentVisibility('showMenuPanel', true);
                playSeClick();
              }}
              onMouseEnter={playSeEnter}
            >
              <i className="bi bi-folder2-open" />
              <span className={styles.button_text}>{t('buttons.load')}</span>
            </span>
            <span
              className={styles.singleButton}
              style={{ fontSize }}
              onClick={() => {
                setMenuPanel(MenuPanelTag.Option);
                setComponentVisibility('showMenuPanel', true);
                playSeClick();
              }}
              onMouseEnter={playSeEnter}
            >
              <i className="bi bi-sliders2" />
              <span className={styles.button_text}>{t('buttons.options')}</span>
            </span>
            <span
              className={styles.singleButton}
              style={{ fontSize }}
              onClick={() => {
                playSeDialogOpen();
                showGlogalDialog({
                  title: t('buttons.titleTips'),
                  leftText: t('$common.yes'),
                  rightText: t('$common.no'),
                  leftFunc: () => {
                    backToTitle();
                  },
                  rightFunc: () => {},
                });
              }}
              onMouseEnter={playSeEnter}
            >
              <i className="bi bi-house" />
              <span className={styles.button_text}>{t('buttons.title')}</span>
            </span>
          </div>
        </>
      )}
    </>
    // </div>
  );
};
