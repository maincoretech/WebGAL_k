import styles from './globalDialog.module.scss';
import { useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState, webgalStore } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { exit } from '@tauri-apps/plugin-process';
import { renderTo, clearContainer } from '@/Core/util/portal';

interface DialogProps {
  title: string;
  leftText: string;
  rightText?: string;
  leftFunc?: () => void;
  rightFunc?: () => void;
  onEnter?: () => void;
  onClick?: () => void;
}

let pendingProps: DialogProps | null = null;

export default function GlobalDialog() {
  const isShow = useSelector((state: RootState) => state.GUI.showGlobalDialog);
  const isEnterGame = useSelector((state: RootState) => state.GUI.isEnterGame);

  // After React mounts the container, render dialog content
  useEffect(() => {
    if (isShow && pendingProps) {
      const p = pendingProps;
      const handleLeft = () => { p.onClick?.(); p.leftFunc?.(); hideGlobalDialog(); };
      const handleRight = () => { p.onClick?.(); p.rightFunc?.(); hideGlobalDialog(); };
      renderTo('globalDialogContainer',
        <div className={styles.GlobalDialog_main}>
          <div className={styles.glabalDialog_container}>
            <div className={styles.glabalDialog_container_inner}>
              <div className={styles.title}>{p.title}</div>
              <div className={styles.button_list}>
                {p.leftText && (
                  <div className={styles.button} onClick={handleLeft} onMouseEnter={p.onEnter}>
                    {p.leftText}
                  </div>
                )}
                {p.rightText && (
                  <div className={styles.button} onClick={handleRight} onMouseEnter={p.onEnter}>
                    {p.rightText}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
    if (!isShow) {
      pendingProps = null;
      clearContainer('globalDialogContainer');
    }
  }, [isShow]);

  return isShow ? <div id="globalDialogContainer" /> : null;
}

export function showGlobalDialog(props: DialogProps) {
  pendingProps = props;
  webgalStore.dispatch(setVisibility({ component: 'showGlobalDialog', visibility: true }));
}

export function hideGlobalDialog() {
  webgalStore.dispatch(setVisibility({ component: 'showGlobalDialog', visibility: false }));
}

export function showControls() {
  webgalStore.dispatch(setVisibility({ component: 'showControls', visibility: true }));
}

// 兼容旧引用
export { showGlobalDialog as showGlogalDialog };

export function hideControls() {
  webgalStore.dispatch(setVisibility({ component: 'showControls', visibility: false }));
}

export function switchControls() {
  if (webgalStore.getState().GUI.showControls === true) {
    hideControls();
  } else {
    showControls();
  }
}
