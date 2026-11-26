// Metro bundler config. withUnistylesConfig lets Unistyles track which theme values each
// style uses, so styles update instantly when the phone switches light/dark mode.
const { getDefaultConfig } = require('expo/metro-config');
const { withUnistylesConfig } = require('react-native-unistyles/metro');

module.exports = withUnistylesConfig(getDefaultConfig(__dirname));
