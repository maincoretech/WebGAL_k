import styles from './backlog.module.scss';
// import { CloseSmall, Return, VolumeNotice } from '@icon-park/react';
import { jumpFromBacklog } from '@/Core/controller/storage/jumpFromBacklog';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, webgalStore } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { logger } from '@/Core/util/logger';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import useTrans from '@/hooks/useTrans';
import { compileSentence, EnhancedNode } from '@/Stage/TextBox/TextBox';
import useSoundEffect from '@/hooks/useSoundEffect';
import { WebGAL } from '@/Core/WebGAL';

export const Backlog = () => {
  const t = useTrans('gaming.');
  // logger.info('Backlog render');
  const { playSeEnter, playSeClick } = useSoundEffect();
  const GUIStore = useSelector((state: RootState) => state.GUI);
  const isBacklogOpen = GUIStore.showBacklog;
  const dispatch = useDispatch();
  const iconSize = '0.8em';
  const [indexHide, setIndexHide] = useState(false);
  const [isDisableScroll, setIsDisableScroll] = useState(false);
  const [limit, setLimit] = useState(20);
  useEffect(() => {
    if (!isBacklogOpen) {
      return;
    }
    let options = {
      root: null,
      rootMargin: '0px',
      threshold: [1.0],
    };

    let observer = new IntersectionObserver((entries) => {
      if ((entries?.[0]?.intersectionRatio ?? 0) <= 0) return;
      setLimit(limit + 20);
    }, options);

    const observeTarget = document.querySelector(`#backlog_item_${limit - 5}`);
    if (observeTarget) {
      observer.observe(observeTarget);
    }

    return () => {
      observer.disconnect();
    };
  }, [limit, isBacklogOpen]);

  useEffect(() => {
    if (!isBacklogOpen) {
      setLimit(20);
    }
  }, [isBacklogOpen]);

  let timeRef = useRef<ReturnType<typeof setTimeout>>();
  // 缓存一下vdom
  const backlogList = useMemo<any>(() => {
    let backlogs = [];
    const current_backlog_len = WebGAL.backlogManager.getBacklog().length;
    // logger.info('backlogList render');
    for (let i = 0; i < Math.min(current_backlog_len, limit); i++) {
      const indexOfBacklog = current_backlog_len - i - 1;
      const backlogItem = WebGAL.backlogManager.getBacklog()[indexOfBacklog];
      const showTextArray = compileSentence(backlogItem.currentStageState.showText, 3, true, false);
      const showTextArray2 = showTextArray.map((line) => {
        return line.map((c) => {
          return c.reactNode;
        });
      });
      const showTextArrayReduced = mergeStringsAndKeepObjects(showTextArray2);
      const showTextElementList = showTextArrayReduced.map((line, index) => {
        return (
          <div key={`backlog-line-${index}`}>
            {line.map((e, index) => {
              if (e === '<br />') {
                return <br key={`br${index}`} />;
              } else {
                return e;
              }
            })}
          </div>
        );
      });
      const showNameArray = compileSentence(backlogItem.currentStageState.showName, 3, true);
      const showNameArray2 = showNameArray.map((line) => {
        return line.map((c) => {
          return c.reactNode;
        });
      });
      const showNameArrayReduced = mergeStringsAndKeepObjects(showNameArray2);
      const nameElementList = showNameArrayReduced.map((line, index) => {
        return (
          <div key={`backlog-line-${index}`}>
            {line.map((e, index) => {
              if (e === '<br />') {
                return <br key={`br${index}`} />;
              } else {
                return e;
              }
            })}
          </div>
        );
      });
      const singleBacklogView = (
        <div
          className={styles.backlog_item}
          id={`backlog_item_${i}`}
          style={{ animationDelay: `${20 * ((i - 1) % 20)}ms` }}
          key={'backlogItem' + backlogItem.currentStageState.showText + backlogItem.saveScene.currentSentenceId}
        >
          <div className={styles.backlog_func_area}>
            <div className={styles.backlog_item_button_list}>
              <div
                onClick={(e) => {
                  playSeClick();
                  jumpFromBacklog(indexOfBacklog);
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onMouseEnter={playSeEnter}
                className={styles.backlog_item_button_element}
              >
                {/* <Return theme="outline" size={iconSize} fill="#ffffff" strokeWidth={3} /> */}
                <i className="bi bi-arrow-right" />
              </div>
              {backlogItem.currentStageState.vocal ? (
                <div
                  onClick={() => {
                    playSeClick();
                    // 获取到播放 backlog 语音的元素
                    const backlog_audio_element: any = document.getElementById(
                      'backlog_audio_play_element_' + indexOfBacklog,
                    );
                    if (backlog_audio_element) {
                      const backlog_audio_elements = document.querySelectorAll<HTMLAudioElement>(
                        'audio[id*="backlog_audio_play_element"], audio[id="currentVocal"]',
                      );
                      backlog_audio_elements.forEach((audio) => {
                        audio.pause();
                      });
                      backlog_audio_element.currentTime = 0;
                      const userDataStore = webgalStore.getState().userData;
                      const mainVol = userDataStore.optionData.volumeMain;
                      backlog_audio_element.volume = mainVol * 0.01 * userDataStore.optionData.vocalVolume * 0.01;
                      backlog_audio_element?.play();
                    }
                  }}
                  onMouseEnter={playSeEnter}
                  className={styles.backlog_item_button_element}
                >
                  {/* <VolumeNotice theme="outline" size={iconSize} fill="#ffffff" strokeWidth={3} /> */}
                  <i className="bi bi-soundwave" />
                </div>
              ) : null}
            </div>
            <div className={styles.backlog_item_content_name}>{nameElementList}</div>
          </div>
          <div className={styles.backlog_item_content}>
            <span className={styles.backlog_item_content_text}>{showTextElementList}</span>
          </div>
          <audio id={'backlog_audio_play_element_' + indexOfBacklog} src={backlogItem.currentStageState.vocal} />
        </div>
      );
      backlogs.push(singleBacklogView);
    }
    return backlogs;
  }, [
    WebGAL.backlogManager.getBacklog()[WebGAL.backlogManager.getBacklog().length - 1]?.saveScene?.currentSentenceId ??
      0,
    limit,
  ]);
  useEffect(() => {
    /* 切换为展示历史记录时触发 */
    if (GUIStore.showBacklog) {
      // logger.info('展示backlog');
      // 立即清除 防止来回滚动时可能导致的错乱
      if (timeRef.current) {
        clearTimeout(timeRef.current);
      }
      // setIsDisableScroll(false);
      // 重新把index调回正数
      setIndexHide(false);
      // 向上滑动触发回想时会带着backlog一起滑一下 我也不知道为什么，可能是我的鼠标问题 所以先ban掉滚动
      setIsDisableScroll(true);
      // nextTick开启滚动
      setTimeout(() => {
        setIsDisableScroll(false);
      }, 0);
    } else {
      /* 隐藏历史记录触发 */
      // 这里是为了让backlog的z-index降低
      timeRef.current = setTimeout(() => {
        setIndexHide(true);
        // setIsDisableScroll(false);
        // setIsDisableScroll(true);
        timeRef.current = undefined;
        // 200是和动画一样的延时 保险起见多个80ms
        // 不加也没啥 问题不大
      }, 200 + 80);
    }
  }, [GUIStore.showBacklog]);
  return (
    <>
      {
        // ${indexHide ? styles.Backlog_main_out_IndexHide : ''}
        <div
          className={`
          ${GUIStore.showBacklog ? styles.Backlog_main : styles.Backlog_main_out}
          ${indexHide ? styles.Backlog_main_out_IndexHide : ''}
          `}
        >
          <div className={styles.backlog_top}>
            <i
              className={`bi bi-x-lg ${styles.backlog_top_icon}`}
              onClick={() => {
                playSeClick();
                dispatch(setVisibility({ component: 'showBacklog', visibility: false }));
                dispatch(setVisibility({ component: 'showTextBox', visibility: true }));
              }}
              onMouseEnter={playSeEnter}
            />
            <div
              className={styles.backlog_title}
              /* onClick={() => {
                logger.info('Rua! Testing');
              }} */
            >
              {t('buttons.backlog')}
            </div>
          </div>
          {GUIStore.showBacklog && (
            <div className={`${styles.backlog_content} ${isDisableScroll ? styles.Backlog_main_DisableScroll : ''}`}>
              {backlogList}
            </div>
          )}
        </div>
      }
    </>
  );
};

export function mergeStringsAndKeepObjects(arr: ReactNode[]): ReactNode[][] {
  let result = [];
  let currentString = '';

  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < arr.length; i++) {
    const currentItem = arr[i];

    if (typeof currentItem === 'string') {
      currentString += currentItem;
    } else {
      if (currentString !== '') {
        result.push(currentString);
        currentString = '';
      }
      result.push(currentItem);
    }
  }

  if (currentString !== '') {
    result.push(currentString);
  }

  return result as ReactNode[][];
}
