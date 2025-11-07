describe('Background Service Worker - Tab History Tracking', () => {
  beforeEach(() => {
    global.chrome = {
      runtime: {
        onInstalled: {
          addListener: jest.fn()
        }
      },
      tabs: {
        onActivated: {
          addListener: jest.fn()
        },
        onRemoved: {
          addListener: jest.fn()
        },
        update: jest.fn()
      },
      commands: {
        onCommand: {
          addListener: jest.fn()
        }
      },
      storage: {
        sync: {
          get: jest.fn(),
          set: jest.fn()
        },
        onChanged: {
          addListener: jest.fn()
        }
      }
    };
    jest.resetModules();
  });

  test('should track a single tab activation', async () => {
    chrome.storage.sync.get.mockImplementation((keys, callback) => {
      callback({});
    });

    const { trackTabActivation, getTabHistory } = require('../background.js');

    await trackTabActivation(1);
    const history = await getTabHistory();

    expect(history).toEqual([1]);
  });

  test('should track multiple tab activations in order', async () => {
    chrome.storage.sync.get.mockImplementation((keys, callback) => {
      callback({});
    });

    const { trackTabActivation, getTabHistory } = require('../background.js');

    await trackTabActivation(1);
    await trackTabActivation(2);
    await trackTabActivation(3);
    const history = await getTabHistory();

    expect(history).toEqual([3, 2, 1]);
  });

  test('should limit history to configured TAB_HISTORY_SIZE', async () => {
    chrome.storage.sync.get.mockImplementation((keys, callback) => {
      callback({ tabHistorySize: 3 });
    });

    const { trackTabActivation, getTabHistory } = require('../background.js');

    await trackTabActivation(1);
    await trackTabActivation(2);
    await trackTabActivation(3);
    await trackTabActivation(4);
    await trackTabActivation(5);
    const history = await getTabHistory();

    expect(history).toEqual([5, 4, 3]);
    expect(history.length).toBe(3);
  });

  test('should not have duplicate tabs in history', async () => {
    chrome.storage.sync.get.mockImplementation((keys, callback) => {
      callback({});
    });

    const { trackTabActivation, getTabHistory } = require('../background.js');

    await trackTabActivation(1);
    await trackTabActivation(2);
    await trackTabActivation(1); // Switch back to tab 1
    await trackTabActivation(3);
    await trackTabActivation(2); // Switch back to tab 2

    const history = await getTabHistory();

    // Tab 2 should only appear once (most recent)
    // Tab 1 should only appear once
    expect(history).toEqual([2, 3, 1]);
    expect(history.length).toBe(3);
  });

  test('should remove closed tab from history', async () => {
    chrome.storage.sync.get.mockImplementation((keys, callback) => {
      callback({});
    });

    const { trackTabActivation, removeTabFromHistory, getTabHistory } = require('../background.js');

    await trackTabActivation(1);
    await trackTabActivation(2);
    await trackTabActivation(3);

    // Close tab 2
    await removeTabFromHistory(2);

    const history = await getTabHistory();

    // Tab 2 should be removed from history
    expect(history).toEqual([3, 1]);
    expect(history.length).toBe(2);
  });
});
