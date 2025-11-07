# CLAUDE.md - AI Assistant Context

## Project Overview
This is a Chrome extension called "Rotate Active Tabs" that helps users navigate between their most recently active tabs using keyboard shortcuts.

## Purpose
The extension tracks the last X active tabs and allows users to quickly switch between them, similar to Alt+Tab behavior for windows but specifically for browser tabs.

## Architecture

### Components

1. **manifest.json**
   - Chrome Extension Manifest V3 configuration
   - Defines permissions, background service worker, options page, and keyboard shortcuts
   - Uses `tabs` and `storage` permissions

2. **background.js** (Service Worker)
   - Background service worker that runs persistently
   - Will track tab activation events
   - Handles keyboard shortcut commands
   - Maintains history of active tabs

3. **options.html / options.css / options.js**
   - Configuration page for the extension
   - Accessible via right-click on extension icon > Options
   - Will allow users to customize settings like:
     - Number of tabs to track in history
     - Custom keyboard shortcuts
     - Other preferences

4. **icons/**
   - Extension icons in multiple sizes (16x16, 48x48, 128x128)
   - Currently placeholder images

### Technology Stack
- Pure JavaScript (no frameworks)
- Chrome Extension API (Manifest V3)
- Jest for testing
- ESLint for code quality

### Development Workflow
1. Make changes to source files
2. Run `npm run lint` to check code quality
3. Run `npm test` to run tests
4. Load extension in Chrome via chrome://extensions/ (Developer Mode)

## Key Features (Planned)
1. Track last N active tabs in a history stack
2. Keyboard shortcut (Alt+Q by default) to cycle through tab history
3. Configurable settings via options page
4. Persistent storage of preferences

## Chrome Extension Concepts

### Manifest V3
- Uses service workers instead of background pages
- More secure and performant
- Event-driven architecture

### Permissions
- `tabs`: Required to access tab information and switch between tabs
- `storage`: Required to persist user preferences and tab history

### Service Worker Lifecycle
- Service worker starts when needed and stops when idle
- Must handle events asynchronously
- Cannot use DOM APIs directly (use offscreen documents if needed)

## Testing Strategy
- Unit tests for utility functions
- Mock Chrome APIs in tests
- Test coverage for critical paths
- Integration tests for tab tracking logic

## Development Notes
- Follow ES6+ JavaScript standards
- Use async/await for asynchronous operations
- Keep code modular and testable
- Document complex logic with comments
- Use Chrome's official API documentation as reference

## Resources
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome Extension API Reference](https://developer.chrome.com/docs/extensions/reference/)

## Contributing
When working on this project:
1. Understand the extension architecture before making changes
2. Test in Chrome with Developer Mode enabled
3. Follow existing code style and patterns
4. Add tests for new functionality
5. Update documentation as needed
