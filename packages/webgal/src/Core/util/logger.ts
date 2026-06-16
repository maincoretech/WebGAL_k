const LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 } as const;
let currentLevel: number = LEVELS.DEBUG;

export const logger = {
  setLevel(level: keyof typeof LEVELS) {
    currentLevel = LEVELS[level];
  },
  debug(...args: any[]) {
    if (currentLevel <= LEVELS.DEBUG) console.debug(...args);
  },
  info(...args: any[]) {
    if (currentLevel <= LEVELS.INFO) console.info(...args);
  },
  warn(...args: any[]) {
    if (currentLevel <= LEVELS.WARN) console.warn(...args);
  },
  error(...args: any[]) {
    if (currentLevel <= LEVELS.ERROR) console.error(...args);
  },
};

if (process.env.NODE_ENV === 'production') {
  logger.setLevel('INFO');
}
