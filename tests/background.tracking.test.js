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

  test('should clear forward history when clicking new tab while in middle of stack', async () => {
    chrome.storage.sync.get.mockImplementation((keys, callback) => {
      callback({});
    });

    // Simulate Chrome's behavior during rotation
    chrome.tabs.update.mockImplementation((tabId) => {
      const listener = chrome.tabs.onActivated.addListener.mock.calls[0][0];
      listener({ tabId });
    });

    const { trackTabActivation, rotateForward, getTabHistory } = require('../background.js');

    // Build initial history: [3, 2, 1]
    await trackTabActivation(1);
    await trackTabActivation(2);
    await trackTabActivation(3);

    let history = await getTabHistory();
    expect(history).toEqual([3, 2, 1]);

    // Rotate forward twice to be at position 2 (viewing tab 1)
    // Now tabs 3 and 2 are the "forward" history
    await rotateForward(); // position 1, viewing tab 2
    await rotateForward(); // position 2, viewing tab 1

    // User manually clicks on a new tab (tab 4)
    // This should clear the forward history (tabs 3 and 2)
    // Reset mock to prevent Chrome simulation for this manual activation
    chrome.tabs.update.mockImplementation(() => {});
    const listener = chrome.tabs.onActivated.addListener.mock.calls[0][0];
    listener({ tabId: 4 });

    // History should now be [4, 1], not [4, 3, 2, 1]
    // The forward history (tabs 3 and 2) should be cleared
    history = await getTabHistory();
    expect(history).toEqual([4, 1]);
  });
});
