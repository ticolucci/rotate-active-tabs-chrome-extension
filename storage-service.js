const StorageService = {
  get(key, defaultValue) {
    return new Promise((resolve) => {
      chrome.storage.sync.get([key], (result) => {
        resolve(result[key] !== undefined ? result[key] : defaultValue);
      });
    });
  },

  set(key, value) {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [key]: value }, () => {
        resolve();
      });
    });
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageService;
}
