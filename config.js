const CONFIG = {
  DEFAULT_TAB_HISTORY_SIZE: 5,
  MIN_TAB_HISTORY_SIZE: 2,
  MAX_TAB_HISTORY_SIZE: 20,
  STATUS_MESSAGE_DURATION: 3000,
  STORAGE_KEYS: {
    TAB_HISTORY_SIZE: 'tabHistorySize'
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
