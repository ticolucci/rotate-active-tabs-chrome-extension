export const COMMANDS = {
  ROTATE_FORWARD: 'rotate-tabs',
  ROTATE_REVERSE: 'rotate-tabs-reverse'
};

// For Jest/Node.js compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { COMMANDS };
}
