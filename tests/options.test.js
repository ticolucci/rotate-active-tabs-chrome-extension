describe('Options Page - Tab History Size', () => {
  beforeEach(() => {
    global.chrome = {
      storage: {
        sync: {
          get: jest.fn(),
          set: jest.fn()
        }
      }
    };
    jest.resetModules();
  });

  test('should return default tab history size of 5', async () => {
    chrome.storage.sync.get.mockImplementation((keys, callback) => {
      callback({});
    });

    const { getTabHistorySize } = require('../options.js');
    const size = await getTabHistorySize();

    expect(size).toBe(5);
  });

  test('should return saved tab history size from storage', async () => {
    chrome.storage.sync.get.mockImplementation((keys, callback) => {
      callback({ tabHistorySize: 10 });
    });

    const { getTabHistorySize } = require('../options.js');
    const size = await getTabHistorySize();

    expect(size).toBe(10);
  });

  test('should save tab history size to storage', async () => {
    chrome.storage.sync.set.mockImplementation((data, callback) => {
      callback();
    });

    const { saveTabHistorySize } = require('../options.js');
    await saveTabHistorySize(8);

    expect(chrome.storage.sync.set).toHaveBeenCalledWith({ tabHistorySize: 8 }, expect.any(Function));
  });
});
