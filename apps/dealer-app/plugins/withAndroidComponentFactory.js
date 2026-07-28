const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function withAndroidComponentFactory(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const application = androidManifest.manifest.application?.[0];
    if (application) {
      application.$["android:appComponentFactory"] = "androidx.core.app.CoreComponentFactory";
      const existingReplace = application.$["tools:replace"];
      if (existingReplace) {
        if (!existingReplace.includes("android:appComponentFactory")) {
          application.$["tools:replace"] = `${existingReplace},android:appComponentFactory`;
        }
      } else {
        application.$["tools:replace"] = "android:appComponentFactory";
      }
    }
    return config;
  });
};
