const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Exclude problematic packages from Metro
config.resolver.blockList = [/framer-motion\/.*/];

module.exports = config;
