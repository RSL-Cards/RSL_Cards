// Extends app.json. Release builds (EAS "preview"/"production" profiles) must not allow plain-HTTP
// traffic; development builds keep it so the app can reach a backend on the local network.
module.exports = ({ config }) => {
  const isReleaseBuild = ["preview", "production"].includes(process.env.EAS_BUILD_PROFILE);

  return {
    ...config,
    plugins: (config.plugins ?? []).map((plugin) => {
      if (!Array.isArray(plugin) || plugin[0] !== "expo-build-properties") return plugin;
      const [name, options = {}] = plugin;
      return [name, { ...options, android: { ...options.android, usesCleartextTraffic: !isReleaseBuild } }];
    }),
  };
};
