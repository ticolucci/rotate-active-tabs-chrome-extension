// Background service worker for the Rotate Active Tabs extension
// This will track active tabs and handle keyboard shortcuts

console.log('Rotate Active Tabs extension loaded');

// Extension installation or update
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed or updated');
});
