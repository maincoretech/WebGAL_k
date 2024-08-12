import styles from './menuPanel.module.scss';
import { MenuPanelButton } from './MenuPanelButton';
import { playBgm } from '@/Core/controller/stage/playBgm';
import { MenuPanelTag } from '@/store/guiInterface';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setMenuPanelTag, setVisibility } from '@/store/GUIReducer';
import { backToTitle } from '@/Core/controller/gamePlay/backToTitle';
import useTrans from '@/hooks/useTrans';
import useSoundEffect from '@/hooks/useSoundEffect';
import { showGlogalDialog } from '@/UI/GlobalDialog/GlobalDialog';
import { useState } from 'react';

/**
 * Menu页的底栏
 * @constructor
 */
export const MenuPanel = () => {
  // 国际化
  const t = useTrans('menu.');

  const { playSeClick, playSeDialogOpen, playSePageChange } = useSoundEffect();
  const GUIState = useSelector((state: RootState) => state.GUI);
  const dispatch = useDispatch();
  // 设置Menu按钮的高亮
  const SaveTagOn = GUIState.currentMenuTag === MenuPanelTag.Save ? ` ${styles.MenuPanel_button_hl}` : ``;
  const LoadTagOn = GUIState.currentMenuTag === MenuPanelTag.Load ? ` ${styles.MenuPanel_button_hl}` : ``;
  const OptionTagOn = GUIState.currentMenuTag === MenuPanelTag.Option ? ` ${styles.MenuPanel_button_hl}` : ``;

  // 设置Menu按钮的颜色
  const SaveTagColor = GUIState.currentMenuTag === MenuPanelTag.Save ? `#ffffffaa` : `#ffffff60`;
  const LoadTagColor = GUIState.currentMenuTag === MenuPanelTag.Load ? `#ffffffaa` : `#ffffff60`;
  const OptionTagColor = GUIState.currentMenuTag === MenuPanelTag.Option ? `#ffffffaa` : `#ffffff60`;

  // 设置Menu图标的颜色
  const SaveIconColor = GUIState.currentMenuTag === MenuPanelTag.Save ? `#ffffffaa` : `#ffffff60`;
  const LoadIconColor = GUIState.currentMenuTag === MenuPanelTag.Load ? `#ffffffaa` : `#ffffff60`;
  const OptionIconColor = GUIState.currentMenuTag === MenuPanelTag.Option ? `#ffffffaa` : `#ffffff60`;

  // 设置透明度
  const [isOpacity, setIsOpacity] = useState(false);

  return (
    <div className={styles.MenuPanel_main} style={{ opacity: isOpacity ? 0 : 1 }}>
      <MenuPanelButton
        iconName="save"
        buttonOnClassName={SaveTagOn}
        iconColor={SaveIconColor}
        tagColor={SaveTagColor}
        clickFunc={() => {
          playSePageChange();
          if (GUIState.showTitle) return;
          dispatch(setMenuPanelTag(MenuPanelTag.Save));
        }}
        tagName={t('saving.title')}
        key="saveButton"
      />
      <MenuPanelButton
        iconName="load"
        buttonOnClassName={LoadTagOn}
        iconColor={LoadIconColor}
        tagColor={LoadTagColor}
        clickFunc={() => {
          playSePageChange();
          dispatch(setMenuPanelTag(MenuPanelTag.Load));
        }}
        tagName={t('loadSaving.title')}
        key="loadButton"
      />

      <MenuPanelButton
        iconName="option"
        buttonOnClassName={OptionTagOn}
        iconColor={OptionIconColor}
        tagColor={OptionTagColor}
        clickFunc={() => {
          playSePageChange();
          dispatch(setMenuPanelTag(MenuPanelTag.Option));
        }}
        tagName={t('options.title')}
        key="optionButton"
      />

      <MenuPanelButton
        iconName="title"
        iconColor="#ffffff60"
        tagColor="#ffffff60"
        style={{ marginLeft: 'auto' }}
        clickFunc={() => {
          playSeDialogOpen();
          showGlogalDialog({
            title: t('$gaming.buttons.titleTips'),
            leftText: t('$common.yes'),
            rightText: t('$common.no'),
            leftFunc: () => {
              backToTitle();
              setTimeout(() => {
                dispatch(setVisibility({ component: 'showMenuPanel', visibility: false }));
              }, 200);
              setIsOpacity((current) => !current);
            },
            rightFunc: () => {},
          });
        }}
        tagName={t('title.title')}
        key="titleIcon"
      />

      <MenuPanelButton
        iconName="exit"
        iconColor="#ffffff60"
        tagColor="#ffffff60"
        clickFunc={() => {
          playSeClick();
          setTimeout(() => {
            dispatch(setVisibility({ component: 'showMenuPanel', visibility: false }));
          }, 200);
          setIsOpacity((current) => !current);
        }}
        tagName={t('exit.title')}
        key="exitIcon"
      />
    </div>
  );
};
