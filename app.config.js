// Builds on app.json. For the development build (APP_VARIANT=development, set in eas.json),
// use a separate app ID and name, so it installs next to the real app instead of replacing
// it (and its data).
module.exports = ({ config }) => {
  if (process.env.APP_VARIANT !== 'development') return config;
  return {
    ...config,
    name: `${config.name} (Dev)`,
    android: { ...config.android, package: `${config.android.package}.dev` },
    ios: config.ios?.bundleIdentifier
      ? { ...config.ios, bundleIdentifier: `${config.ios.bundleIdentifier}.dev` }
      : config.ios,
  };
};
