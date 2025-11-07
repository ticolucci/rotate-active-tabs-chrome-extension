// Background service worker for the Rotate Active Tabs extension
// This will track active tabs and handle keyboard shortcuts

import { COMMANDS } from './commands-constants.js';

console.log('Rotate Active Tabs extension loaded');

let tabHistory = [];
let currentPosition = 0;
let cachedTabHistorySize = null;
let isRotating = false;

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
  // If we're in the middle of the stack (currentPosition > 0),
  // clear the forward history (positions 0 to currentPosition-1)
  if (currentPosition > 0) {
    tabHistory = tabHistory.slice(currentPosition);
  }

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

async function removeTabFromHistory(tabId) {
  const index = tabHistory.indexOf(tabId);

  if (index === -1) {
    return; // Tab not in history
  }

  // Remove the tab from history
  tabHistory = tabHistory.filter(id => id !== tabId);

  // Adjust currentPosition if needed
  if (index < currentPosition) {
    // Removed tab was before current position, decrement position
    currentPosition = Math.max(0, currentPosition - 1);
  } else if (index === currentPosition) {
    // Removed tab was at current position, reset to start
    currentPosition = 0;
  }
  // If index > currentPosition, no adjustment needed
}

async function rotateForward() {
  if (tabHistory.length < 2) {
    return;
  }

  currentPosition = (currentPosition + 1) % tabHistory.length;
  const nextTabId = tabHistory[currentPosition];

  isRotating = true;
  chrome.tabs.update(nextTabId, { active: true });
}

async function rotateReverse() {
  if (tabHistory.length < 2) {
    return;
  }

  currentPosition = (currentPosition - 1 + tabHistory.length) % tabHistory.length;
  const nextTabId = tabHistory[currentPosition];

  isRotating = true;
  chrome.tabs.update(nextTabId, { active: true });
}

// Listen for tab activation
chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log(`Tab activated: ${activeInfo.tabId}`);

  // Ignore tab activations caused by rotation
  if (isRotating) {
    isRotating = false;
    return;
  }

  trackTabActivation(activeInfo.tabId);
});

// Listen for tab removal
chrome.tabs.onRemoved.addListener((tabId) => {
  console.log(`Tab removed: ${tabId}`);
  removeTabFromHistory(tabId);
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

export {
  trackTabActivation,
  getTabHistory,
  removeTabFromHistory,
  rotateForward,
  rotateReverse
};
