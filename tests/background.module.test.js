describe('Background Service Worker - Module Loading', () => {
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

  test('should load without requiring window object', () => {
    // Simulate service worker environment where window is not available
    const savedWindow = global.window;
    delete global.window;

    expect(() => {
      require('../background.js');
    }).not.toThrow();

    // Restore window for other tests
    if (savedWindow) {
      global.window = savedWindow;
    }
  });

  test('should import COMMANDS from commands-constants module', async () => {
    const { COMMANDS } = await import('../commands-constants.js');

    expect(COMMANDS).toBeDefined();
    expect(COMMANDS.ROTATE_FORWARD).toBe('rotate-tabs');
    expect(COMMANDS.ROTATE_REVERSE).toBe('rotate-tabs-reverse');
  });
});
