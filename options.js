// Options page script
// Handles saving and loading configuration

console.log('Options page loaded');

function getTabHistorySize() {
  const CONFIG = typeof require !== 'undefined' ? require('./config.js') : window.CONFIG;
  const StorageService = typeof require !== 'undefined' ? require('./storage-service.js') : window.StorageService;

  return StorageService.get(
    CONFIG.STORAGE_KEYS.TAB_HISTORY_SIZE,
    CONFIG.DEFAULT_TAB_HISTORY_SIZE
  );
}

function saveTabHistorySize(size) {
  const CONFIG = typeof require !== 'undefined' ? require('./config.js') : window.CONFIG;
  const StorageService = typeof require !== 'undefined' ? require('./storage-service.js') : window.StorageService;

  return StorageService.set(CONFIG.STORAGE_KEYS.TAB_HISTORY_SIZE, size);
}

function showStatus(statusDiv, message, type) {
  const CONFIG = typeof require !== 'undefined' ? require('./config.js') : window.CONFIG;

  statusDiv.textContent = message;
  statusDiv.className = `status-message ${type}`;

  setTimeout(() => {
    statusDiv.textContent = '';
  }, CONFIG.STATUS_MESSAGE_DURATION);
}

function validateTabHistorySize(size) {
  const CONFIG = typeof require !== 'undefined' ? require('./config.js') : window.CONFIG;

  return size >= CONFIG.MIN_TAB_HISTORY_SIZE && size <= CONFIG.MAX_TAB_HISTORY_SIZE;
}

async function loadSettings() {
  const input = document.getElementById('tabHistorySize');
  const size = await getTabHistorySize();
  input.value = size;
}

function setupEventListeners() {
  const CONFIG = typeof require !== 'undefined' ? require('./config.js') : window.CONFIG;
  const input = document.getElementById('tabHistorySize');
  const saveButton = document.getElementById('saveButton');
  const statusDiv = document.getElementById('status');

  saveButton.addEventListener('click', async () => {
    const newSize = parseInt(input.value, 10);

    if (!validateTabHistorySize(newSize)) {
      showStatus(
        statusDiv,
        `Please enter a number between ${CONFIG.MIN_TAB_HISTORY_SIZE} and ${CONFIG.MAX_TAB_HISTORY_SIZE}`,
        'error'
      );
      return;
    }

    await saveTabHistorySize(newSize);
    showStatus(statusDiv, 'Settings saved!', 'success');
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

  await loadSettings();
  setupEventListeners();
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getTabHistorySize,
    saveTabHistorySize,
    showStatus,
    validateTabHistorySize,
    loadSettings,
    setupEventListeners
  };
}
