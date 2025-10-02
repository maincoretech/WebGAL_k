import {commandType} from '../interface/sceneInterface';

export const SCRIPT_CONFIG = [
  { scriptString: 'say', scriptType: commandType.say },
  { scriptString: 'changeBg', scriptType: commandType.changeBg },
  { scriptString: 'changeFigure', scriptType: commandType.changeFigure },
  { scriptString: 'bgm', scriptType: commandType.bgm },
  { scriptString: 'playVideo', scriptType: commandType.video },
  { scriptString: 'pixiPerform', scriptType: commandType.pixi },
  { scriptString: 'pixiInit', scriptType: commandType.pixiInit },
  { scriptString: 'intro', scriptType: commandType.intro },
  { scriptString: 'miniAvatar', scriptType: commandType.miniAvatar },
  { scriptString: 'changeScene', scriptType: commandType.changeScene },
  { scriptString: 'choose', scriptType: commandType.choose },
  { scriptString: 'end', scriptType: commandType.end },
  {
    scriptString: 'setComplexAnimation',
    scriptType: commandType.setComplexAnimation,
  },
  { scriptString: 'setFilter', scriptType: commandType.setFilter },
  { scriptString: 'label', scriptType: commandType.label },
  { scriptString: 'jumpLabel', scriptType: commandType.jumpLabel },
  { scriptString: 'chooseLabel', scriptType: commandType.chooseLabel },
  { scriptString: 'setVar', scriptType: commandType.setVar },
  { scriptString: 'if', scriptType: commandType.if },
  { scriptString: 'callScene', scriptType: commandType.callScene },
  { scriptString: 'showVars', scriptType: commandType.showVars },
  { scriptString: 'unlockCg', scriptType: commandType.unlockCg },
  { scriptString: 'unlockBgm', scriptType: commandType.unlockBgm },
  { scriptString: 'filmMode', scriptType: commandType.filmMode },
  { scriptString: 'setTextbox', scriptType: commandType.setTextbox },
  { scriptString: 'setAnimation', scriptType: commandType.setAnimation },
  { scriptString: 'playEffect', scriptType: commandType.playEffect },
  { scriptString: 'setTempAnimation', scriptType: commandType.setTempAnimation },
  // comment?
  { scriptString: 'setTransform', scriptType: commandType.setTransform },
  { scriptString: 'setTransition', scriptType: commandType.setTransition },
  { scriptString: 'getUserInput', scriptType: commandType.getUserInput },
  { scriptString: 'applyStyle', scriptType: commandType.applyStyle },
  { scriptString: 'wait', scriptType: commandType.wait },
];
export const ADD_NEXT_ARG_LIST = [
  commandType.bgm,
  commandType.pixi,
  commandType.pixiInit,
  commandType.miniAvatar,
  commandType.label,
  commandType.if,
  commandType.setVar,
  commandType.unlockCg,
  commandType.unlockBgm,
  commandType.filmMode,
  commandType.playEffect,
  commandType.setTransition,
  commandType.applyStyle,
];

export type ConfigMap = Map<string, ConfigItem>;
export type ConfigItem = { scriptString: string; scriptType: commandType };
