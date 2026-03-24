module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // @tamagui/babel-plugin is incompatible with React 19 at runtime load.
      // Re-enable when Tamagui 2.x stable ships with React 19 support.
      // ['@tamagui/babel-plugin', { components: ['tamagui'], config: './tamagui.config.ts' }],
      'react-native-reanimated/plugin',
    ],
  };
};
