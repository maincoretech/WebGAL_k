const jp = {
  // 通用
  common: {
    yes: 'はい',
    no: 'いいえ',
  },

  menu: {
    options: {
      title: 'コンフィグ',
      pages: {
        system: {
          title: 'システム',
          options: {
            autoSpeed: {
              title: '自動再生速度',
              options: {
                slow: '遅く',
                medium: '標準',
                fast: '速く',
              },
            },
            language: {
              title: '言語',
            },
            resetData: {
              title: 'データの復元と削除',
              options: {
                clearGameSave: 'すべてのセーブデータを削除',
                resetSettings: '設定を元に戻す',
                clearAll: 'すべてのデータを削除',
              },
              dialogs: {
                clearGameSave: 'すべてのセーブデータを削除しますか？',
                resetSettings: '設定を元に戻しますか？',
                clearAll: 'すべてのデータを削除しますか？',
              },
            },
            gameSave: {
              title: 'セーブデータと設定のインポートとエクスポート',
              options: {
                export: 'セーブデータと設定のエクスポート',
                import: 'セーブデータと設定のインポート',
              },
              dialogs: {
                import: {
                  title: 'セーブデータと設定をインポートしますか？',
                  tip: 'セーブデータのインポート',
                  error: 'セーブデータの読み込みに失敗しました',
                },
              },
            },
            about: {
              title: 'WebGAL_k について',
              subTitle: 'WebGAL のフォーク',
              version: 'バージョン',
              credit: 'クレジット',
              font: '欧文フォント：Maven Pro（SIL Open Font License 1.1）',
              fontLicense: 'https://openfontlicense.org/',
            },
            skipAll: {
              title: 'スキップモード',
              options: {
                read: '既読',
                all: 'すべて',
              }
            }
          },
        },
        display: {
          title: 'ウィンドウ',
          options: {
            fullScreen: {
              title: 'フルスクリーン',
              options: {
                on: 'オン',
                off: 'オフ',
              },
            },
            textSpeed: {
              title: 'テキスト表示速度',
              options: {
                slow: '遅く',
                medium: '標準',
                fast: '速く',
              },
            },
            textSize: {
              title: 'テキストサイズ',
              options: {
                small: '小',
                medium: '中',
                large: '大',
              },
            },
            /* textFont: {
              title: 'フォント',
              options: {
                resourceHanRounded: 'Resource Han Rounded',
                siYuanSimSun: '源ノ明朝(中国語)',
                SimHei: 'OPPO Sans',
              },
            }, */
            textboxOpacity: {
              title: 'テキストボックスの不透明度',
            },
            textPreview: {
              title: 'テキスト表示プレビュー',
              text: 'これはテキストボックスのフォントとサイズ、表示速度のプレビューです。上にある設定で変更できます。',
            },
          },
        },
        sound: {
          title: 'サウンド',
          options: {
            volumeMain: { title: 'メイン音量' },
            vocalVolume: { title: 'ボイス音量' },
            bgmVolume: { title: 'BGM 音量' },
            seVolume: { title: '効果音音量' },
            uiSeVolume: { title: 'UI 効果音音量' },
            voiceOption: { title: 'ボイスの中断' },
            voiceStop: { title: '中断する' },
            voiceContinue: { title: '中断しない' },
          },
        },
        // language: {
        //   title: '言語',
        //   options: {
        //   },
        // },
      },
    },
    saving: {
      title: 'セーブ',
      isOverwrite: 'セーブデータを上書きしますか？',
    },
    loadSaving: {
      title: 'ロード',
    },
    title: {
      title: 'ホーム',
    },
    exit: {
      title: 'もどる',
    },
  },

  title: {
    start: {
      title: 'START',
      subtitle: '',
    },
    continue: {
      title: 'CONTINUE',
      noSaving: 'セーブデータなし',
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
    noSaving: 'クイックセーブなし',
    buttons: {
      hide: 'CLOSE',
      show: 'SHOW',
      backlog: 'LOG',
      replay: 'REPLAY',
      auto: 'AUTO',
      forward: 'SKIP',
      quicklySave: 'Q·SAVE',
      quicklyLoad: 'Q·LOAD',
      save: 'SAVE',
      load: 'LOAD',
      options: 'SYSTEM',
      title: 'TITLE',
      titleTips: 'タイトル画面に戻りますか？',
      exitTips: 'ゲームを終了しますか',
      qsTips: 'クイックセーブを上書きします',
      qlTips: 'クイックセーブを読み込みます',
    },
  },

  extra: {
    title: 'EXTRA',
  },
};

export default jp;
