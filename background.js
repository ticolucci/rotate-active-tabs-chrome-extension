// Background service worker for the Rotate Active Tabs extension
// This will track active tabs and handle keyboard shortcuts

console.log('Rotate Active Tabs extension loaded');

let tabHistory = [];
let currentPosition = 0;

async function getTabHistorySize() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['tabHistorySize'], (result) => {
      resolve(result.tabHistorySize || 5);
    });
  });
}

async function trackTabActivation(tabId) {
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

  if (command === 'rotate-tabs') {
    rotateForward();
  } else if (command === 'rotate-tabs-reverse') {
    rotateReverse();
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
