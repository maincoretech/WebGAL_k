const zhCn = {
  // 通用
  common: {
    yes: '是',
    no: '否',
  },

  menu: {
    options: {
      title: '选项',
      pages: {
        system: {
          title: '系统',
          options: {
            autoSpeed: {
              title: '自动播放速度',
              options: {
                slow: '慢',
                medium: '中',
                fast: '快',
              },
            },
            language: {
              title: '语言',
            },
            resetData: {
              title: '清除或还原数据',
              options: {
                clearGameSave: '清除所有存档',
                resetSettings: '还原默认设置',
                clearAll: '清除所有数据',
              },
              dialogs: {
                clearGameSave: '确定要清除存档吗',
                resetSettings: '确定要还原默认设置吗',
                clearAll: '确定要清除所有数据吗',
              },
            },
            gameSave: {
              title: '导入或导出存档与选项',
              options: {
                export: '导出存档与选项',
                import: '导入存档与选项',
              },
              dialogs: {
                import: {
                  title: '确定要导入存档与选项吗',
                  tip: '导入存档',
                  error: '存档解析失败',
                },
              },
            },
            about: {
              title: '关于 webgal-k',
              subTitle: '一个 WebGAL 引擎的分支',
              version: '版本号',
              sourceK: '代码仓库',
              source: '源项目仓库',
              // contributors: '贡献者',
              website: '网站',
            },
          },
        },
        display: {
          title: '显示',
          options: {
            fullScreen: {
              title: '全屏模式',
              options: {
                on: '开启',
                off: '关闭',
              },
            },
            textSpeed: {
              title: '文字显示速度',
              options: {
                slow: '慢',
                medium: '中',
                fast: '快',
              },
            },
            textSize: {
              title: '文本大小',
              options: {
                small: '小',
                medium: '中',
                large: '大',
              },
            },
            /* textFont: {
              title: '文本字体',
              options: {
                siYuanSimSun: '思源宋体',
                SimHei: '黑体',
                lxgw: '霞鹜文楷',
              },
            }, */
            textboxOpacity: {
              title: '文本框不透明度',
            },
            textPreview: {
              title: '文本显示预览',
              text: '现在预览的是文本框字体大小和播放速度的情况，您可以根据您的观感调整上面的选项。',
            },
          },
        },
        sound: {
          title: '音频',
          options: {
            volumeMain: { title: '主音量' },
            vocalVolume: { title: '语音音量' },
            bgmVolume: { title: '背景音乐音量' },
            seVolume: { title: '音效音量' },
            uiSeVolume: { title: '用户界面音效音量' },
            voiceOption: { title: '是否中断语音' },
            voiceStop: { title: '停止语音' },
            voiceContinue: { title: '继续语音' },
          },
        },
        // language: {
        //   title: '语言',
        //   options: {.
        //   },
        // },
      },
    },
    saving: {
      title: '存档',
      isOverwrite: '是否覆盖存档？',
    },
    loadSaving: {
      title: '读档',
    },
    title: {
      title: '标题',
      options: {
        load: '',
        extra: '鉴赏模式',
      },
    },
    exit: {
      title: '返回',
    },
  },

  title: {
    start: {
      title: 'START',
      subtitle: '',
    },
    continue: {
      title: 'CONTINUE',
      subtitle: '',
    },
    options: {
      title: 'OPTIONS',
      subtitle: '',
    },
    load: {
      title: 'LOAD',
      subtitle: '',
    },
    extra: {
      title: 'EXTRA',
      subtitle: '',
    },
    exit: {
      title: 'EXIT',
      subtitle: '',
    },
  },

  gaming: {
    noSaving: '暂无存档',
    buttons: {
      hide: '隐藏',
      show: '显示',
      backlog: '回放',
      replay: '重播',
      auto: '自动',
      forward: '快进',
      quicklySave: 'Q·SAVE',
      quicklyLoad: 'Q·LOAD',
      save: 'SAVE',
      load: 'LOAD',
      // fullscreen: '全屏',
      options: 'SYSTEM',
      title: 'TITLE',
      titleTips: '确认返回到标题界面吗',
      exitTips: '确认退出游戏吗',
      qsTips: '将覆盖之前的快速存档',
      qlTips: '读取快速存档',
    },
  },

  extra: {
    title: 'EXTRA',
  },
};

export default zhCn;
