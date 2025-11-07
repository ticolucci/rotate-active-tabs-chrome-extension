// Shortcuts help page script
// Handles copy-to-clipboard functionality

document.addEventListener('DOMContentLoaded', () => {
  const copyButton = document.getElementById('copyButton');
  const shortcutUrl = document.getElementById('shortcutUrl').textContent;

  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(shortcutUrl);
      copyButton.textContent = 'Copied!';
      copyButton.classList.add('copied');

      setTimeout(() => {
        copyButton.textContent = 'Copy URL';
        copyButton.classList.remove('copied');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      copyButton.textContent = 'Failed to copy';
      setTimeout(() => {
        copyButton.textContent = 'Copy URL';
      }, 2000);
    }
  });
});
