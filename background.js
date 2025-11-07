// Background service worker for the Rotate Active Tabs extension
// This will track active tabs and handle keyboard shortcuts

console.log('Rotate Active Tabs extension loaded');

const { COMMANDS } = typeof require !== 'undefined' ? require('./commands-constants.js') : window;

let tabHistory = [];
let currentPosition = 0;
let cachedTabHistorySize = null;

async function getTabHistorySize() {
  if (cachedTabHistorySize !== null) {
    return cachedTabHistorySize;
  }

  return new Promise((resolve) => {
    chrome.storage.sync.get(['tabHistorySize'], (result) => {
      cachedTabHistorySize = result.tabHistorySize || 5;
      resolve(cachedTabHistorySize);
    });
  });
}

async function trackTabActivation(tabId) {
  // Remove existing occurrence of this tab to avoid duplicates
  tabHistory = tabHistory.filter(id => id !== tabId);

  // Add to front of history
  tabHistory.unshift(tabId);
  currentPosition = 0;

  const maxSize = await getTabHistorySize();
  if (tabHistory.length > maxSize) {
    tabHistory = tabHistory.slice(0, maxSize);
  }
}

async function getTabHistory() {
  return tabHistory;
}

async function rotateForward() {
  if (tabHistory.length < 2) {
    return;
  }

  currentPosition = (currentPosition + 1) % tabHistory.length;
  const nextTabId = tabHistory[currentPosition];

  chrome.tabs.update(nextTabId, { active: true });
}

async function rotateReverse() {
  if (tabHistory.length < 2) {
    return;
  }

  currentPosition = (currentPosition - 1 + tabHistory.length) % tabHistory.length;
  const nextTabId = tabHistory[currentPosition];

  chrome.tabs.update(nextTabId, { active: true });
}

// Listen for tab activation
chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log(`Tab activated: ${activeInfo.tabId}`);
  trackTabActivation(activeInfo.tabId);
});

// Listen for keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  console.log(`Command received: ${command}`);

  if (command === COMMANDS.ROTATE_FORWARD) {
    rotateForward();
  } else if (command === COMMANDS.ROTATE_REVERSE) {
    rotateReverse();
  }
});

// Listen for storage changes to invalidate cache
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.tabHistorySize) {
    cachedTabHistorySize = changes.tabHistorySize.newValue || 5;
    console.log(`Tab history size changed to: ${cachedTabHistorySize}`);
  }
});

// Extension installation or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed or updated');
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    trackTabActivation,
    getTabHistory,
    rotateForward,
    rotateReverse
  };
}
