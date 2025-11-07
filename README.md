# Rotate Active Tabs - Chrome Extension

A Chrome extension that helps you navigate between your most recently active tabs using keyboard shortcuts, similar to Alt+Tab for windows but specifically for browser tabs.

## Features

- **Tab History Tracking**: Automatically tracks your recently active tabs
- **Keyboard Shortcuts**: Quick navigation using customizable keyboard shortcuts (default: Alt+Q)
- **Configurable Settings**: Options page to customize behavior and preferences
- **Lightweight**: Minimal resource usage with efficient background processing

## Installation

### From Source (Development)

1. Clone this repository:
   ```bash
   git clone https://github.com/ticolucci/rotate-active-tabs-chrome-extension.git
   cd rotate-active-tabs-chrome-extension
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the extension directory

### From Chrome Web Store

*Coming soon*

## Usage

1. **Navigate Between Tabs**: Press `Alt+Q` (or your configured shortcut) to cycle through your recently active tabs
2. **Configure Settings**: Right-click the extension icon and select "Options" to customize preferences

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Chrome browser

### Setup

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### Project Structure

```
.
├── manifest.json          # Extension configuration
├── background.js          # Service worker (background script)
├── options.html          # Options page HTML
├── options.css           # Options page styles
├── options.js            # Options page logic
├── icons/                # Extension icons
├── __tests__/            # Test files
├── package.json          # npm configuration
├── .eslintrc.js         # ESLint configuration
├── .gitignore           # Git ignore rules
├── CLAUDE.md            # AI assistant context
├── LICENSE              # MIT License
└── README.md            # This file
```

### Architecture

This extension uses Chrome's Manifest V3 architecture:

- **Service Worker** (`background.js`): Handles tab tracking and keyboard shortcuts
- **Options Page** (`options.html/css/js`): Provides user interface for configuration
- **Chrome Storage API**: Persists user preferences and tab history

### Testing

The project uses Jest for unit testing with jsdom environment for DOM testing. Tests are located in the `__tests__/` directory.

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Code Quality

The project uses ESLint to maintain code quality:

```bash
# Check for issues
npm run lint

# Automatically fix issues
npm run lint:fix
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Thiago R. Colucci

## Acknowledgments

- Chrome Extension documentation and community
- All contributors to this project

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.
