# Metro Bundler Monorepo Version Conflicts

## Problem Description

When running `npx expo start` in a pnpm monorepo, Metro bundler fails with various version-related errors:

### Common Error Messages

```
Error: Cannot find module 'metro/private/lib/TerminalReporter'
Error: Cannot find module 'metro-core/private/canonicalize'
Error [ERR_PACKAGE_PATH_NOT_EXPORTED]: Package subpath './src/lib/TerminalReporter' is not defined by "exports"
TypeError: Cannot read property 'S' of undefined
TypeError: Cannot read property 'default' of undefined
```

### Root Cause

The monorepo root `node_modules` has Metro/Expo package versions that conflict with the dealer-app's requirements. In a pnpm monorepo, packages are hoisted to the root, and when the dealer-app tries to use its own Metro version, it conflicts with the root's versions.

This typically happens when:
- The monorepo root has newer/older Expo or Metro packages
- The dealer-app has different Expo SDK version requirements
- pnpm workspace hoisting causes version mismatches

## Solution

The fix is to **align the dealer-app's versions with what the monorepo expects**:

### 1. Update dealer-app package.json to use Expo SDK 54 + expo-router 6.x + React 19

```json
{
  "dependencies": {
    "expo": "~54.0.33",
    "expo-router": "~6.0.23",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-native": "0.81.5",
    "react-native-reanimated": "~4.1.1"
  },
  "devDependencies": {
    "@types/react": "~19.1.10"
  }
}
```

### 2. Update root package.json overrides to match

```json
{
  "pnpm": {
    "overrides": {
      "react": "19.1.0",
      "react-native": "0.81.5",
      "react-dom": "19.1.0",
      "@types/react": "~19.1.10"
    }
  }
}
```

### 3. Simplify metro.config.js to remove monorepo watchFolders

```javascript
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Exclude problematic packages from Metro
config.resolver.blockList = [
  /framer-motion\/.*/,
];

module.exports = config;
```

### 4. Reinstall dependencies and clear caches

```bash
# From monorepo root
pnpm install --force

# Clear all caches
watchman watch-del-all
rm -rf apps/dealer-app/.expo
rm -rf apps/dealer-app/.metro
rm -rf ~/.metro
rm -rf node_modules/.cache

# Start Expo
cd apps/dealer-app
npx expo start --clear
```

## Prevention Tips

### 1. Version Alignment
Always ensure the dealer-app's Expo SDK, expo-router, and React versions are compatible:
- **Expo SDK 54** requires expo-router ~6.0.23 and React 19
- **Expo SDK 52** requires expo-router 5.1.11 and React 18 (but may conflict with monorepo)

### 2. Check Version Warnings
Pay attention to Expo's version warnings when starting:
```
The following packages should be updated for best compatibility:
  expo-router@5.1.11 - expected version: ~6.0.23
  react@18.3.1 - expected version: 19.1.0
```

These warnings indicate version mismatches that will cause Metro errors.

### 3. Avoid Metro Overrides in Root
Don't add `metro`, `metro-config`, or `metro-core` to root package.json overrides unless absolutely necessary. Let each package manage its own Metro versions.

### 4. Clean Caches After Version Changes
Always clear all caches after changing dependency versions:
- `.expo` folder
- `.metro` folder
- `~/.metro` folder
- `node_modules/.cache`
- Watchman watches

### 5. Use pnpm --force After Breaking Changes
When changing major versions (React, Expo SDK), use `pnpm install --force` to ensure clean installation.

## What NOT to Do

### ❌ Don't downgrade Expo SDK in monorepo
Downgrading dealer-app to Expo SDK 52 while the monorepo root expects SDK 54+ will cause Metro conflicts.

### ❌ Don't add Metro version overrides to root
Adding `metro: "~0.80.0"` to root overrides often causes more conflicts due to metro-config/metro-core version mismatches.

### ❌ Don't mix FlashList with incompatible Reanimated
FlashList (@shopify/flash-list) requires react-native-reanimated. If you remove Reanimated, replace FlashList with FlatList.

### ❌ Don't ignore version warnings
Expo's version warnings are accurate indicators of potential Metro bundler issues.

## Quick Fix Checklist

If you see Metro bundler errors:

1. Check Expo version warnings when starting
2. Verify dealer-app Expo SDK matches monorepo expectations (SDK 54)
3. Verify expo-router version matches Expo SDK (6.x for SDK 54)
4. Verify React version matches expo-router requirements (19 for expo-router 6.x)
5. Update root package.json overrides to match
6. Run `pnpm install --force` from monorepo root
7. Clear all caches (watchman, .expo, .metro, node_modules/.cache)
8. Run `npx expo start --clear`

## Current Working Configuration (as of 2024-04-16)

**dealer-app/package.json:**
```json
{
  "dependencies": {
    "expo": "~54.0.33",
    "expo-router": "~6.0.23",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-native": "0.81.5",
    "react-native-reanimated": "~4.1.1"
  }
}
```

**package.json (root):**
```json
{
  "pnpm": {
    "overrides": {
      "react": "19.1.0",
      "react-native": "0.81.5",
      "react-dom": "19.1.0",
      "@types/react": "~19.1.10"
    }
  }
}
```

**babel.config.js:**
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { unstable_transformImportMeta: true }]],
    plugins: ["react-native-reanimated/plugin"],
  };
};
```

**metro.config.js:**
```javascript
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [
  /framer-motion\/.*/,
];

module.exports = config;
```
