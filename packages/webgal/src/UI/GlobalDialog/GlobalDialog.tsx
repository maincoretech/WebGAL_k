import styles from './globalDialog.module.scss';
import ReactDOM from 'react-dom';
import { useSelector } from 'react-redux';
import { RootState, webgalStore } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { exit } from '@tauri-apps/plugin-process';

export default function GlobalDialog() {
  const isGlobalDialogShow = useSelector((state: RootState) => state.GUI.showGlobalDialog);
  return <>{isGlobalDialogShow && <div id="globalDialogContainer" />}</>;
}

interface IShowGlobalDialogProps {
  title: string;
  leftText: string;
  rightText?: string;
  leftFunc?: () => void;
  rightFunc?: () => void;
  onEnter?: () => void;
  onClick?: () => void;
}

export function showGlobalDialog(props: IShowGlobalDialogProps) {
  webgalStore.dispatch(setVisibility({ component: 'showGlobalDialog', visibility: true }));
  const click = props.onClick;
  const enter = props.onEnter;
  const handleLeft = () => {
    click?.();
    props.leftFunc?.();
    hideGlobalDialog();
  };
  const handleRight = () => {
    click?.();
    props.rightFunc?.();
    hideGlobalDialog();
  };
  const renderElement = (
    <div className={styles.GlobalDialog_main}>
      <div className={styles.glabalDialog_container}>
        <div className={styles.glabalDialog_container_inner}>
          <div className={styles.title}>{props.title}</div>
          <div className={styles.button_list}>
            {props.leftText && (
              <div className={styles.button} onClick={handleLeft} onMouseEnter={enter}>
                {props.leftText}
              </div>
            )}
            {props.rightText && (
              <div className={styles.button} onClick={handleRight} onMouseEnter={enter}>
                {props.rightText}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  setTimeout(() => {
    // eslint-disable-next-line react/no-deprecated
    ReactDOM.render(renderElement, document.getElementById('globalDialogContainer'));
  }, 100);
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
