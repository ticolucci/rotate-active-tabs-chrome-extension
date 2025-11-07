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
});

describe('Background Service Worker - Tab Rotation', () => {
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
        update: jest.fn()
      },
      commands: {
        onCommand: {
          addListener: jest.fn()
        }
      },
      storage: {
        sync: {
          get: jest.fn((keys, callback) => callback({})),
          set: jest.fn()
        },
        onChanged: {
          addListener: jest.fn()
        }
      }
    };
    jest.resetModules();
  });

  test('should rotate forward through tab history', async () => {
    const { trackTabActivation, rotateForward } = require('../background.js');

    await trackTabActivation(1);
    await trackTabActivation(2);
    await trackTabActivation(3);

    // Currently on tab 3, history is [3, 2, 1]
    // Rotating forward should switch to tab 2
    await rotateForward();

    expect(chrome.tabs.update).toHaveBeenCalledWith(2, { active: true });
  });

  test('should rotate in reverse through tab history', async () => {
    const { trackTabActivation, rotateForward, rotateReverse } = require('../background.js');

    await trackTabActivation(1);
    await trackTabActivation(2);
    await trackTabActivation(3);

    // Move forward once: position will be at tab 2
    await rotateForward();
    chrome.tabs.update.mockClear();

    // Rotating reverse should go back to tab 3
    await rotateReverse();

    expect(chrome.tabs.update).toHaveBeenCalledWith(3, { active: true });
  });
});
