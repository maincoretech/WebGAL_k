import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import React from 'react';
import styles from '@/UI/Extra/extra.module.scss';
import { useValue } from '@/hooks/useValue';
// import { GoEnd, GoStart, MusicList, PlayOne, SquareSmall } from '@icon-park/react';
import useSoundEffect from '@/hooks/useSoundEffect';
import { setGuiAsset } from '@/store/GUIReducer';

export function ExtraBgm() {
  const { playSeClick, playSeEnter } = useSoundEffect();
  // 检查当前正在播放的bgm是否在bgm列表内
  const currentBgmSrc = useSelector((state: RootState) => state.GUI.titleBgm);
  const extraState = useSelector((state: RootState) => state.userData.appreciationData);
  const initName = 'No BGM';
  let foundCurrentBgmName = initName;
  let foundCurrentBgmIndex = -1;
  const iconSize = 39;
  const bgmListLen = extraState.bgm.length;
  extraState.bgm.forEach((e, i) => {
    if (e.url === currentBgmSrc) {
      foundCurrentBgmName = e.name;
      foundCurrentBgmIndex = i;
    }
  });
  const currentPlayingBgmName = useValue('');
  if (foundCurrentBgmName !== initName && foundCurrentBgmName !== currentPlayingBgmName.value) {
    currentPlayingBgmName.set(foundCurrentBgmName);
  }
  const dispatch = useDispatch();

  function setBgmByIndex(index: number) {
    const e = extraState.bgm[index];
    currentPlayingBgmName.set(e.name);
    dispatch(setGuiAsset({ asset: 'titleBgm', value: e.url }));
  }

  const showBgmList = extraState.bgm.map((e, i) => {
    let className = styles.bgmElement;
    if (e.name === currentPlayingBgmName.value) {
      className = className + ' ' + styles.bgmElement_active;
    }
    return (
      <div
        onClick={() => {
          playSeClick();
          currentPlayingBgmName.set(e.name);
          dispatch(setGuiAsset({ asset: 'titleBgm', value: e.url }));
        }}
        key={e.url}
        className={className}
        style={{
          animationDelay: `${i * 150}ms`,
        }}
        onMouseEnter={playSeEnter}
      >
        {e.name}
      </div>
    );
  });

  // If there are no BGM tracks available, don't render the player controls
  if (bgmListLen === 0) {
    return null;
  }

  return (
    <div className={styles.bgmContainer}>
      <div className={styles.bgmPlayerMain}>
        {/* Previous, Play, Next, Stop buttons */}
        {/* 上一曲 */}
        <div
          onClick={() => {
            playSeClick();
            if (foundCurrentBgmIndex <= 0) {
              setBgmByIndex(bgmListLen - 1);
            } else {
              setBgmByIndex(foundCurrentBgmIndex - 1);
            }
          }}
          onMouseEnter={playSeEnter}
          className={styles.bgmControlButton}
        >
          <i className="bi bi-rewind" />
          {/* <GoStart theme="filled" size={iconSize} fill="#fff" strokeWidth={3} strokeLinejoin="miter" /> */}
        </div>
        {/* 播放 */}
        <div
          onClick={() => {
            playSeClick();
            const bgmControl: HTMLAudioElement = document.getElementById('currentBgm') as HTMLAudioElement;
            bgmControl?.play().then();
          }}
          onMouseEnter={playSeEnter}
          className={styles.bgmControlButton}
        >
          <i className="bi bi-play" />
          {/* <PlayOne theme="filled" size={iconSize} fill="#fff" strokeWidth={3} strokeLinejoin="miter" /> */}
        </div>
        {/* 下一曲 */}
        <div
          onClick={() => {
            playSeClick();
            if (foundCurrentBgmIndex >= bgmListLen - 1) {
              setBgmByIndex(0);
            } else {
              setBgmByIndex(foundCurrentBgmIndex + 1);
            }
          }}
          onMouseEnter={playSeEnter}
          className={styles.bgmControlButton}
        >
          <i className="bi bi-fast-forward" />
          {/* <GoEnd theme="filled" size={iconSize} fill="#fff" strokeWidth={3} strokeLinejoin="miter" /> */}
        </div>
        {/* 停止 */}
        <div
          onClick={() => {
            playSeClick();
            const bgmControl: HTMLAudioElement = document.getElementById('currentBgm') as HTMLAudioElement;
            bgmControl.pause();
          }}
          onMouseEnter={playSeEnter}
          className={styles.bgmControlButton}
        >
          <i className="bi bi-stop" />
          {/* <SquareSmall theme="filled" fill="#fff" strokeWidth={3} strokeLinejoin="miter" /> */}
        </div>
        {/* BGM 名称 */}
        <div className={styles.bgmName}>{foundCurrentBgmName}</div>
      </div>
      {showBgmList.length > 0 && <div className={styles.bgmListContainer}>{showBgmList}</div>}
    </div>
  );
}
