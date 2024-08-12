import { IMenuPanel } from '@/UI/Menu/MenuPanel/menuPanelInterface';
import { FolderOpen, Home, Logout, Save, SettingTwo } from '@icon-park/react';

/**
 * 通过图标名称返回正确的图标
 * @param props
 * @constructor
 */
export const MenuIconMap = (props: IMenuPanel) => {
  let returnIcon;
  switch (props.iconName) {
    case 'save':
      returnIcon = //<Save theme="outline" size="1.2em" fill={props.iconColor} strokeWidth={2} />;
        <i className="bi bi-floppy2"></i>;
      break;
    case 'load':
      returnIcon = //<FolderOpen theme="outline" size="1.2em" fill={props.iconColor} strokeWidth={2} />;
        <i className="bi bi-folder2-open"></i>;
      break;
    case 'option':
      returnIcon = //<SettingTwo theme="outline" size="1.2em" fill={props.iconColor} strokeWidth={2} />;
        <i className="bi bi-sliders2"></i>;
      break;
    case 'title':
      returnIcon = //<Home theme="outline" size="1.2em" fill={props.iconColor} strokeWidth={2} />;
        <i className="bi bi-house"></i>;
      break;
    case 'exit':
      returnIcon = //<Logout theme="outline" size="1.2em" fill={props.iconColor} strokeWidth={2} />;
        <i className="bi bi-box-arrow-right"></i>;
      break;
    default:
      returnIcon = <div />;
  }

  return returnIcon;
};
