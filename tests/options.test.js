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

describe('Options Page - Keyboard Shortcuts', () => {
  beforeEach(() => {
    global.chrome = {
      commands: {
        getAll: jest.fn()
      }
    };
    jest.resetModules();
  });

  test('should get current keyboard shortcut for rotate-tabs command', async () => {
    chrome.commands.getAll.mockImplementation((callback) => {
      callback([
        {
          name: 'rotate-tabs',
          description: 'Rotate through active tabs',
          shortcut: 'Alt+Q'
        }
      ]);
    });

    const { getCurrentShortcut } = require('../options.js');
    const shortcut = await getCurrentShortcut();

    expect(shortcut).toBe('Alt+Q');
  });

  test('should return empty string when no shortcut is set', async () => {
    chrome.commands.getAll.mockImplementation((callback) => {
      callback([
        {
          name: 'rotate-tabs',
          description: 'Rotate through active tabs',
          shortcut: ''
        }
      ]);
    });

    const { getCurrentShortcut } = require('../options.js');
    const shortcut = await getCurrentShortcut();

    expect(shortcut).toBe('');
  });

  test('should return empty string when rotate-tabs command is not found', async () => {
    chrome.commands.getAll.mockImplementation((callback) => {
      callback([]);
    });

    const { getCurrentShortcut } = require('../options.js');
    const shortcut = await getCurrentShortcut();

    expect(shortcut).toBe('');
  });

  test('should load and display current shortcut', async () => {
    chrome.commands.getAll.mockImplementation((callback) => {
      callback([
        {
          name: 'rotate-tabs',
          description: 'Rotate through active tabs',
          shortcut: 'Alt+Q'
        }
      ]);
    });

    document.body.innerHTML = '<span id="currentShortcut"></span>';

    const { loadShortcut } = require('../options.js');
    await loadShortcut();

    const shortcutSpan = document.getElementById('currentShortcut');
    expect(shortcutSpan.textContent).toBe('Alt+Q');
  });

  test('should display "Not set" when no shortcut is configured', async () => {
    chrome.commands.getAll.mockImplementation((callback) => {
      callback([
        {
          name: 'rotate-tabs',
          description: 'Rotate through active tabs',
          shortcut: ''
        }
      ]);
    });

    document.body.innerHTML = '<span id="currentShortcut"></span>';

    const { loadShortcut } = require('../options.js');
    await loadShortcut();

    const shortcutSpan = document.getElementById('currentShortcut');
    expect(shortcutSpan.textContent).toBe('Not set');
  });

  test('should get current keyboard shortcut for rotate-tabs-reverse command', async () => {
    chrome.commands.getAll.mockImplementation((callback) => {
      callback([
        {
          name: 'rotate-tabs-reverse',
          description: 'Rotate through active tabs (reverse)',
          shortcut: 'Ctrl+Shift+Q'
        }
      ]);
    });

    const { getReverseShortcut } = require('../options.js');
    const shortcut = await getReverseShortcut();

    expect(shortcut).toBe('Ctrl+Shift+Q');
  });

  test('should return empty string when reverse shortcut is not set', async () => {
    chrome.commands.getAll.mockImplementation((callback) => {
      callback([
        {
          name: 'rotate-tabs-reverse',
          description: 'Rotate through active tabs (reverse)',
          shortcut: ''
        }
      ]);
    });

    const { getReverseShortcut } = require('../options.js');
    const shortcut = await getReverseShortcut();

    expect(shortcut).toBe('');
  });

  test('should load and display both shortcuts', async () => {
    chrome.commands.getAll.mockImplementation((callback) => {
      callback([
        {
          name: 'rotate-tabs',
          description: 'Rotate through active tabs',
          shortcut: 'Alt+Q'
        },
        {
          name: 'rotate-tabs-reverse',
          description: 'Rotate through active tabs (reverse)',
          shortcut: 'Ctrl+Shift+Q'
        }
      ]);
    });

    document.body.innerHTML = `
      <span id="currentShortcut"></span>
      <span id="currentReverseShortcut"></span>
    `;

    const { loadShortcuts } = require('../options.js');
    await loadShortcuts();

    const shortcutSpan = document.getElementById('currentShortcut');
    const reverseShortcutSpan = document.getElementById('currentReverseShortcut');

    expect(shortcutSpan.textContent).toBe('Alt+Q');
    expect(reverseShortcutSpan.textContent).toBe('Ctrl+Shift+Q');
  });
});
