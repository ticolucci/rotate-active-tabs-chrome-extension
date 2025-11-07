// Options page script
// Handles saving and loading configuration

console.log('Options page loaded');

function getTabHistorySize() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['tabHistorySize'], (result) => {
      resolve(result.tabHistorySize || 5);
    });
  });
}

function saveTabHistorySize(size) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ tabHistorySize: size }, () => {
      resolve();
    });
  });
}

// Load saved settings when page loads
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Options page initialized');

  const input = document.getElementById('tabHistorySize');
  const saveButton = document.getElementById('saveButton');
  const statusDiv = document.getElementById('status');

  if (!input || !saveButton || !statusDiv) {
    return;
  }

  const size = await getTabHistorySize();
  input.value = size;

  saveButton.addEventListener('click', async () => {
    const newSize = parseInt(input.value, 10);

    if (newSize < 2 || newSize > 20) {
      statusDiv.textContent = 'Please enter a number between 2 and 20';
      statusDiv.className = 'status-message error';
      return;
    }

    await saveTabHistorySize(newSize);
    statusDiv.textContent = 'Settings saved!';
    statusDiv.className = 'status-message success';

    setTimeout(() => {
      statusDiv.textContent = '';
    }, 3000);
  });
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getTabHistorySize, saveTabHistorySize };
}
