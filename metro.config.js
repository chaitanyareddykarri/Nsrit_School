const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    blockList: [
      /[\\/]android[\\/]/,
      /[\\/]ios[\\/]/,
      /[\\/]\.cxx[\\/]/,
    ].concat(defaultConfig.resolver.blockList || []),
  },
};

module.exports = mergeConfig(defaultConfig, config);
