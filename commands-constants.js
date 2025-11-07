const COMMANDS = {
  ROTATE_FORWARD: 'rotate-tabs',
  ROTATE_REVERSE: 'rotate-tabs-reverse'
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { COMMANDS };
} else if (typeof window !== 'undefined') {
  window.COMMANDS = COMMANDS;
}
