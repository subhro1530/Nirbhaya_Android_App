module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"], // or 'module:metro-react-native-babel-preset' for bare React Native
    plugins: [
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
          blacklist: null,
          whitelist: null,
          safe: false,
          allowUndefined: true,
        },
      ],
    ],
  };
};
