#!/usr/bin/env node

/**
 * Verification script for Chrome extension structure
 * Checks that all required files are present and valid
 */

const fs = require('fs');
const path = require('path');

const checks = {
  'manifest.json': {
    test: () => {
      const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
      return manifest.manifest_version === 3;
    },
    message: 'manifest.json exists and is Manifest V3'
  },
  'background.js': {
    test: () => fs.existsSync('background.js'),
    message: 'background.js exists'
  },
  'options.html': {
    test: () => fs.existsSync('options.html'),
    message: 'options.html exists'
  },
  'options.js': {
    test: () => fs.existsSync('options.js'),
    message: 'options.js exists'
  },
  'options.css': {
    test: () => fs.existsSync('options.css'),
    message: 'options.css exists'
  },
  'icons': {
    test: () => {
      return fs.existsSync('icons/icon16.png') &&
             fs.existsSync('icons/icon48.png') &&
             fs.existsSync('icons/icon128.png');
    },
    message: 'All required icons exist'
  },
  'package.json': {
    test: () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return pkg.devDependencies && pkg.devDependencies.jest;
    },
    message: 'package.json exists with Jest configured'
  }
};

console.log('\n🔍 Verifying Chrome Extension Structure...\n');

let allPassed = true;

for (const [name, check] of Object.entries(checks)) {
  try {
    if (check.test()) {
      console.log(`✅ ${check.message}`);
    } else {
      console.log(`❌ ${check.message} - FAILED`);
      allPassed = false;
    }
  } catch (error) {
    console.log(`❌ ${check.message} - ERROR: ${error.message}`);
    allPassed = false;
  }
}

console.log('\n' + (allPassed ? '✨ All checks passed!' : '⚠️  Some checks failed'));
process.exit(allPassed ? 0 : 1);
