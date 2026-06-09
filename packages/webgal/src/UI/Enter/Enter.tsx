import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { isIOS } from '@/Core/initializeScript';
import styles from './enter.module.scss';

const ANIMATION_DURATION = 1600;

/**
 * 落地页组件 — "PRESS TO START" 界面
 * 从 index.html 提取，由 React 框架接管渲染与交互逻辑。
 *
 * 协调流程：
 *   1. 用户点击 → 播放淡出动画，同时调用 window.__enterPromiseResolve()
 *   2. index.html 中的 Promise.all([enterPromise, renderPromise]) 等待两者就绪
 *   3. 就绪后自动点击 .title__enter-game-target，触发 BGM 播放与 isEnterGame 状态
 */
export default function Enter() {
  const showStarter = useSelector((state: RootState) => state.GUI.showStarter);
  const dispatch = useDispatch();
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // iOS 设备跳过动画，直接隐藏
  useEffect(() => {
    if (isIOS && showStarter) {
      dispatch(setVisibility({ component: 'showStarter', visibility: false }));
      // iOS 上也需要 resolve enterPromise
      window.__enterPromiseResolve?.();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleClick = useCallback(() => {
    if (isExiting || isIOS) return;
    setIsExiting(true);

    // 延迟 resolve enterPromise，防止主线程瞬间卡死导致 CSS 动画跳帧
    setTimeout(() => {
      window.__enterPromiseResolve?.();
    }, 600); // 等待光条滑动动画完成

    // 动画结束后隐藏组件
    timerRef.current = setTimeout(() => {
      dispatch(setVisibility({ component: 'showStarter', visibility: false }));
    }, ANIMATION_DURATION);
  }, [isExiting, dispatch]);

  if (!showStarter) return null;

  return (
    <div
      className={`${styles.container} ${isExiting ? styles.containerExiting : ''}`}
      onClick={handleClick}
    >
      <div className={styles.content}>
        <div className={styles.startIndicator}>
          <div className={styles.lightBarLeft} />
          <div className={styles.triangle} />
          <div className={styles.lightBarRight} />
        </div>
        <div className={styles.tapText}>TAP TO START</div>
      </div>
    </div>
  );
}
