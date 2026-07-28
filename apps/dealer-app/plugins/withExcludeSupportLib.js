const { withAppBuildGradle } = require("@expo/config-plugins");

module.exports = function withExcludeSupportLib(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      const exclusionCode = `
android {
    configurations.all {
        exclude group: 'com.android.support'
    }
}
`;
      if (!config.modResults.contents.includes("exclude group: 'com.android.support'")) {
        config.modResults.contents += exclusionCode;
      }
    }
    return config;
  });
};
