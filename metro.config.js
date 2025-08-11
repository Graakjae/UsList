const { getDefaultConfig } = require("@expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push("mjs");
config.resolver.sourceExts.push("cjs");

config.resolver.unstable_enablePackageExports = false;

// Disable Watchman to avoid permission issues
config.watchFolders = [];
config.resolver.useWatchman = false;

module.exports = config;
