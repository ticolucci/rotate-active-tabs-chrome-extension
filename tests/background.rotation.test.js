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

  test('should not modify history during rotation', async () => {
    const { trackTabActivation, rotateForward, getTabHistory } = require('../background.js');

    await trackTabActivation(1);
    await trackTabActivation(2);
    await trackTabActivation(3);

    // History should be [3, 2, 1]
    let history = await getTabHistory();
    expect(history).toEqual([3, 2, 1]);

    // Rotate forward to tab 2
    await rotateForward();

    // History should still be [3, 2, 1], not modified
    history = await getTabHistory();
    expect(history).toEqual([3, 2, 1]);

    // Rotate forward again to tab 1
    await rotateForward();

    // History should still be [3, 2, 1]
    history = await getTabHistory();
    expect(history).toEqual([3, 2, 1]);

    // Rotate forward once more should wrap to tab 3
    await rotateForward();
    expect(chrome.tabs.update).toHaveBeenLastCalledWith(3, { active: true });

    // History should still be [3, 2, 1]
    history = await getTabHistory();
    expect(history).toEqual([3, 2, 1]);
  });

  test('should ignore onActivated events during rotation', async () => {
    const background = require('../background.js');
    const { trackTabActivation, rotateForward, getTabHistory } = background;

    // Simulate Chrome's behavior: when tabs.update is called, onActivated fires
    chrome.tabs.update.mockImplementation((tabId) => {
      // Simulate Chrome firing onActivated
      const listener = chrome.tabs.onActivated.addListener.mock.calls[0][0];
      listener({ tabId });
    });

    await trackTabActivation(1);
    await trackTabActivation(2);
    await trackTabActivation(3);

    // History should be [3, 2, 1], currentPosition = 0
    let history = await getTabHistory();
    expect(history).toEqual([3, 2, 1]);

    // Rotate forward - should go to tab 2
    await rotateForward();

    // If onActivated is not ignored, history would become [2, 3, 1]
    // But it should still be [3, 2, 1]
    history = await getTabHistory();
    expect(history).toEqual([3, 2, 1]);

    // Rotate forward again - should go to tab 1
    await rotateForward();

    // History should still be [3, 2, 1]
    history = await getTabHistory();
    expect(history).toEqual([3, 2, 1]);
  });

  test('should cycle through entire history with multiple forward rotations', async () => {
    const background = require('../background.js');
    const { trackTabActivation, rotateForward, getTabHistory } = background;

    // Simulate Chrome's behavior
    chrome.tabs.update.mockImplementation((tabId) => {
      const listener = chrome.tabs.onActivated.addListener.mock.calls[0][0];
      listener({ tabId });
    });

    await trackTabActivation(1);
    await trackTabActivation(2);
    await trackTabActivation(3);
    await trackTabActivation(4);

    // History: [4, 3, 2, 1], position at 0 (tab 4)
    let history = await getTabHistory();
    expect(history).toEqual([4, 3, 2, 1]);

    // Rotate to position 1 (tab 3)
    await rotateForward();
    expect(chrome.tabs.update).toHaveBeenLastCalledWith(3, { active: true });
    history = await getTabHistory();
    expect(history).toEqual([4, 3, 2, 1]);

    // Rotate to position 2 (tab 2)
    await rotateForward();
    expect(chrome.tabs.update).toHaveBeenLastCalledWith(2, { active: true });
    history = await getTabHistory();
    expect(history).toEqual([4, 3, 2, 1]);

    // Rotate to position 3 (tab 1)
    await rotateForward();
    expect(chrome.tabs.update).toHaveBeenLastCalledWith(1, { active: true });
    history = await getTabHistory();
    expect(history).toEqual([4, 3, 2, 1]);

    // Rotate to position 0 (wrap around to tab 4)
    await rotateForward();
    expect(chrome.tabs.update).toHaveBeenLastCalledWith(4, { active: true });
    history = await getTabHistory();
    expect(history).toEqual([4, 3, 2, 1]);
  });

  test('should cycle through history in reverse direction', async () => {
    const background = require('../background.js');
    const { trackTabActivation, rotateReverse, getTabHistory } = background;

    // Simulate Chrome's behavior
    chrome.tabs.update.mockImplementation((tabId) => {
      const listener = chrome.tabs.onActivated.addListener.mock.calls[0][0];
      listener({ tabId });
    });

    await trackTabActivation(1);
    await trackTabActivation(2);
    await trackTabActivation(3);

    // History: [3, 2, 1], position at 0 (tab 3)
    let history = await getTabHistory();
    expect(history).toEqual([3, 2, 1]);

    // Rotate reverse to position 2 (tab 1)
    await rotateReverse();
    expect(chrome.tabs.update).toHaveBeenLastCalledWith(1, { active: true });
    history = await getTabHistory();
    expect(history).toEqual([3, 2, 1]);

    // Rotate reverse to position 1 (tab 2)
    await rotateReverse();
    expect(chrome.tabs.update).toHaveBeenLastCalledWith(2, { active: true });
    history = await getTabHistory();
    expect(history).toEqual([3, 2, 1]);

    // Rotate reverse to position 0 (wrap around to tab 3)
    await rotateReverse();
    expect(chrome.tabs.update).toHaveBeenLastCalledWith(3, { active: true });
    history = await getTabHistory();
    expect(history).toEqual([3, 2, 1]);
  });

  test('should alternate between forward and reverse rotation', async () => {
    const background = require('../background.js');
    const { trackTabActivation, rotateForward, rotateReverse, getTabHistory } = background;

    // Simulate Chrome's behavior
    chrome.tabs.update.mockImplementation((tabId) => {
      const listener = chrome.tabs.onActivated.addListener.mock.calls[0][0];
      listener({ tabId });
    });

    await trackTabActivation(1);
    await trackTabActivation(2);
    await trackTabActivation(3);

    // History: [3, 2, 1], position at 0
    let history = await getTabHistory();
    expect(history).toEqual([3, 2, 1]);

    // Forward to tab 2 (position 1)
    await rotateForward();
    expect(chrome.tabs.update).toHaveBeenLastCalledWith(2, { active: true });

    // Forward to tab 1 (position 2)
    await rotateForward();
    expect(chrome.tabs.update).toHaveBeenLastCalledWith(1, { active: true });

    // Reverse back to tab 2 (position 1)
    await rotateReverse();
    expect(chrome.tabs.update).toHaveBeenLastCalledWith(2, { active: true });

    // Reverse back to tab 3 (position 0)
    await rotateReverse();
    expect(chrome.tabs.update).toHaveBeenLastCalledWith(3, { active: true });

    // History should never change
    history = await getTabHistory();
    expect(history).toEqual([3, 2, 1]);
  });

  test('should update history and reset position on manual tab switch', async () => {
    const background = require('../background.js');
    const { trackTabActivation, rotateForward, getTabHistory } = background;

    // Setup: don't simulate Chrome behavior during initial setup
    chrome.tabs.update.mockImplementation(() => {});

    await trackTabActivation(1);
    await trackTabActivation(2);
    await trackTabActivation(3);

    // History: [3, 2, 1], position at 0
    let history = await getTabHistory();
    expect(history).toEqual([3, 2, 1]);

    // Now simulate Chrome behavior for rotation
    chrome.tabs.update.mockImplementation((tabId) => {
      const listener = chrome.tabs.onActivated.addListener.mock.calls[0][0];
      listener({ tabId });
    });

    // Rotate forward to tab 2 (position 1)
    await rotateForward();
    expect(chrome.tabs.update).toHaveBeenLastCalledWith(2, { active: true });

    // Rotate forward to tab 1 (position 2)
    await rotateForward();
    expect(chrome.tabs.update).toHaveBeenLastCalledWith(1, { active: true });

    // Now simulate a manual tab switch to tab 4 (user clicks on a tab)
    // This should NOT have isRotating flag set
    const listener = chrome.tabs.onActivated.addListener.mock.calls[0][0];
    listener({ tabId: 4 });

    // History should now be [4, 3, 2, 1] - tab 4 moved to front
    // (The rotations to tabs 2 and 1 didn't modify the history)
    history = await getTabHistory();
    expect(history).toEqual([4, 3, 2, 1]);

    // Next rotation should start from position 0 (tab 4) and go to position 1 (tab 3)
    await rotateForward();
    expect(chrome.tabs.update).toHaveBeenLastCalledWith(3, { active: true });
  });
});
